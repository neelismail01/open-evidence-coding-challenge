import { NextRequest, NextResponse } from 'next/server';
import { getRowsFromTable } from '../../../utils/supabase_manager';
import { SUPABASE_TABLE_NAME_COMPANIES } from '../../constants';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await getRowsFromTable(SUPABASE_TABLE_NAME_COMPANIES);
    return NextResponse.json({ companies: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

