
import { NextResponse } from 'next/server';
import { getTotalCampaignCost } from '../../../../../../../server/supabase_manager';

export async function GET(request: Request, { params }: { params: { categoryId: string } }) {
    try {
        const categoryId = parseInt(params.categoryId, 10);
        if (isNaN(categoryId)) {
            return new NextResponse(JSON.stringify({ error: 'Invalid category ID' }), { status: 400 });
        }

        const url = new URL(request.url);
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');

        const { data, error } = await getTotalCampaignCost(categoryId, startDate, endDate);

        if (error) {
            console.error('Error fetching total campaign cost:', error);
            return new NextResponse(JSON.stringify({ error: 'Failed to fetch total campaign cost' }), { status: 500 });
        }

        return new NextResponse(JSON.stringify({ total_cost: data }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (err) {
        console.error('Unexpected error:', err);
        return new NextResponse(JSON.stringify({ error: 'An unexpected error occurred' }), { status: 500 });
    }
}
