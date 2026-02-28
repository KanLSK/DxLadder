import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Play from '@/models/Play';

const DEMO_USER_EMAIL = 'demo@dxladder.com';

export async function GET() {
  try {
    await dbConnect();
    
    // Run both queries in parallel
    const [user, recentPlays] = await Promise.all([
      User.findOne({ email: DEMO_USER_EMAIL }).lean(),
      Play.find({})
        .sort({ createdAt: -1 })
        .limit(30)
        .select('solved createdAt')
        .lean()
    ]);

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Build heatmap from real play data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const heatmapValues = Array(30).fill(0);
    recentPlays.forEach((play: any) => {
      if (!play.createdAt) return;
      const diffTime = Math.abs(new Date(play.createdAt).getTime() - thirtyDaysAgo.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 30) {
        heatmapValues[diffDays] += play.solved ? 0.4 : 0.1;
        if (heatmapValues[diffDays] > 1) heatmapValues[diffDays] = 1;
      }
    });

    // Build radar data from systemMastery
    const masteryObj = user.systemMastery instanceof Map
      ? Object.fromEntries(user.systemMastery)
      : (user.systemMastery || {});

    const radarData = Object.entries(masteryObj).map(([system, data]: [string, any]) => ({
      system,
      accuracy: data.attempted > 0 ? Math.round((data.solved / data.attempted) * 100) : 0,
      volume: data.attempted
    }));

    // Find weakest system
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

    const avgSteps = user.stats.totalSolved > 0 ? 3.1 : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalSolved: user.stats.totalSolved,
        rank: user.stats.rank,
        avgSteps
      },
      heatmap: heatmapValues,
      radar: radarData,
      recommendation
    });

  } catch (error: any) {
    console.error('Failed to fetch user progress:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
