import { NextResponse } from 'next/server';
import { getEmbedding } from '../../../utils/openai_manager';
import { findNearestRows, getRowsFromTable, incrementMatchesForCategory } from '../../../utils/supabase_manager';

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

    const { data: campaignCategories, error: campaignCategoriesError } = await getRowsFromTable(
        'campaign_categories',
        {
          filters: { advertising_category_id: mostSimilarCategoryId, active: true },
          selectString: 'id, campaign_id, bid, campaigns(id, treatment_name, description, product_url, companies(name))',
          orderBy: { column: 'bid', ascending: false },
          limit: 1
        }
    );

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
