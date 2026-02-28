import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Case from '@/models/Case';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Parse URL parameters
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'hot'; // hot, new, top
    const system = searchParams.get('system');
    const difficulty = searchParams.get('difficulty');
    const style = searchParams.get('style');
    const status = searchParams.get('status'); // all, needs_review, approved
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build the query
    const query: any = {
        // Only show cases that are either needs review or approved in the community feed
        status: { $in: ['needs_review', 'community_approved', 'library_promoted'] }
    };

    if (status && status !== 'all') {
        if (status === 'needs_review') query.status = 'needs_review';
        if (status === 'approved') query.status = { $in: ['community_approved', 'library_promoted'] };
    }
    
    if (system) query.systemTags = system;
    if (difficulty) query.difficulty = parseInt(difficulty);
    if (style) query.style = style;

    // Build sort object
    let sortObj: any = { createdAt: -1 }; // new by default
    if (sort === 'hot') {
        // Simple hotness alg: score heavily weighted against age
        // For MVP, we'll just sort by score descending then createdAt
        sortObj = { 'community.score': -1, createdAt: -1 };
    } else if (sort === 'top') {
        sortObj = { 'community.score': -1 };
    }

    const cases = await Case.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .select('title systemTags difficulty style status metrics community createdAt')
        .lean();

    const total = await Case.countDocuments(query);

    return NextResponse.json({
        success: true,
        cases,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit)
        }
    });

  } catch (error: any) {
    console.error('Error fetching community feed:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
