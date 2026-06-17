const API_URL = import.meta.env.VITE_API_URL ?? '';

export type VerifiedUser = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
};

export async function verifyGoogleToken(
  idToken: string,
): Promise<{ user: VerifiedUser; isCapsuleOwner: boolean }> {
  const res = await fetch(`${API_URL}/api/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error('Token inválido');
  return res.json();
}
