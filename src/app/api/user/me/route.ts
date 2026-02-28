import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Play from '@/models/Play';
import Case from '@/models/Case';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();

    // Get the authenticated session
    const session = await auth();
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Run user + play queries in parallel
    const [user, recentPlays] = await Promise.all([
      User.findOne({ email: userEmail }).lean(),
      Play.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('caseId solved attempts createdAt')
        .lean()
    ]);

    // Seed user if not found (shouldn't happen if signIn callback works, but just in case)
    if (!user) {
      const newUser = await User.create({
        email: userEmail,
        displayName: session.user?.name || userEmail.split('@')[0],
        level: 'Medical Student',
        stats: { totalSolved: 0, currentStreak: 0, longestStreak: 0, rank: 100 },
        systemMastery: new Map(),
      });

      return NextResponse.json({
        success: true,
        user: {
          id: newUser._id,
          displayName: newUser.displayName,
          level: newUser.level,
          stats: newUser.stats,
          systemMastery: {},
          recentActivity: []
        }
      });
    }

    // Batch-fetch all referenced cases in ONE query instead of N+1
    const caseIds = recentPlays
      .filter((p: any) => p.caseId)
      .map((p: any) => p.caseId);

    const casesMap = new Map();

    if (caseIds.length > 0) {
      const cases = await Case.find({ _id: { $in: caseIds } })
        .select('title systemTags contentPrivate.diagnosis')
        .lean();

      cases.forEach((c: any) => {
        casesMap.set(String(c._id), c);
      });
    }

    // Map plays to activity without individual DB calls
    const recentActivity = recentPlays.map((play: any) => {
      const caseDoc = casesMap.get(String(play.caseId));
      return {
        id: play._id,
        title: caseDoc?.title || caseDoc?.contentPrivate?.diagnosis || 'Unknown Case',
        system: caseDoc?.systemTags?.[0] || 'General',
        date: play.createdAt,
        attempts: play.attempts,
        solved: play.solved
      };
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        displayName: user.displayName,
        level: user.level,
        stats: user.stats,
        systemMastery: user.systemMastery instanceof Map
          ? Object.fromEntries(user.systemMastery)
          : (user.systemMastery || {}),
        recentActivity
      }
    });

  } catch (error: any) {
    console.error('Failed to fetch user profile:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
