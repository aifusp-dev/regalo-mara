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

export type CapsuleEntry = {
  id: string;
  title: string;
  text: string;
  imageUrl: string | null;
  createdAt: string;
};

export async function fetchCapsuleEntries(idToken: string): Promise<CapsuleEntry[]> {
  const res = await fetch(`${API_URL}/api/capsule/entries`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error('No se pudieron cargar los recuerdos');
  return res.json();
}

export async function createCapsuleEntry(
  idToken: string,
  data: { title: string; text: string; image: File | null },
): Promise<CapsuleEntry> {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('text', data.text);
  if (data.image) formData.append('image', data.image);

  const res = await fetch(`${API_URL}/api/capsule/entries`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
    body: formData,
  });
  if (!res.ok) throw new Error('No se pudo guardar el recuerdo');
  return res.json();
}

export async function deleteCapsuleEntry(idToken: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/capsule/entries/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error('No se pudo borrar el recuerdo');
}

export function resolveAssetUrl(url: string): string {
  return url.startsWith('http') ? url : `${API_URL}${url}`;
}

export type FlappyScore = {
  id: string;
  name: string;
  score: number;
  createdAt: string;
};

export async function submitFlappyScore(name: string, score: number): Promise<FlappyScore> {
  const res = await fetch(`${API_URL}/api/flappy/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, score }),
  });
  if (!res.ok) throw new Error('No se pudo guardar la puntuación');
  return res.json();
}

export async function fetchTopFlappyScores(limit = 10): Promise<FlappyScore[]> {
  const res = await fetch(`${API_URL}/api/flappy/scores/top?limit=${limit}`);
  if (!res.ok) throw new Error('No se pudieron cargar las puntuaciones');
  return res.json();
}
