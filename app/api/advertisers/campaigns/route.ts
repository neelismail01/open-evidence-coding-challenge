import { NextRequest, NextResponse } from 'next/server';
import { SUPABASE_TABLE_NAME_CAMPAIGNS } from '@/lib/constants';
import { getRowsFromTable } from '../../../../server/supabase_manager';

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