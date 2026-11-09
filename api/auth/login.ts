import type { ApiRequest, ApiResponse, AppUser } from '../../src/serverless/auth';
import { connectDatabase, makeAdminToken, readJsonBody, sendJson, UserModel } from '../../src/serverless/auth';

export default async function login(req: ApiRequest, res: ApiResponse): Promise<void> {
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

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password.trim() : '';
  if (!email || !password) {
    sendJson(res, 400, { error: 'Email and password are required.' });
    return;
  }

  try {
    await connectDatabase();
    const user = await UserModel.findOne({ email }).lean<AppUser>();
    if (!user || user.password !== password) {
      sendJson(res, 401, { error: 'Invalid email or password. Please try again.' });
      return;
    }

    const { password: _password, ...safeUser } = user;
    const userResponse = {
      ...safeUser,
      ...(user.role === 'admin' || user.role === 'super_admin'
        ? { adminToken: makeAdminToken(user) }
        : {}),
    };

    sendJson(res, 200, {
      success: true,
      message: 'Login successful!',
      user: userResponse,
    });
  } catch (error) {
    console.error('Vercel login error:', error);
    sendJson(res, 503, {
      error: 'Login service is temporarily unavailable. Please try again shortly.',
    });
  }
}
