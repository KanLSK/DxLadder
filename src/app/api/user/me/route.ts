import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Play from '@/models/Play';

// We use a hardcoded demo user email for the MVP since we lack full Auth
const DEMO_USER_EMAIL = 'demo@dxladder.com';

export async function GET() {
  try {
    await dbConnect();

    // 1. Try to fetch the existing demo user
    let user = await User.findOne({ email: DEMO_USER_EMAIL });

    // 2. If it doesn't exist, create it (Seed)
    if (!user) {
      user = await User.create({
        email: DEMO_USER_EMAIL,
        displayName: 'Dr. Smith',
        level: 'Resident',
        stats: {
          totalSolved: 0,
          currentStreak: 0,
          longestStreak: 0,
          rank: 100, // Top 100% since no plays yet
        },
        systemMastery: new Map(), // Empty to start
      });
    }

    // 3. Fetch recent activity for the dashboard
    const recentActivityRaw = await Play.find({ userKey: String(user._id) })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

    // In a real app we'd populate the Case reference to get the title & system.
    // For MVP, we will extract what we can or just return the raw array.
    // Let's assume the Case is either CaseLibrary or CaseGenerated. 
    // Since Play doesn't strictly lean() with populated references simply, we'll map the raw plays.
    
    // We basically just need: id, title (fallback), system, date, solved length.
    const recentActivity = await Promise.all(recentActivityRaw.map(async (play: any) => {
        let title = "Unknown Case";
        let system = "General";
        
        try {
            if (play.caseType === 'library') {
                 const mongoose = require('mongoose');
                 const libCase = await mongoose.model('CaseLibrary').findById(play.caseId).select('finalDiagnosis systemTags');
                 if (libCase) {
                     title = libCase.finalDiagnosis;
                     system = libCase.systemTags?.[0] || 'General';
                 }
            } else if (play.caseType === 'generated') {
                 const mongoose = require('mongoose');
                 const genCase = await mongoose.model('CaseGenerated').findById(play.caseId).select('payload.finalDiagnosis payload.systemTags');
                 if (genCase) {
                     title = genCase.payload?.finalDiagnosis || "AI Case";
                     system = genCase.payload?.systemTags?.[0] || 'General';
                 }
            }
        } catch(e) { /* ignore */ }

        return {
             id: play._id,
             title,
             system,
             date: play.createdAt,
             attempts: play.attempts,
             solved: play.solved
        };
    }));

    // Return the user stats
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        displayName: user.displayName,
        level: user.level,
        stats: user.stats,
        // Convert Map to plain object for JSON serialization
        systemMastery: Object.fromEntries(user.systemMastery), 
        recentActivity
      }
    });

  } catch (error: any) {
    console.error('Failed to fetch user profile:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
