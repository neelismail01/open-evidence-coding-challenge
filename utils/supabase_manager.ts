import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

type FilterOptions = {
  filters?: Record<string, any>;
  inFilters?: Record<string, any[]>; // New: for 'in' operator
  limit?: number;
  orderBy?: { column: string; ascending?: boolean };
  selectString?: string; // New: for custom select queries including joins
  dateRange?: { column: string, from: string, to: string }; // New: for date range filters
};

export async function getRowsFromTable<T>(
  tableName: string,
  options?: FilterOptions
): Promise<{ data: T[] | null; error: any }> {

  let query = supabase.from(tableName).select(options?.selectString || '*');

  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  if (options?.inFilters) { // New: handle 'in' filters
    Object.entries(options.inFilters).forEach(([key, value]) => {
      query = query.in(key, value);
    });
  }

  if (options?.dateRange) { // New: handle date range filters
    query = query.gte(options.dateRange.column, options.dateRange.from);
    query = query.lte(options.dateRange.column, options.dateRange.to);
  }

  if (options?.orderBy) {
    query = query.order(options.orderBy.column, { 
      ascending: options.orderBy.ascending ?? true 
    });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data: rawData, error } = await query;
  const typedData: T[] | null = rawData as T[] | null; // Explicitly cast to T[] | null
  return { data: typedData, error };
}

export async function insertRowsToTable(tableName: string, rows: any[]) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert(rows)
      .select();

    if (error) {
      console.error('Error inserting rows:', error);
      return { data: null, error };
    }

    console.log(`Successfully inserted ${data?.length} rows`);
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { data: null, error: err };
  }
}

export async function updateRowInTable(tableName: string, rowId: number, updatedData: any) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .update(updatedData)
      .eq('id', rowId)
      .select();

    if (error) {
      console.error('Error updating row:', error);
      return { data: null, error };
    }

    console.log(`Successfully updated row with id ${rowId}`);
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { data: null, error: err };
  }
}

export async function updateRowsInTable(tableName: string, updatedData: any, filters: Record<string, any>) {
  try {
    let query = supabase.from(tableName).update(updatedData);
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.select();
    if (error) {
      console.error('Error updating rows:', error);
      return { data: null, error };
    }

    console.log(`Successfully updated rows`);
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { data: null, error: err };
  }
}

export async function incrementMatchesForCategory(advertisingCategoryId: number) {
  try {
    // First, get all campaign_categories with this advertising_category_id
    const { data: rows, error: fetchError } = await getRowsFromTable('campaign_categories', {
      filters: { advertising_category_id: advertisingCategoryId }
    });

    if (fetchError || !rows) {
      console.error('Error fetching campaign categories:', fetchError);
      return { data: null, error: fetchError };
    }

    // Increment matches for each row
    const updatePromises = rows.map((row: any) => {
      const currentMatches = row.matches || 0;
      return supabase
        .from('campaign_categories')
        .update({ matches: currentMatches + 1 })
        .eq('id', row.id);
    });

    const results = await Promise.all(updatePromises);

    // Check if any updates failed
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Error incrementing matches:', errors);
      return { data: null, error: errors[0].error };
    }

    console.log(`Successfully incremented matches for ${rows.length} campaign categories`);
    return { data: rows.length, error: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { data: null, error: err };
  }
}

export async function findNearestRows(
  embedding: number[],
  matchThreshold: number = 0.7,
  matchCount: number = 5,
  queryName: string = 'match_vectors' 
) {
  try {
    const { data, error } = await supabase.rpc(queryName, {
      query_embedding: embedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      console.error(`Error finding cosine similarity:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { data: null, error: err };
  }
}

export async function getCampaignImpressionCount(
  campaign_id: number,
  start_date?: string | null,
  end_date?: string | null
) {
  try {
    const { data, error } = await supabase.rpc('get_campaign_impression_count', {
      campaign_id_in: campaign_id,
      start_date_in: start_date || null,
      end_date_in: end_date || null
    });
  
    if (error) {
      console.error('Error calling function:', error);
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error:', err);
    return { data: null, error: err };
  }
}

export async function getCampaignClickCount(
  campaign_id: number,
  start_date?: string | null,
  end_date?: string | null
) {
  try {
    const { data, error } = await supabase.rpc('get_campaign_click_count', {
      campaign_id_in: campaign_id,
      start_date_in: start_date || null,
      end_date_in: end_date || null
    });
  
    if (error) {
      console.error('Error calling function:', error);
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error:', err);
    return { data: null, error: err };
  }
}

export async function getCompanyImpressionCount(
  company_id: number,
  start_date?: string | null,
  end_date?: string | null
) {
  try {
    const { data, error } = await supabase.rpc('get_company_impression_count', {
      company_id_in: company_id,
      start_date_in: start_date || null,
      end_date_in: end_date || null
    });

    if (error) {
      console.error('Error calling function:', error);
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error:', err);
    return { data: null, error: err };
  }
}

export async function getCompanyClickCount(
  company_id: number,
  start_date?: string | null,
  end_date?: string | null
) {
  try {
    const { data, error } = await supabase.rpc('get_company_click_count', {
      company_id_in: company_id,
      start_date_in: start_date || null,
      end_date_in: end_date || null
    });

    if (error) {
      console.error('Error calling function:', error);
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error:', err);
    return { data: null, error: err };
  }
}

export async function getTotalCampaignCost(
  campaign_category_id: number,
  start_date?: string | null,
  end_date?: string | null
) {
  try {
    const { data, error } = await supabase.rpc('get_total_campaign_cost', {
      p_campaign_category_id: campaign_category_id,
      start_date_in: start_date || null,
      end_date_in: end_date || null
    });

    if (error) {
      console.error('Error calling function:', error);
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error:', err);
    return { data: null, error: err };
  }
}

export async function getAdvertiserStatsOverTime(
  company_id: number,
  start_date?: string | null,
  end_date?: string | null
) {
  try {
    // For now, we'll use a simpler approach by querying the database directly
    // since we might not have the RPC functions for date grouping yet

    // Get all campaigns for this company
    const { data: campaigns, error: campaignsError } = await getRowsFromTable('campaigns', {
      filters: { company_id: company_id, active: true }
    });

    if (campaignsError || !campaigns) {
      console.error('Error fetching campaigns:', campaignsError);
      return { data: null, error: campaignsError };
    }

    const campaignIds = campaigns.map((c: any) => c.id);

    if (campaignIds.length === 0) {
      return { data: [], error: null };
    }

    // Get campaign categories for these campaigns
    const { data: campaignCategories, error: categoriesError } = await getRowsFromTable('campaign_categories', {
      inFilters: { campaign_id: campaignIds },
      filters: { active: true }
    });

    if (categoriesError || !campaignCategories) {
      console.error('Error fetching campaign categories:', categoriesError);
      return { data: null, error: categoriesError };
    }

    const categoryIds = campaignCategories.map((cc: any) => cc.id);

    if (categoryIds.length === 0) {
      return { data: [], error: null };
    }

    // Build date filters
    const dateFilter = start_date && end_date ? {
      dateRange: { column: 'created_at', from: start_date, to: end_date }
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
      return { data: null, error: impressionsError || clicksError };
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
        // Add click cost (bid amount)
        statsMap.get(date).spend += (click.bid || 0);
      });
    }

    // Convert to array and sort
    const result = Array.from(statsMap.values()).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Also get campaign-level stats for bar charts
    const campaignStats = new Map();

    // Initialize campaign stats
    campaigns.forEach((campaign: any) => {
      campaignStats.set(campaign.id, {
        id: campaign.id,
        name: campaign.treatment_name,
        impressions: 0,
        clicks: 0,
        spend: 0
      });
    });

    // Count impressions by campaign
    if (impressions) {
      impressions.forEach((impression: any) => {
        const campaignCategory = campaignCategories.find((cc: any) => cc.id === impression.campaign_category_id);
        if (campaignCategory && campaignStats.has(campaignCategory.campaign_id)) {
          campaignStats.get(campaignCategory.campaign_id).impressions++;
          campaignStats.get(campaignCategory.campaign_id).spend += (impression.bid || 0);
        }
      });
    }

    // Count clicks by campaign
    if (clicks) {
      clicks.forEach((click: any) => {
        const campaignCategory = campaignCategories.find((cc: any) => cc.id === click.campaign_category_id);
        if (campaignCategory && campaignStats.has(campaignCategory.campaign_id)) {
          campaignStats.get(campaignCategory.campaign_id).clicks++;
          campaignStats.get(campaignCategory.campaign_id).spend += (click.bid || 0);
        }
      });
    }

    const campaignStatsArray = Array.from(campaignStats.values());

    const advertisingCategoryIds = campaignCategories.map((cc: any) => cc.advertising_category_id);

    const { data: advertisingCategories, error: advertisingCategoriesError } = await getRowsFromTable('advertising_categories', {
      inFilters: { id: advertisingCategoryIds }
    });

    if (advertisingCategoriesError) {
      console.error('Error fetching advertising categories:', advertisingCategoriesError);
      return { data: null, error: advertisingCategoriesError };
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
        const campaignCategory = campaignCategories.find((cc: any) => cc.id === impression.campaign_category_id);
        if (campaignCategory && categoryStats.has(campaignCategory.advertising_category_id)) {
          categoryStats.get(campaignCategory.advertising_category_id).impressions++;
          categoryStats.get(campaignCategory.advertising_category_id).spend += (impression.bid || 0);
        }
      });
    }

    // Count clicks by category
    if (clicks && advertisingCategories) {
      clicks.forEach((click: any) => {
        const campaignCategory = campaignCategories.find((cc: any) => cc.id === click.campaign_category_id);
        if (campaignCategory && categoryStats.has(campaignCategory.advertising_category_id)) {
          categoryStats.get(campaignCategory.advertising_category_id).clicks++;
          categoryStats.get(campaignCategory.advertising_category_id).spend += (click.bid || 0);
        }
      });
    }

    const categoryStatsArray = Array.from(categoryStats.values());

    return {
      data: {
        timeSeriesData: result,
        campaignStats: campaignStatsArray,
        categoryStats: categoryStatsArray
      },
      error: null
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { data: null, error };
  }
}