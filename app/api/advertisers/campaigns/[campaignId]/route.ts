import { NextRequest, NextResponse } from 'next/server';
import { SUPABASE_TABLE_NAME_CAMPAIGNS } from '../../../../constants';
import { getRowsFromTable, updateRowInTable } from '../../../../../utils/supabase_manager';

export async function GET(request: NextRequest, { params }: { params: { campaignId: string } }) {
    try {
        const campaignId = params.campaignId;
        
        if (!campaignId) {
            return NextResponse.json(
                { error: 'campaignId is required' }, 
                { status: 400 }
            );
        }

        const { data, error } = await getRowsFromTable(
            SUPABASE_TABLE_NAME_CAMPAIGNS,
            { filters: { id: campaignId } }
        );

        if (error) {
            console.log('Error fetching campaign:', error);
            return NextResponse.json({ error: 'Error fetching campaign' }, { status: 500 });
        }

        if (!data || data.length === 0) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        return NextResponse.json({ campaign: data[0] });
    } catch (error) {
        console.log("Error occurred fetching campaign", error);
        return NextResponse.json({ error: 'Error fetching campaign' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: { campaignId: string } }) {
    try {
        const campaignId = parseInt(params.campaignId, 10);
        const body = await request.json();
        
        if (!campaignId) {
            return NextResponse.json(
                { error: 'campaignId is required' }, 
                { status: 400 }
            );
        }

        const { data, error } = await updateRowInTable(
            SUPABASE_TABLE_NAME_CAMPAIGNS,
            campaignId,
            body
        );

        if (error) {
            console.log('Error updating campaign:', error);
            return NextResponse.json({ error: 'Error updating campaign' }, { status: 500 });
        }

        return NextResponse.json({ campaign: data });
    } catch (error) {
        console.log("Error occurred updating campaign", error);
        return NextResponse.json({ error: 'Error updating campaign' }, { status: 500 });
    }
}
