import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

type FilterOptions = {
  filters?: Record<string, any>;
  limit?: number;
  orderBy?: { column: string; ascending?: boolean };
};

export async function getRowsFromTable(
  tableName: string,
  options?: FilterOptions
) {

  let query = supabase.from(tableName).select('*');

  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  if (options?.orderBy) {
    query = query.order(options.orderBy.column, { 
      ascending: options.orderBy.ascending ?? true 
    });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function insertRowsToTable(tableName: string, rows: any[]) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert(rows)
      .select();

    if (error) {
      console.error('Error inserting rows:', error);
      return { data: null, error };
    }

    console.log(`Successfully inserted ${data?.length} rows`);
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { data: null, error: err };
  }
}