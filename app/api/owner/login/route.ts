import { NextRequest, NextResponse } from 'next/server';

const OWNER_EMAIL = process.env.OWNER_EMAIL || 'owner@nexusstore.com';
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || 'Owner@123456';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Verify owner credentials
    if (email === OWNER_EMAIL && password === OWNER_PASSWORD) {
      // Generate a simple token (in production, use JWT)
      const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
      return NextResponse.json({
        success: true,
        token,
        owner: {
          email,
          role: 'owner',
          name: 'Store Owner',
        },
      });
    }

    return NextResponse.json({ error: 'Invalid owner credentials' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
