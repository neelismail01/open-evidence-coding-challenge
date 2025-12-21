import { NextRequest, NextResponse } from 'next/server';
import { getRowsFromTable } from '../../../../../../server/supabase_manager';

export async function GET(req: NextRequest, { params }: { params: { campaignId: string } }) {
  try {
    const { campaignId } = params;
    const startDate = req.nextUrl.searchParams.get('startDate');
    const endDate = req.nextUrl.searchParams.get('endDate');

    // Get campaign categories for this campaign
    const { data: campaignCategories, error: categoriesError } = await getRowsFromTable('campaign_categories', {
      filters: { campaign_id: parseInt(campaignId) }
    });

    if (categoriesError || !campaignCategories) {
      console.error('Error fetching campaign categories:', categoriesError);
      return NextResponse.json({ error: 'Failed to fetch campaign categories' }, { status: 500 });
    }

    if (campaignCategories.length === 0) {
      return NextResponse.json({
        stats: {
          timeSeriesData: [],
          categoryStats: [],
          summary: {
            totalImpressions: 0,
            totalClicks: 0,
            totalSpend: 0
          }
        }
      }, { status: 200 });
    }

    const categoryIds = campaignCategories.map((cc: any) => cc.id);

    // Build date filters
    const dateFilter = startDate && endDate ? {
      dateRange: { column: 'created_at', from: startDate, to: endDate }
    } : {};

    // Get impressions
    const { data: impressions, error: impressionsError } = await getRowsFromTable('impressions', {
      inFilters: { campaign_category_id: categoryIds },
      ...dateFilter,
      orderBy: { column: 'created_at', ascending: true }
    });

    // Get clicks
    const { data: clicks, error: clicksError } = await getRowsFromTable('clicks', {
      inFilters: { campaign_category_id: categoryIds },
      ...dateFilter,
      orderBy: { column: 'created_at', ascending: true }
    });

    if (impressionsError || clicksError) {
      console.error('Error fetching impressions/clicks:', impressionsError, clicksError);
      return NextResponse.json({ error: 'Failed to fetch campaign data' }, { status: 500 });
    }

    // Group by date (day)
    const statsMap = new Map();

    // Process impressions
    if (impressions) {
      impressions.forEach((impression: any) => {
        const date = new Date(impression.created_at).toISOString().split('T')[0]; // YYYY-MM-DD
        if (!statsMap.has(date)) {
          statsMap.set(date, { date, impressions: 0, clicks: 0, spend: 0 });
        }
        statsMap.get(date).impressions++;
        // Add impression cost (bid amount)
        statsMap.get(date).spend += (impression.bid || 0);
      });
    }

    // Process clicks
    if (clicks) {
      clicks.forEach((click: any) => {
        const date = new Date(click.created_at).toISOString().split('T')[0]; // YYYY-MM-DD
        if (!statsMap.has(date)) {
          statsMap.set(date, { date, impressions: 0, clicks: 0, spend: 0 });
        }
        statsMap.get(date).clicks++;
      });
    }

    // Convert to array and sort
    const timeSeriesData = Array.from(statsMap.values()).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Get advertising categories (Categories) for this campaign
    const advertisingCategoryIds = campaignCategories.map((cc: any) => cc.advertising_category_id);

    const { data: advertisingCategories, error: advertisingCategoriesError } = await getRowsFromTable('advertising_categories', {
      inFilters: { id: advertisingCategoryIds }
    });

    if (advertisingCategoriesError) {
      console.error('Error fetching advertising categories:', advertisingCategoriesError);
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }

    // Create category stats map
    const categoryStats = new Map();

    // Initialize category stats
    if (advertisingCategories) {
      advertisingCategories.forEach((category: any) => {
        categoryStats.set(category.id, {
          id: category.id,
          category: category.category_string,
          impressions: 0,
          clicks: 0,
          spend: 0
        });
      });
    }

    // Count impressions by category
    if (impressions && advertisingCategories) {
      impressions.forEach((impression: any) => {
        const campaignCategory = campaignCategories.find((cc: any) => cc.id === impression.campaign_category_id) as any;
        if (campaignCategory && categoryStats.has(campaignCategory.advertising_category_id)) {
          categoryStats.get(campaignCategory.advertising_category_id)!.impressions++;
          categoryStats.get(campaignCategory.advertising_category_id)!.spend += (impression.bid || 0);
        }
      });
    }

    // Count clicks by category
    if (clicks && advertisingCategories) {
      clicks.forEach((click: any) => {
        const campaignCategory = campaignCategories.find((cc: any) => cc.id === click.campaign_category_id) as any;
        if (campaignCategory && categoryStats.has(campaignCategory.advertising_category_id)) {
          categoryStats.get(campaignCategory.advertising_category_id)!.clicks++;
        }
      });
    }

    const categoryStatsArray = Array.from(categoryStats.values());

    // Calculate summary statistics
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpend = 0;

    if (impressions) {
      totalImpressions = impressions.length;
      totalSpend = impressions.reduce((sum: number, impression: any) => sum + (impression.bid || 0), 0);
    }

    if (clicks) {
      totalClicks = clicks.length;
    }

    return NextResponse.json({
      stats: {
        timeSeriesData,
        categoryStats: categoryStatsArray,
        summary: {
          totalImpressions,
          totalClicks,
          totalSpend
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}