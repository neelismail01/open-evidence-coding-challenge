import { NextRequest, NextResponse } from 'next/server';
import { SUPABASE_TABLE_NAME_COMPANIES } from '@/lib/constants';
import { getRowsFromTable } from '../../../server/supabase_manager';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await getRowsFromTable(SUPABASE_TABLE_NAME_COMPANIES, {
      orderBy: { column: 'name', ascending: true }
    });

    if (error) {
      console.error('Error fetching companies:', error);
      return NextResponse.json(
        { error: 'Failed to fetch companies' },
        { status: 500 }
      );
    }

    return NextResponse.json({ companies: data });
  } catch (error) {
    console.error('Unexpected error fetching companies:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
