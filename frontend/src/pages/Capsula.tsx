import { useState } from 'react';
import { Link } from 'react-router-dom';
import { capsuleEntries } from '../data/capsule';
import type { VerifiedUser } from '../lib/api';

export function Capsula({ user }: { user: VerifiedUser }) {
  const [opened, setOpened] = useState<number[]>([]);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center gap-8 p-6 py-16 text-center">
      <span className="animate-float text-5xl">💌</span>
      <h1 className="font-display text-4xl font-bold text-white drop-shadow-[0_2px_12px_rgba(244,114,182,0.5)]">
        Feliz cumpleaños, Omi 💜
      </h1>
      <p className="text-white/70">
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
              className="rounded-2xl border border-white/15 bg-white/10 p-5 text-left shadow-lg shadow-purple-950/30 backdrop-blur-sm transition hover:scale-[1.01] hover:bg-white/15"
            >
              {isOpen ? (
                <div className="flex flex-col gap-3">
                  <h2 className="font-display text-lg font-semibold text-white">
                    {entry.title}
                  </h2>
                  <p className="whitespace-pre-line text-white/80">
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
                <span className="text-white/70">✉️ {entry.title}</span>
              )}
            </button>
          );
        })}
      </div>

      <Link
        to="/juego/host"
        className="mt-8 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-violet-500 px-6 py-3 font-display font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:scale-[1.03]"
      >
        Jugar con amigos 🎉
      </Link>
    </div>
  );
}
