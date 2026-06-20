import { NextResponse } from 'next/server';
import { getAuthCookies } from '@/lib/auth/cookies';

export async function GET() {
  const { session } = await getAuthCookies();

  if (!session) {
    return NextResponse.json({ session: null }, { status: 401 });
  }

  return NextResponse.json({
    session: {
      userId: session.userId,
      email: session.email,
      username: session.username,
    },
  });
}
