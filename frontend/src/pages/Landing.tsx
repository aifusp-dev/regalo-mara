import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-10 p-6 text-center">
      <div className="animate-float text-6xl">🎂</div>
      <h1 className="font-display text-4xl font-bold text-white drop-shadow-[0_2px_12px_rgba(192,132,252,0.5)]">
        ¡Feliz cumpleaños!
      </h1>
      <div className="flex w-full flex-col gap-4">
        <Link
          to="/juego"
          className="rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-violet-500 px-6 py-4 font-display text-lg font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:scale-[1.03] hover:shadow-xl"
        >
          🎮 Entrar a los juegos
        </Link>
        <Link
          to="/capsula"
          className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 font-display text-lg font-semibold text-white/90 backdrop-blur-sm transition hover:scale-[1.03] hover:bg-white/15"
        >
          💌 Ver la cápsula del tiempo
        </Link>
      </div>
    </div>
  );
}
