import type { ApiRequest, ApiResponse } from '../../src/serverless/auth';
import { connectDatabase, readJsonBody, sendJson, UserModel } from '../../src/serverless/auth';

export default async function register(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

  let body: Record<string, unknown>;
  try {
    body = await readJsonBody(req);
  } catch {
    sendJson(res, 400, { error: 'Request body must be valid JSON.' });
    return;
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password.trim() : '';
  if (!name || !email || !password) {
    sendJson(res, 400, { error: 'Name, email, and password are required.' });
    return;
  }

  try {
    await connectDatabase();
    const existing = await UserModel.findOne({ email }).select({ _id: 1 }).lean();
    if (existing) {
      sendJson(res, 409, { error: 'An account with this email already exists. Please sign in.' });
      return;
    }

    const user = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      password,
      phone: typeof body.phone === 'string' ? body.phone : '',
      ageBand: typeof body.ageBand === 'string' ? body.ageBand : 'adult',
      preferredLanguage: body.preferredLanguage === 'en' ? 'en' : 'bn',
      theme: 'light',
      role: 'user',
      streakDays: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    await UserModel.create(user);
    const { password: _password, ...safeUser } = user;
    sendJson(res, 201, {
      success: true,
      message: 'Account created successfully!',
      user: safeUser,
      database: 'MongoDB',
    });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 11000
    ) {
      sendJson(res, 409, { error: 'An account with this email already exists. Please sign in.' });
      return;
    }
    console.error('Vercel registration error:', error);
    sendJson(res, 503, {
      error: 'Registration service is temporarily unavailable. Please try again shortly.',
    });
  }
}
