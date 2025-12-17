import { NextRequest, NextResponse } from 'next/server';
import { getAdvertiserStatsOverTime } from '../../../../../utils/supabase_manager';

export async function GET(req: NextRequest, { params }: { params: { advertiserId: number } }) {
  try {
    const { advertiserId } = params;
    const startDate = req.nextUrl.searchParams.get('startDate');
    const endDate = req.nextUrl.searchParams.get('endDate');

    const { data, error } = await getAdvertiserStatsOverTime(
      advertiserId,
      startDate,
      endDate
    );

    if (error) {
      console.error('Error fetching advertiser stats:', error);
      return NextResponse.json({ error: 'Failed to fetch advertiser stats' }, { status: 500 });
    }

    return NextResponse.json({ stats: data }, { status: 200 });
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}