import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { getCustomerByEmail, updateCustomerPassword } from '@/lib/customers';
import { createPasswordResetToken, verifyPasswordResetToken } from '@/lib/passwordReset';
import { sendPasswordResetEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

function getBaseUrl(request: Request): string {
  const url = new URL(request.url);
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const forwardedHost =
    request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() ||
    request.headers.get('host')?.split(',')[0]?.trim();

  const protocol = forwardedProto || (url.protocol === 'https:' ? 'https' : 'http');
  const host = forwardedHost || url.host;

  return `${protocol}://${host}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body?.action === 'request') {
      const email = body?.email?.toLowerCase()?.trim();

      if (!email) {
        return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
      }

      const customer = await getCustomerByEmail(email);

      if (customer) {
        const token = createPasswordResetToken(email);
        const baseUrl = getBaseUrl(request);
        const resetLink = `${baseUrl}/checkout/auth/reset-password?token=${encodeURIComponent(token)}`;
        await sendPasswordResetEmail(email, resetLink);
      } else {
        console.log(`[password-reset] No customer found for ${email}; skipping email.`);
      }

      return NextResponse.json({
        message:
          'If an account exists for this email, you will receive a password reset link shortly.',
      });
    }

    if (body?.action === 'confirm') {
      const token = body?.token;
      const password = body?.password?.trim();

      if (!token || !password) {
        return NextResponse.json(
          { error: 'Reset token and password are required.' },
          { status: 400 },
        );
      }

      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters.' },
          { status: 400 },
        );
      }

      const result = verifyPasswordResetToken(token);

      if (!result) {
        return NextResponse.json(
          { error: 'Invalid or expired reset token.' },
          { status: 400 },
        );
      }

      const customer = await updateCustomerPassword(result.email, password);

      if (!customer) {
        return NextResponse.json(
          { error: 'Invalid or expired reset token.' },
          { status: 400 },
        );
      }

      return NextResponse.json({ message: 'Password updated successfully.' });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    logError('Failed to handle password reset:', error);

    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
