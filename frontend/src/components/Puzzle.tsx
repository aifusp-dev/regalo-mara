import { useState } from 'react';
import puzzleImage from '../assets/puzzle-mara.jpg';

const COLS = 4;
const ROWS = 4;
const TOTAL = COLS * ROWS;

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function shuffledOrder(): number[] {
  let order = shuffle([...Array(TOTAL).keys()]);
  while (order.every((pieceId, pos) => pieceId === pos)) {
    order = shuffle(order);
  }
  return order;
}

type Phase = 'playing' | 'won';

export function Puzzle() {
  const [order, setOrder] = useState<number[]>(shuffledOrder);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('playing');

  function startNew() {
    setOrder(shuffledOrder());
    setSelected(null);
    setPhase('playing');
  }

  function clickTile(pos: number) {
    if (phase !== 'playing') return;
    if (selected === null) {
      setSelected(pos);
      return;
    }
    if (selected === pos) {
      setSelected(null);
      return;
    }
    const next = [...order];
    [next[selected], next[pos]] = [next[pos], next[selected]];
    setOrder(next);
    setSelected(null);
    if (next.every((pieceId, p) => pieceId === p)) setPhase('won');
  }

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-3xl border-2 border-brand-pink/30 bg-white p-6 shadow-xl shadow-pink-200/40 dark:border-white/15 dark:bg-white/10 dark:shadow-purple-950/30">
      <h2 className="font-display text-xl font-bold">
        🧩 <span className="brand-gradient-text">Puzzle</span>
      </h2>

      <p className="text-sm text-black/60 dark:text-white/60">
        {phase === 'won' ? '¡Completado! 🎉' : 'Toca dos piezas para intercambiarlas'}
      </p>

      <div
        className="grid aspect-[3/4] w-full max-w-[260px] gap-0.5 overflow-hidden rounded-xl border-2 border-black/10 dark:border-white/15"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {order.map((pieceId, pos) => {
          const r = Math.floor(pieceId / COLS);
          const c = pieceId % COLS;
          return (
            <button
              key={pos}
              onClick={() => clickTile(pos)}
              disabled={phase !== 'playing'}
              className={`aspect-[3/4] bg-cover ${
                selected === pos ? 'ring-4 ring-brand-pink ring-inset' : ''
              }`}
              style={{
                backgroundImage: `url(${puzzleImage})`,
                backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
                backgroundPosition: `${(c / (COLS - 1)) * 100}% ${(r / (ROWS - 1)) * 100}%`,
              }}
            />
          );
        })}
      </div>

      <button
        onClick={startNew}
        className="w-full rounded-xl bg-gradient-to-r from-brand-pink to-brand-cyan px-3 py-2 text-sm font-bold text-white shadow-md shadow-pink-300/50 transition hover:scale-[1.02] dark:shadow-purple-900/40"
      >
        🔄 Nuevo puzzle
      </button>
    </div>
  );
}
