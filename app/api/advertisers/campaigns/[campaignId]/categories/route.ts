import { NextRequest, NextResponse } from 'next/server';
import { getRowsFromTable, insertRowsToTable, updateRowsInTable } from '../../../../../../server/supabase_manager';
import { getEmbedding } from '../../../../../../server/openai_manager';
import { SUPABASE_TABLE_NAME_ADVERTISING_CATEGORIES, SUPABASE_TABLE_NAME_CAMPAIGN_CATEGORIES } from '@/lib/constants';

interface AdvertisingCategory {
    id: number;
    category_string: string;
    category_embedding: number[];
}

interface CampaignCategory {
    id: number;
    created_at: string;
    campaign_id: number;
    advertising_category_id: number;
    active: boolean;
    bid: number;
}

async function getOrCreateAdvertisingCategory(
  categoryName: string, 
  active: boolean
): Promise<{ advertisingCategoryId?: string; response?: NextResponse }> {

  const { data: existingAdvertisingCategoriesData, error: existingAdvertisingCategoriesError } = await getRowsFromTable(SUPABASE_TABLE_NAME_ADVERTISING_CATEGORIES, {
    filters: { category_string: categoryName },
  });

  if (existingAdvertisingCategoriesError) {
    console.error('Error checking for existing advertising categories:', existingAdvertisingCategoriesError);
    return { response: NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }) };
  }

  if (existingAdvertisingCategoriesData && existingAdvertisingCategoriesData.length > 0) {
    return { advertisingCategoryId: String((existingAdvertisingCategoriesData[0] as AdvertisingCategory).id) };
  }

  if (!active) {
    // Cannot deactivate a category that doesn't exist
    return { response: NextResponse.json({ error: 'Category does not exist to deactivate' }, { status: 404 }) };
  }

  // Create new advertising_category if it doesn't exist and active is true
  const embedding = await getEmbedding(categoryName);
  const { data: newAdvertisingCategoryData, error: newAdvertisingCategoryError } = await insertRowsToTable(SUPABASE_TABLE_NAME_ADVERTISING_CATEGORIES, [
    {
      category_string: categoryName,
      category_embedding: embedding,
    },
  ]);

  if (newAdvertisingCategoryError || !newAdvertisingCategoryData || newAdvertisingCategoryData.length === 0) {
    console.error('Error creating new advertising category:', newAdvertisingCategoryError);
    return { response: NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }) };
  }

  const newAdvertisingCategory = newAdvertisingCategoryData as AdvertisingCategory[]; // Still need cast as insert returns any[]
  return { advertisingCategoryId: String(newAdvertisingCategory[0].id) };
}

async function insertCampaignCategoryAssociation(
  campaignId: string,
  advertisingCategoryId: string,
  categoryName: string,
  active: boolean,
  bidAmount?: number
): Promise<NextResponse> {
    const { data: existingCampaignCategoriesData, error: existingCampaignCategoriesError } = await getRowsFromTable<CampaignCategory>(SUPABASE_TABLE_NAME_CAMPAIGN_CATEGORIES, {
        filters: { campaign_id: campaignId, advertising_category_id: advertisingCategoryId },
    });

    if (existingCampaignCategoriesError) {
        console.error('Error checking for existing campaign categories:', existingCampaignCategoriesError);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    const existingCampaignCategories = existingCampaignCategoriesData; // No longer need cast, type is inferred

    if (existingCampaignCategories && existingCampaignCategories.length > 0) {
        return NextResponse.json({ error: `Category '${categoryName}' is already associated with campaign '${campaignId}'. Use PUT to update.` }, { status: 409 });
    }

    const { data: campaignCategory, error: campaignCategoryError } = await insertRowsToTable(SUPABASE_TABLE_NAME_CAMPAIGN_CATEGORIES, [
        {
            campaign_id: campaignId,
            advertising_category_id: advertisingCategoryId,
            active: active, // Use the active status provided in the POST request
            ...(bidAmount !== undefined && { bid: bidAmount }),
        },
    ]);

    if (campaignCategoryError) {
        console.error('Error associating category with campaign:', campaignCategoryError);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    return NextResponse.json({ message: `Category '${categoryName}' added to campaign '${campaignId}'` }, { status: 201 });
}

async function updateCampaignCategoryAssociation(
  campaignId: number,
  advertisingCategoryId: number,
  categoryName: string,
  active: boolean,
  bidAmount?: number
): Promise<NextResponse> {

  const { data: existingCampaignCategoriesData, error: existingCampaignCategoriesError } = await getRowsFromTable<CampaignCategory>(SUPABASE_TABLE_NAME_CAMPAIGN_CATEGORIES, {
    filters: { campaign_id: campaignId, advertising_category_id: advertisingCategoryId },
  });

  if (existingCampaignCategoriesError) {
    console.error('Error checking for existing campaign categories:', existingCampaignCategoriesError);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  const campaignCategoryExists = existingCampaignCategoriesData && existingCampaignCategoriesData.length > 0;
  const existingCampaignCategory = campaignCategoryExists ? existingCampaignCategoriesData[0] : null;

  if (!campaignCategoryExists) {
      return NextResponse.json({ error: `Category '${categoryName}' not found for campaign '${campaignId}'. Use POST to add a new category.` }, { status: 404 });
  }

  const updateData: { active?: boolean; bid?: number } = {};
  let changesMade = false;

  if (existingCampaignCategory!.active !== active) {
      updateData.active = active;
      changesMade = true;
  }
  if (bidAmount !== undefined && existingCampaignCategory!.bid !== bidAmount) {
      updateData.bid = bidAmount;
      changesMade = true;
  }

  if (!changesMade) {
      return NextResponse.json({ message: `No changes detected for category '${categoryName}' in campaign '${campaignId}'` }, { status: 200 });
  }

  const { error: updateError } = await updateRowsInTable(
    SUPABASE_TABLE_NAME_CAMPAIGN_CATEGORIES,
    updateData,
    { campaign_id: campaignId, advertising_category_id: advertisingCategoryId }
  );

  if (updateError) {
    console.error('Error updating category for campaign:', updateError);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  return NextResponse.json({ message: `Category '${categoryName}' updated for campaign '${campaignId}'` }, { status: 200 });
}


export async function GET(
  req: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params;
    const startDate = req.nextUrl.searchParams.get('startDate');
    const endDate = req.nextUrl.searchParams.get('endDate');

    const dateRange = (startDate && endDate) ? { column: 'created_at', from: startDate, to: endDate } : undefined;

    const { data: campaignCategoriesData, error: campaignCategoriesError } = await getRowsFromTable<CampaignCategory & { advertising_categories: { category_string: string } }>(SUPABASE_TABLE_NAME_CAMPAIGN_CATEGORIES, {
      filters: { campaign_id: campaignId },
      selectString: '*, advertising_categories(category_string)',
      dateRange: dateRange,
    });

    if (campaignCategoriesError) {
      console.error('Error fetching campaign categories:', campaignCategoriesError);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    const campaignCategories = campaignCategoriesData;

    if (!campaignCategories || campaignCategories.length === 0) {
      return NextResponse.json({ categories: [] }, { status: 200 });
    }

    // Get unique advertising_category_ids from campaign categories
    const advertisingCategoryIds = Array.from(new Set(campaignCategories.map(cc => cc.advertising_category_id)));

    // Fetch all active campaign_categories for these advertising categories to find max bids
    const { data: allCampaignCategoriesData, error: allCampaignCategoriesError } = await getRowsFromTable<CampaignCategory>(
      SUPABASE_TABLE_NAME_CAMPAIGN_CATEGORIES,
      {
        inFilters: { advertising_category_id: advertisingCategoryIds },
        filters: { active: true },
      }
    );

    if (allCampaignCategoriesError) {
      console.error('Error fetching all campaign categories for max bid:', allCampaignCategoriesError);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    // Calculate max bid for each advertising_category_id
    const maxBidsByCategory = new Map<number, number>();
    if (allCampaignCategoriesData) {
      allCampaignCategoriesData.forEach(cc => {
        const currentMax = maxBidsByCategory.get(cc.advertising_category_id) || 0;
        if (cc.bid > currentMax) {
          maxBidsByCategory.set(cc.advertising_category_id, cc.bid);
        }
      });
    }

    // Enrich campaign categories with max_bid information
    const enrichedCategories = campaignCategories.map(cc => ({
      ...cc,
      max_bid: maxBidsByCategory.get(cc.advertising_category_id) || 0,
    }));

    return NextResponse.json({ categories: enrichedCategories }, { status: 200 });
  } catch (error) {
    console.error('Error in GET campaign categories endpoint:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params;
    const body = await req.json();
    const { categoryName, active, bidAmount } = body;

    if (!categoryName) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }
    if (typeof active !== 'boolean') {
      return NextResponse.json({ error: 'Active status (true/false) is required' }, { status: 400 });
    }
    if (bidAmount !== undefined && typeof bidAmount !== 'number') {
        return NextResponse.json({ error: 'Bid amount must be a number' }, { status: 400 });
    }

    const { advertisingCategoryId, response: categoryErrorResponse } = await getOrCreateAdvertisingCategory(categoryName, active);

    if (categoryErrorResponse) {
      return categoryErrorResponse;
    }
    if (!advertisingCategoryId) {
      return NextResponse.json({ error: 'Advertising category ID could not be determined.' }, { status: 500 });
    }

    return insertCampaignCategoryAssociation(campaignId, advertisingCategoryId, categoryName, active, bidAmount);

  } catch (error) {
    console.error('Error in POST category endpoint:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { campaignId: number } }
) {
  try {
    const { campaignId } = params;
    const body = await req.json();
    const { categoryName, active, bidAmount } = body;

    if (!categoryName) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }
    if (typeof active !== 'boolean') {
      return NextResponse.json({ error: 'Active status (true/false) is required' }, { status: 400 });
    }
    if (bidAmount !== undefined && typeof bidAmount !== 'number') {
        return NextResponse.json({ error: 'Bid amount must be a number' }, { status: 400 });
    }

    // Ensure advertising category exists (don't create if not found for PUT)
    const { data: existingAdvertisingCategoriesData, error: existingAdvertisingCategoriesError } = await getRowsFromTable<AdvertisingCategory>(SUPABASE_TABLE_NAME_ADVERTISING_CATEGORIES, {
      filters: { category_string: categoryName },
    });
    if (existingAdvertisingCategoriesError || !existingAdvertisingCategoriesData || existingAdvertisingCategoriesData.length === 0) {
      return NextResponse.json({ error: `Advertising category '${categoryName}' not found.` }, { status: 404 });
    }
    const advertisingCategoryId = existingAdvertisingCategoriesData[0].id; // No longer need cast, type is inferred

    return updateCampaignCategoryAssociation(campaignId, advertisingCategoryId, categoryName, active, bidAmount);

  } catch (error) {
    console.error('Error in PUT category endpoint:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}