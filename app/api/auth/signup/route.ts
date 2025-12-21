import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getRowsFromTable, insertRowsToTable } from '../../../../server/supabase_manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, company_id } = body;

    // Validate input
    if (!email || !password || !company_id) {
      return NextResponse.json(
        { error: 'Email, password, and company are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUsers, error: checkError } = await getRowsFromTable('users', {
      filters: { email }
    });

    if (checkError) {
      console.error('Error checking existing users:', checkError);
      return NextResponse.json(
        { error: 'An error occurred during signup' },
        { status: 500 }
      );
    }

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const { data: newUser, error: insertError } = await insertRowsToTable('users', [
      {
        email,
        password: hashedPassword,
        company_id
      }
    ]);

    if (insertError) {
      console.error('Error creating user:', insertError);
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    // Return success with company_id
    return NextResponse.json({
      success: true,
      companyId: company_id,
      userId: newUser?.[0]?.id,
      email
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
