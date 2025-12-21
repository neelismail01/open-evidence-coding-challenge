
import { NextRequest, NextResponse } from 'next/server';
import { getCampaignImpressionCount } from '../../../../../../server/supabase_manager';

export async function GET(req: NextRequest, { params }: { params: { campaignId: number } }) {
  try {
    const { campaignId } = params;
    const startDate = req.nextUrl.searchParams.get('startDate');
    const endDate = req.nextUrl.searchParams.get('endDate');
    const { data, error } = await getCampaignImpressionCount(campaignId, startDate, endDate);

    if (error) {
      console.error('Error fetching impression count:', error);
      return NextResponse.json({ error: 'Failed to fetch impression count' }, { status: 500 });
    }

    return NextResponse.json({ impression_count: data }, { status: 200 });
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
