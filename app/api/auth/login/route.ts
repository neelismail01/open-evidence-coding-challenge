import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getRowsFromTable } from '../../../../server/supabase_manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Query the users table for this email
    const { data: users, error } = await getRowsFromTable('users', {
      filters: { email }
    });

    if (error) {
      console.error('Error querying users:', error);
      return NextResponse.json(
        { error: 'An error occurred during login' },
        { status: 500 }
      );
    }

    // Check if user exists
    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'This account does not exist' },
        { status: 404 }
      );
    }

    const user = users[0] as any;

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Return success with company_id
    return NextResponse.json({
      success: true,
      companyId: user.company_id,
      userId: user.id,
      email: user.email
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
