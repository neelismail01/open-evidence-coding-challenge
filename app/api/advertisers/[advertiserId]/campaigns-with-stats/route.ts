import { NextRequest, NextResponse } from 'next/server';
import { SUPABASE_TABLE_NAME_CAMPAIGNS } from '../../../../../utils/constants';
import { getRowsFromTable } from '../../../../../utils/supabase_manager';

interface CampaignWithStats {
  id: number;
  created_at: string;
  treatment_name: string;
  description: string;
  impressions_count: number;
  clicks_count: number;
  active: boolean;
  total_cost: number;
  cost_per_click: number;
  product_url?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { advertiserId: string } }
) {
  try {
    const { advertiserId } = params;
    const startDate = request.nextUrl.searchParams.get('startDate');
    const endDate = request.nextUrl.searchParams.get('endDate');

    if (!advertiserId) {
      return NextResponse.json(
        { error: 'advertiserId is required' },
        { status: 400 }
      );
    }

    // Step 1: Fetch all campaigns for this advertiser
    const { data: campaigns, error: campaignsError } = await getRowsFromTable(
      SUPABASE_TABLE_NAME_CAMPAIGNS,
      {
        filters: { company_id: parseInt(advertiserId) }
      }
    );

    if (campaignsError || !campaigns) {
      console.error('Error fetching campaigns:', campaignsError);
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }

    if (campaigns.length === 0) {
      return NextResponse.json({ campaigns: [] }, { status: 200 });
    }

    const campaignIds = campaigns.map((c: any) => c.id);

    // Step 2: Fetch all campaign categories for all campaigns at once
    const { data: campaignCategories, error: categoriesError } = await getRowsFromTable(
      'campaign_categories',
      {
        inFilters: { campaign_id: campaignIds },
        filters: { active: true }
      }
    );

    if (categoriesError) {
      console.error('Error fetching campaign categories:', categoriesError);
      return NextResponse.json({ error: 'Failed to fetch campaign categories' }, { status: 500 });
    }

    if (!campaignCategories || campaignCategories.length === 0) {
      // Return campaigns with zero stats
      const campaignsWithStats = campaigns.map((campaign: any) => ({
        ...campaign,
        impressions_count: 0,
        clicks_count: 0,
        total_cost: 0,
        cost_per_click: 0
      }));
      return NextResponse.json({ campaigns: campaignsWithStats }, { status: 200 });
    }

    const categoryIds = campaignCategories.map((cc: any) => cc.id);

    // Build date filters
    const dateFilter = startDate && endDate ? {
      dateRange: { column: 'created_at', from: startDate, to: endDate }
    } : {};

    // Step 3: Fetch all impressions for all categories at once
    const { data: impressions, error: impressionsError } = await getRowsFromTable(
      'impressions',
      {
        inFilters: { campaign_category_id: categoryIds },
        ...dateFilter
      }
    );

    // Step 4: Fetch all clicks for all categories at once
    const { data: clicks, error: clicksError } = await getRowsFromTable(
      'clicks',
      {
        inFilters: { campaign_category_id: categoryIds },
        ...dateFilter
      }
    );

    if (impressionsError || clicksError) {
      console.error('Error fetching impressions/clicks:', impressionsError, clicksError);
      return NextResponse.json({ error: 'Failed to fetch campaign stats' }, { status: 500 });
    }

    // Step 5: Aggregate stats by campaign in memory
    const campaignStatsMap = new Map<number, {
      impressions_count: number;
      clicks_count: number;
      total_cost: number;
    }>();

    // Initialize stats for all campaigns
    campaigns.forEach((campaign: any) => {
      campaignStatsMap.set(campaign.id, {
        impressions_count: 0,
        clicks_count: 0,
        total_cost: 0
      });
    });

    // Create mapping from campaign_category_id to campaign_id
    const categoryToCampaignMap = new Map<number, number>();
    campaignCategories.forEach((cc: any) => {
      categoryToCampaignMap.set(cc.id, cc.campaign_id);
    });

    // Count impressions and calculate cost
    if (impressions) {
      impressions.forEach((impression: any) => {
        const campaignId = categoryToCampaignMap.get(impression.campaign_category_id);
        if (campaignId && campaignStatsMap.has(campaignId)) {
          const stats = campaignStatsMap.get(campaignId)!;
          stats.impressions_count++;
          stats.total_cost += (impression.bid || 0);
        }
      });
    }

    // Count clicks and calculate cost
    if (clicks) {
      clicks.forEach((click: any) => {
        const campaignId = categoryToCampaignMap.get(click.campaign_category_id);
        if (campaignId && campaignStatsMap.has(campaignId)) {
          const stats = campaignStatsMap.get(campaignId)!;
          stats.clicks_count++;
          stats.total_cost += (click.bid || 0);
        }
      });
    }

    // Step 6: Combine campaigns with their stats
    const campaignsWithStats: CampaignWithStats[] = campaigns.map((campaign: any) => {
      const stats = campaignStatsMap.get(campaign.id) || {
        impressions_count: 0,
        clicks_count: 0,
        total_cost: 0
      };

      return {
        ...campaign,
        impressions_count: stats.impressions_count,
        clicks_count: stats.clicks_count,
        total_cost: stats.total_cost,
        cost_per_click: stats.clicks_count > 0 ? stats.total_cost / stats.clicks_count : 0
      };
    });

    return NextResponse.json({ campaigns: campaignsWithStats }, { status: 200 });

  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
