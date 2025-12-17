import { NextRequest, NextResponse } from 'next/server';
import { getRowsFromTable } from '../../../../../../utils/supabase_manager';

export async function GET(req: NextRequest, { params }: { params: { campaignId: string } }) {
  try {
    const { campaignId } = params;
    const startDate = req.nextUrl.searchParams.get('startDate');
    const endDate = req.nextUrl.searchParams.get('endDate');

    // Get campaign categories for this campaign
    const { data: campaignCategories, error: categoriesError } = await getRowsFromTable('campaign_categories', {
      filters: { campaign_id: parseInt(campaignId), active: true }
    });

    if (categoriesError || !campaignCategories) {
      console.error('Error fetching campaign categories:', categoriesError);
      return NextResponse.json({ error: 'Failed to fetch campaign categories' }, { status: 500 });
    }

    if (campaignCategories.length === 0) {
      return NextResponse.json({
        stats: {
          timeSeriesData: [],
          keywordStats: []
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
        statsMap.get(date).spend += (impression.bid || 0) * 100000;
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
        // Add click cost (bid amount)
        statsMap.get(date).spend += (click.bid || 0) * 100000;
      });
    }

    // Convert to array and sort
    const timeSeriesData = Array.from(statsMap.values()).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Get advertising categories (keywords) for this campaign
    const advertisingCategoryIds = campaignCategories.map((cc: any) => cc.advertising_category_id);

    const { data: advertisingCategories, error: advertisingCategoriesError } = await getRowsFromTable('advertising_categories', {
      inFilters: { id: advertisingCategoryIds }
    });

    if (advertisingCategoriesError) {
      console.error('Error fetching advertising categories:', advertisingCategoriesError);
      return NextResponse.json({ error: 'Failed to fetch keywords' }, { status: 500 });
    }

    // Create keyword stats map
    const keywordStats = new Map();

    // Initialize keyword stats
    if (advertisingCategories) {
      advertisingCategories.forEach((category: any) => {
        keywordStats.set(category.id, {
          id: category.id,
          keyword: category.keyword_string,
          impressions: 0,
          clicks: 0,
          spend: 0
        });
      });
    }

    // Count impressions by keyword
    if (impressions && advertisingCategories) {
      impressions.forEach((impression: any) => {
        const campaignCategory = campaignCategories.find((cc: any) => cc.id === impression.campaign_category_id);
        if (campaignCategory && keywordStats.has(campaignCategory.advertising_category_id)) {
          keywordStats.get(campaignCategory.advertising_category_id).impressions++;
          keywordStats.get(campaignCategory.advertising_category_id).spend += (impression.bid || 0) * 100000;
        }
      });
    }

    // Count clicks by keyword
    if (clicks && advertisingCategories) {
      clicks.forEach((click: any) => {
        const campaignCategory = campaignCategories.find((cc: any) => cc.id === click.campaign_category_id);
        if (campaignCategory && keywordStats.has(campaignCategory.advertising_category_id)) {
          keywordStats.get(campaignCategory.advertising_category_id).clicks++;
          keywordStats.get(campaignCategory.advertising_category_id).spend += (click.bid || 0) * 100000;
        }
      });
    }

    const keywordStatsArray = Array.from(keywordStats.values());

    return NextResponse.json({
      stats: {
        timeSeriesData,
        keywordStats: keywordStatsArray
      }
    }, { status: 200 });

  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}