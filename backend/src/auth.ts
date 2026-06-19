import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export type VerifiedUser = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
};

export async function verifyGoogleToken(idToken: string): Promise<VerifiedUser> {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new Error('Token de Google inválido');
  }
  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email,
    picture: payload.picture,
  };
}

const SESSION_SECRET = process.env.SESSION_SECRET ?? 'dev-insecure-secret-change-me';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

type SessionPayload = VerifiedUser & { exp: number };

function sign(payloadB64: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('base64url');
}

export function createSessionToken(user: VerifiedUser): string {
  const payload: SessionPayload = { ...user, exp: Date.now() + SESSION_DURATION_MS };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifySessionToken(token: string): VerifiedUser | null {
  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return null;

  const expected = sign(payloadB64);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString()) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    const { exp, ...user } = payload;
    return user;
  } catch {
    return null;
  }
}

export async function verifyAnyToken(token: string): Promise<VerifiedUser> {
  if (token.split('.').length === 2) {
    const user = verifySessionToken(token);
    if (!user) throw new Error('Sesión inválida o expirada');
    return user;
  }
  return verifyGoogleToken(token);
}
