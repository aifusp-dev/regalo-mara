import { useState } from 'react';
import { Link } from 'react-router-dom';
import { capsuleEntries } from '../data/capsule';
import type { VerifiedUser } from '../lib/api';

export function Capsula({ user }: { user: VerifiedUser }) {
  const [opened, setOpened] = useState<number[]>([]);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center gap-8 p-6 py-16 text-center">
      <h1 className="text-3xl font-semibold text-white">
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
              className="rounded-xl border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10"
            >
              {isOpen ? (
                <div className="flex flex-col gap-3">
                  <h2 className="text-lg font-medium text-white">
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
                <span className="text-white/60">✉️ {entry.title}</span>
              )}
            </button>
          );
        })}
      </div>

      <Link
        to="/juego/host"
        className="mt-8 rounded-full bg-purple-500 px-6 py-3 font-medium text-white transition hover:bg-purple-400"
      >
        Jugar con amigos 🎉
      </Link>
    </div>
  );
}
