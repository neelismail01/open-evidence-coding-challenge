import { NextRequest, NextResponse } from 'next/server';
import { SUPABASE_TABLE_NAME_CAMPAIGNS, SUPABASE_TABLE_NAME_ADVERTISING_CATEGORIES, SUPABASE_TABLE_NAME_CAMPAIGN_CATEGORIES } from '@/lib/constants';
import { getRowsFromTable, insertRowsToTable } from '../../../../server/supabase_manager';
import { getEmbedding } from '../../../../server/openai_manager';

interface AdvertisingCategory {
    id: number;
    category_string: string;
    category_embedding: number[];
}

interface CategoryInput {
    category_string: string;
    bid: number;
    active: boolean;
}

export async function GET(request: NextRequest) {
    try {
        const companyId = request.nextUrl.searchParams.get('companyId');
        const startDate = request.nextUrl.searchParams.get('startDate');
        const endDate = request.nextUrl.searchParams.get('endDate');

        if (!companyId) {
            return NextResponse.json(
                { error: 'companyId is required' },
                { status: 400 }
            );
        }

        const dateRange = (startDate && endDate) ? { from: startDate, to: endDate } : null;

        const { data, error } = await getRowsFromTable(
            SUPABASE_TABLE_NAME_CAMPAIGNS,
            {
                filters: { company_id: companyId },
                dateRange: dateRange ? { column: 'created_at', ...dateRange } : undefined
            }
        );

        if (error) {
            console.log('Error fetching campaigns:', error);
            return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
        }

        return NextResponse.json({ campaigns: data });
    } catch (error) {
        console.log("Error occurred fetching campaigns", error)
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { company_id, treatment_name, description, product_url, active, categories } = body;

        // Validate required fields
        if (!company_id) {
            return NextResponse.json({ error: 'company_id is required' }, { status: 400 });
        }
        if (!treatment_name || !treatment_name.trim()) {
            return NextResponse.json({ error: 'treatment_name is required' }, { status: 400 });
        }
        if (!description || !description.trim()) {
            return NextResponse.json({ error: 'description is required' }, { status: 400 });
        }

        // Create the campaign
        const { data: campaignData, error: campaignError } = await insertRowsToTable(
            SUPABASE_TABLE_NAME_CAMPAIGNS,
            [{
                company_id,
                treatment_name: treatment_name.trim(),
                description: description.trim(),
                product_url: product_url || null,
                active: active !== undefined ? active : true,
            }]
        );

        if (campaignError || !campaignData || campaignData.length === 0) {
            console.error('Error creating campaign:', campaignError);
            return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
        }

        const newCampaign = campaignData[0];

        // Process categories if provided
        if (categories && Array.isArray(categories) && categories.length > 0) {
            const categoryPromises = categories.map(async (category: CategoryInput) => {
                const { category_string, bid, active } = category;

                if (!category_string || !category_string.trim()) {
                    return { error: 'Category name is required' };
                }
                if (bid === undefined || typeof bid !== 'number') {
                    return { error: 'Bid amount is required and must be a number' };
                }

                // Check if advertising category already exists
                const { data: existingCategoriesData, error: existingCategoriesError } = await getRowsFromTable<AdvertisingCategory>(
                    SUPABASE_TABLE_NAME_ADVERTISING_CATEGORIES,
                    { filters: { category_string: category_string.trim() } }
                );

                if (existingCategoriesError) {
                    console.error('Error checking for existing advertising categories:', existingCategoriesError);
                    return { error: 'Error checking for existing categories' };
                }

                let advertisingCategoryId: number;

                if (existingCategoriesData && existingCategoriesData.length > 0) {
                    // Use existing category
                    advertisingCategoryId = existingCategoriesData[0].id;
                } else {
                    // Create new advertising category
                    const embedding = await getEmbedding(category_string.trim());
                    const { data: newCategoryData, error: newCategoryError } = await insertRowsToTable(
                        SUPABASE_TABLE_NAME_ADVERTISING_CATEGORIES,
                        [{
                            category_string: category_string.trim(),
                            category_embedding: embedding,
                        }]
                    );

                    if (newCategoryError || !newCategoryData || newCategoryData.length === 0) {
                        console.error('Error creating advertising category:', newCategoryError);
                        return { error: 'Error creating advertising category' };
                    }

                    advertisingCategoryId = (newCategoryData[0] as AdvertisingCategory).id;
                }

                // Create campaign-category association
                const { error: campaignCategoryError } = await insertRowsToTable(
                    SUPABASE_TABLE_NAME_CAMPAIGN_CATEGORIES,
                    [{
                        campaign_id: newCampaign.id,
                        advertising_category_id: advertisingCategoryId,
                        active: active !== undefined ? active : true,
                        bid: bid,
                    }]
                );

                if (campaignCategoryError) {
                    console.error('Error associating category with campaign:', campaignCategoryError);
                    return { error: 'Error associating category with campaign' };
                }

                return { success: true };
            });

            const results = await Promise.all(categoryPromises);
            const errors = results.filter(result => result.error);

            if (errors.length > 0) {
                console.error('Errors processing categories:', errors);
                // Campaign was created but some categories failed
                return NextResponse.json({
                    campaign: newCampaign,
                    warning: 'Campaign created but some categories failed to associate',
                    errors: errors
                }, { status: 201 });
            }
        }

        return NextResponse.json({
            campaign: newCampaign,
            message: 'Campaign created successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('Error occurred creating campaign:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}