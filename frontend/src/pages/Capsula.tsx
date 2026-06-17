import { useEffect, useState } from 'react';
import {
  createCapsuleEntry,
  deleteCapsuleEntry,
  fetchCapsuleEntries,
  resolveAssetUrl,
  type CapsuleEntry,
  type VerifiedUser,
} from '../lib/api';
import { Puzzle } from '../components/Puzzle';

export function Capsula({ user, idToken }: { user: VerifiedUser; idToken: string }) {
  const [entries, setEntries] = useState<CapsuleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCapsuleEntries(idToken)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [idToken]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() && !text.trim() && !image) return;
    setSaving(true);
    try {
      const entry = await createCapsuleEntry(idToken, { title, text, image });
      setEntries((prev) => [entry, ...prev]);
      setTitle('');
      setText('');
      setImage(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    await deleteCapsuleEntry(idToken, id);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center gap-8 p-6 py-16 text-center">
      <span className="animate-float text-5xl">💌</span>
      <h1 className="font-display text-4xl font-bold">
        <span className="brand-gradient-text">Tu cápsula del tiempo</span>
      </h1>
      <p className="text-black/70 dark:text-white/70">
        Hola {user.name.split(' ')[0]}, este es tu rincón. Guarda aquí fotos,
        textos y cosas que quieras recordar.
      </p>

      <Puzzle />

      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-3 rounded-3xl border-2 border-brand-pink/30 bg-white p-6 text-left shadow-lg shadow-pink-200/40 dark:border-white/15 dark:bg-white/10 dark:shadow-purple-950/30"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del recuerdo"
          className="rounded-xl border-2 border-brand-cyan/40 bg-black/5 p-3 text-black placeholder:text-black/40 dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe lo que quieras recordar..."
          rows={3}
          className="rounded-xl border-2 border-brand-cyan/40 bg-black/5 p-3 text-black placeholder:text-black/40 dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          className="text-sm text-black/70 dark:text-white/70"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-gradient-to-r from-brand-pink to-brand-cyan px-6 py-3 font-display font-bold text-white shadow-lg shadow-pink-300/50 transition hover:scale-[1.02] disabled:opacity-50 dark:shadow-purple-900/40"
        >
          {saving ? 'Guardando...' : '✨ Guardar recuerdo'}
        </button>
      </form>

      <div className="flex w-full flex-col gap-4">
        {loading && <p className="text-black/60 dark:text-white/60">Cargando...</p>}
        {!loading && entries.length === 0 && (
          <p className="text-black/50 dark:text-white/50">
            Todavía no hay recuerdos guardados. ¡Añade el primero! 💜
          </p>
        )}
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-col gap-3 rounded-2xl border-2 border-brand-pink/30 bg-white p-5 text-left shadow-lg shadow-pink-200/40 dark:border-white/15 dark:bg-white/10 dark:shadow-purple-950/30"
          >
            <div className="flex items-start justify-between gap-3">
              {entry.title && (
                <h2 className="font-display text-lg font-bold text-black dark:text-white">
                  {entry.title}
                </h2>
              )}
              <button
                onClick={() => handleDelete(entry.id)}
                aria-label="Borrar recuerdo"
                className="text-black/40 transition hover:text-rose-500 dark:text-white/40 dark:hover:text-rose-300"
              >
                🗑️
              </button>
            </div>
            {entry.text && (
              <p className="whitespace-pre-line text-black/80 dark:text-white/80">
                {entry.text}
              </p>
            )}
            {entry.imageUrl && (
              <img
                src={resolveAssetUrl(entry.imageUrl)}
                alt=""
                className="rounded-xl object-cover"
              />
            )}
            <span className="text-xs text-black/40 dark:text-white/40">
              {new Date(entry.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
