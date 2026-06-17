import { useState } from 'react';
import { Link } from 'react-router-dom';
import { capsuleEntries } from '../data/capsule';
import type { VerifiedUser } from '../lib/api';

export function Capsula({ user }: { user: VerifiedUser }) {
  const [opened, setOpened] = useState<number[]>([]);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center gap-8 p-6 py-16 text-center">
      <span className="animate-float text-5xl">💌</span>
      <h1 className="font-display text-4xl font-bold">
        <span className="brand-gradient-text">Feliz cumpleaños, Omi</span> 💜
      </h1>
      <p className="text-black/70 dark:text-white/70">
        Hola {user.name.split(' ')[0]}, esto es una cápsula del tiempo hecha
        para ti. Abre cada sobre cuando te apetezca.
      </p>

      <div className="flex w-full flex-col gap-4">
        {capsuleEntries.map((entry, i) => {
          const isOpen = opened.includes(i);
          return (
            <button
              key={i}
              onClick={() => setOpened((prev) => [...prev, i])}
              className="rounded-2xl border-2 border-brand-pink/30 bg-white p-5 text-left shadow-lg shadow-pink-200/40 transition hover:scale-[1.01] hover:border-brand-pink dark:border-white/15 dark:bg-white/10 dark:shadow-purple-950/30"
            >
              {isOpen ? (
                <div className="flex flex-col gap-3">
                  <h2 className="font-display text-lg font-bold text-black dark:text-white">
                    {entry.title}
                  </h2>
                  <p className="whitespace-pre-line text-black/80 dark:text-white/80">
                    {entry.text}
                  </p>
                  {entry.image && (
                    <img
                      src={entry.image}
                      alt=""
                      className="rounded-lg object-cover"
                    />
                  )}
                </div>
              ) : (
                <span className="text-black/70 dark:text-white/70">
                  ✉️ {entry.title}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Link
        to="/juego/host"
        className="mt-8 rounded-2xl bg-gradient-to-r from-brand-pink to-brand-cyan px-6 py-3 font-display font-bold text-white shadow-lg shadow-pink-300/50 transition hover:scale-[1.03] dark:shadow-purple-900/40"
      >
        Jugar con amigos 🎉
      </Link>
    </div>
  );
}
