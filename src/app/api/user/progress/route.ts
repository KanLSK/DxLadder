import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Play from '@/models/Play';

const DEMO_USER_EMAIL = 'demo@dxladder.com';

export async function GET() {
  try {
    await dbConnect();
    
    // Find Demo User
    const user = await User.findOne({ email: DEMO_USER_EMAIL });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Aggregate user's play history for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPlays = await Play.find({
      userKey: user._id.toString(), // For the MVP, we store the MongoDB User ObjectId string in userKey
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: 1 });

    // Build the heatmap 30x4 array (just raw intensity values 0-1 for now based on solved/attempted ratios)
    // Normally we'd group by day. For this mock UI, we just send a flat array of "activity intensity" per day
    const heatmapValues = Array(30).fill(0).map(() => Math.random() * 0.5); // Baseline mock data
    
    // Enhance mockup data with real data if it exists
    recentPlays.forEach((play: any) => {
        // Find which day offset it belongs to (0-29)
        const diffTime = Math.abs(play.createdAt.getTime() - thirtyDaysAgo.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 30) {
            heatmapValues[diffDays] += play.solved ? 0.4 : 0.1;
            if (heatmapValues[diffDays] > 1) heatmapValues[diffDays] = 1;
        }
    });

    // Calculate radar data from systemMastery Map
    const radarData = Array.from(user.systemMastery.entries()).map(([system, data]: [string, any]) => ({
       system,
       accuracy: data.attempted > 0 ? Math.round((data.solved / data.attempted) * 100) : 0,
       volume: data.attempted
    }));

    // Find the weakest system to recommend
    let recommendation = { system: 'General Practice', message: 'Keep up the good work. Try a random sprint.' };
    if (radarData.length > 0) {
        const weakest = radarData.reduce((prev, curr) => prev.accuracy < curr.accuracy ? prev : curr);
        if (weakest.accuracy < 60) {
           recommendation = { 
               system: weakest.system, 
               message: `Your accuracy on ${weakest.system.toLowerCase()} cases indicates this is a high-yield area for review.` 
           };
        }
    }

    // Calc avg steps without error (mocking the reduction logic for now)
    const avgSteps = user.stats.totalSolved > 0 ? 3.1 : 0; 
    
    return NextResponse.json({
      success: true,
      stats: {
        totalSolved: user.stats.totalSolved,
        rank: user.stats.rank,
        avgSteps: avgSteps
      },
      heatmap: heatmapValues,
      radar: radarData,
      recommendation: recommendation
    });

  } catch (error: any) {
    console.error('Failed to fetch user progress:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
