import { NextResponse } from 'next/server';
import { getEmbedding } from '../../../utils/openai_manager';
import { findNearestRows, incrementMatchesForCategory } from '../../../utils/supabase_manager';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const questionEmbedding = await getEmbedding(question);

    // Find the most similar category using Supabase vector search
    const { data: categories, error: categoriesError } = await findNearestRows(
      questionEmbedding,
      0.1,
      1
    );

    if (categoriesError || !categories) {
      console.error('Error finding nearest categories:', categoriesError);
      return NextResponse.json({ error: 'Failed to find categories' }, { status: 500 });
    }

    const mostSimilarCategoryId: number = categories[0].id;

    // Increment matches for all campaign_categories with this advertising_category_id
    await incrementMatchesForCategory(mostSimilarCategoryId);

    // Query campaign_categories with filters on both campaign_category.active and campaigns.active
    const { data: campaignCategories, error: campaignCategoriesError } = await supabase
        .from('campaign_categories')
        .select('id, campaign_id, bid, campaigns!inner(id, treatment_name, description, product_url, companies(name))')
        .eq('advertising_category_id', mostSimilarCategoryId)
        .eq('active', true)
        .eq('campaigns.active', true)
        .order('bid', { ascending: false })
        .limit(1);

    if (campaignCategoriesError || !campaignCategories) {
        console.error('Error fetching campaign categories:', campaignCategoriesError);
        return NextResponse.json({ error: 'Failed to find campaign categories' }, { status: 500 });
    }

    console.log("campaignCategories=", campaignCategories)
    return NextResponse.json(campaignCategories[0]);
  } catch (error) {
    console.error('Error fetching advertisement:', error);
    return NextResponse.json({ error: 'Failed to fetch advertisement' }, { status: 500 });
  }
}
