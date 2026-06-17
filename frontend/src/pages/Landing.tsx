import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-8 p-6 text-center">
      <h1 className="text-3xl font-semibold text-white">🎉 ¡Feliz cumpleaños! 🎉</h1>
      <div className="flex w-full flex-col gap-4">
        <Link
          to="/juego"
          className="rounded-full bg-purple-500 px-6 py-4 font-medium text-white transition hover:bg-purple-400"
        >
          🎮 Entrar a los juegos
        </Link>
        <Link
          to="/capsula"
          className="rounded-full border border-white/20 bg-white/5 px-6 py-4 font-medium text-white/90 transition hover:bg-white/10"
        >
          💌 Ver la cápsula del tiempo
        </Link>
      </div>
    </div>
  );
}
