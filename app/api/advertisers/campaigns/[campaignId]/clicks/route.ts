import { getCampaignClickCount } from '@/server/supabase_manager';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { campaignId: string } }) {
  const { campaignId } = params;
  const startDate = req.nextUrl.searchParams.get('startDate');
  const endDate = req.nextUrl.searchParams.get('endDate');

  try {
    const { data, error } = await getCampaignClickCount(Number(campaignId), startDate, endDate);

    if (error) {
      console.error('Error fetching click count:', error);
      return NextResponse.json({ error: 'Failed to fetch click count' }, { status: 500 });
    }

    return NextResponse.json({ click_count: data }, { status: 200 });
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}