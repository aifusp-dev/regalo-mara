import { Link } from 'react-router-dom';
import ajoloteRosa from '../assets/ajoloterosa.png';
import { Buscaminas } from '../components/Buscaminas';
import { Sudoku } from '../components/Sudoku';
import { Snake } from '../components/Snake';

export function Landing() {
  return (
    <div className="mx-auto flex min-h-screen w-full flex-col items-center justify-center gap-10 p-6 py-16 text-center">
      <div className="flex w-full max-w-md flex-col items-center gap-10">
        <img
          src={ajoloteRosa}
          alt="Ajolote rosa"
          className="animate-float w-32 [image-rendering:pixelated]"
        />
        <h1 className="font-display text-4xl font-bold text-black drop-shadow-sm dark:text-white">
          <span className="brand-gradient-text">¡Feliz cumpleaños!</span>
        </h1>
        <div className="flex w-full flex-col gap-4">
          <Link
            to="/juego"
            className="rounded-2xl bg-gradient-to-r from-brand-pink to-brand-cyan px-6 py-4 font-display text-lg font-bold text-white shadow-lg shadow-pink-300/50 transition hover:scale-[1.03] hover:shadow-xl dark:shadow-purple-900/40"
          >
            🎮 Entrar a los juegos
          </Link>
          <Link
            to="/capsula"
            className="rounded-2xl border-2 border-brand-pink/40 bg-white px-6 py-4 font-display text-lg font-bold text-black/80 shadow-md transition hover:scale-[1.03] hover:border-brand-pink dark:border-white/15 dark:bg-white/10 dark:text-white/90"
          >
            💌 Ver la cápsula del tiempo
          </Link>
        </div>
      </div>
      <div className="flex w-full max-w-5xl flex-col items-center gap-6 sm:flex-row sm:flex-wrap sm:items-start sm:justify-center">
        <Buscaminas />
        <Sudoku />
        <Snake />
      </div>
    </div>
  );
}
