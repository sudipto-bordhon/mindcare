import crypto from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import mongoose from 'mongoose';

export interface ApiRequest extends IncomingMessage {
  body?: unknown;
}

export interface ApiResponse extends ServerResponse {
  statusCode: number;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  ageBand: string;
  preferredLanguage: string;
  theme: string;
  role: string;
  streakDays: number;
  createdAt: string;
}

const userSchema = new mongoose.Schema<AppUser>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  ageBand: { type: String, default: 'adult' },
  preferredLanguage: { type: String, default: 'bn' },
  theme: { type: String, default: 'light' },
  role: { type: String, default: 'user' },
  streakDays: { type: Number, default: 1 },
  createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
});

const UserModel = mongoose.models.User || mongoose.model<AppUser>('User', userSchema);

declare global {
  // Reuse the MongoDB connection across warm serverless function invocations.
  var mindCareMongoConnection: Promise<typeof mongoose> | undefined;
}

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not configured in the deployment environment.');
  }

  if (mongoose.connection.readyState === 1) return;

  if (!globalThis.mindCareMongoConnection) {
    globalThis.mindCareMongoConnection = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    }).catch((error: unknown) => {
      globalThis.mindCareMongoConnection = undefined;
      throw error;
    });
  }

  await globalThis.mindCareMongoConnection;
}

export async function readJsonBody(req: ApiRequest): Promise<Record<string, unknown>> {
  if (req.body !== undefined) {
    if (typeof req.body === 'string') {
      return JSON.parse(req.body) as Record<string, unknown>;
    }
    if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
      return req.body as Record<string, unknown>;
    }
    throw new Error('Request body must be a JSON object.');
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const rawBody = Buffer.concat(chunks).toString('utf8');
  if (!rawBody) return {};
  const parsed: unknown = JSON.parse(rawBody);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Request body must be a JSON object.');
  }
  return parsed as Record<string, unknown>;
}

export function sendJson(res: ApiResponse, statusCode: number, data: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

export function makeAdminToken(user: Pick<AppUser, 'id' | 'role'>): string {
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  const secret = process.env.ADMIN_SESSION_SECRET || adminPassword || 'mindcare-admin-session-secret';
  const payload = Buffer.from(JSON.stringify({
    userId: user.id,
    role: user.role,
    expiresAt: Date.now() + (8 * 60 * 60 * 1000),
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export { UserModel };
