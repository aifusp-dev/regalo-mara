import { Link } from 'react-router-dom';
import ajoloteRosa from '../assets/ajoloterosa.png';

export function JuegoMenu() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-8 p-6 py-16 text-center">
      <img
        src={ajoloteRosa}
        alt="Ajolote rosa"
        className="animate-float w-20 [image-rendering:pixelated]"
      />
      <h1 className="font-display text-3xl font-bold">
        <span className="brand-gradient-text">¿A qué quieres jugar?</span>
      </h1>
      <div className="flex w-full flex-col gap-4">
        <Link
          to="/juego/kahoot"
          className="rounded-2xl bg-gradient-to-r from-brand-pink to-brand-cyan px-6 py-4 font-display text-lg font-bold text-white shadow-lg shadow-pink-300/50 transition hover:scale-[1.03] hover:shadow-xl dark:shadow-purple-900/40"
        >
          🎉 Kahoot
        </Link>
        <Link
          to="/juego/flappy"
          className="rounded-2xl border-2 border-brand-pink/40 bg-white px-6 py-4 font-display text-lg font-bold text-black/80 shadow-md transition hover:scale-[1.03] hover:border-brand-pink dark:border-white/15 dark:bg-white/10 dark:text-white/90"
        >
          🐦 FlappyAxolot
        </Link>
      </div>
    </div>
  );
}
