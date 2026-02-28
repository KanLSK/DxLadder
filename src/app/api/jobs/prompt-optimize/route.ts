import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Case from '@/models/Case';
import PromptProfile from '@/models/PromptProfile';

export async function POST(request: Request) {
  try {
    await dbConnect();

    // 1. Find all active prompt profiles
    const profiles = await PromptProfile.find({ isActive: true });
    
    let updatedCount = 0;

    // 2. Aggregate case performance per profile version
    for (const profile of profiles) {
        const cases = await Case.find({ 'promptMeta.promptVersion': profile.version });
        
        if (cases.length === 0) continue;

        let totalScore = 0;
        let totalRealism = 0;
        let countRealism = 0;

        for (const c of cases) {
            if (c.community) {
                totalScore += (c.community.score || 0);
                if (c.community.realismAvg) {
                    totalRealism += c.community.realismAvg;
                    countRealism++;
                }
            }
        }

        const avgScore = totalScore / cases.length;
        const avgRealism = countRealism > 0 ? (totalRealism / countRealism) : 0;

        // 3. Update profile performance metrics
        profile.performanceMetrics = {
            averageCommunityScore: avgScore,
            averageRealismRating: avgRealism,
            totalCasesGenerated: cases.length
        };

        // 4. (Future Loop) Auto-tune parameters if realism is low
        // This is a placeholder for where the LLM might be invoked to adjust weights
        // if (avgRealism < 3.0) { profile.parameters.noiseLevel *= 0.8; }

        await profile.save();
        updatedCount++;
    }

    return NextResponse.json({ 
        success: true, 
        message: `Calculated optimization metrics for ${updatedCount} prompt profiles.` 
    });

  } catch (error: any) {
    console.error('Error in prompt optimization job:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
