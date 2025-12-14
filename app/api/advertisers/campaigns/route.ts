import { NextRequest, NextResponse } from 'next/server';
import { SUPABASE_TABLE_NAME_CAMPAIGNS } from '../../../constants';
import { getRowsFromTable } from '../../../../utils/supabase_manager';

export async function GET(request: NextRequest) {
    try {
        const companyId = request.nextUrl.searchParams.get('companyId');
        
        if (!companyId) {
            return NextResponse.json(
                { error: 'companyId is required' }, 
                { status: 400 }
            );
        }

        const { data, error } = await getRowsFromTable(
            SUPABASE_TABLE_NAME_CAMPAIGNS,
            { filters: { company_id: companyId } }
        );

        if (error) {
            console.log('  ')
        }

        return NextResponse.json({ campaigns: data });
    } catch (error) {
        console.log("Error occurred inserting treatments", error)
    }
}