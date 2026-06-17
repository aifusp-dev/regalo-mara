import { useState } from 'react';

const GIVENS = 38;

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function isValid(grid: number[], idx: number, val: number): boolean {
  const r = Math.floor(idx / 9);
  const c = idx % 9;
  for (let i = 0; i < 9; i++) {
    if (grid[r * 9 + i] === val) return false;
    if (grid[i * 9 + c] === val) return false;
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let dr = 0; dr < 3; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      if (grid[(br + dr) * 9 + (bc + dc)] === val) return false;
    }
  }
  return true;
}

function generateSolution(): number[] {
  const grid = new Array(81).fill(0);
  function fill(idx: number): boolean {
    if (idx === 81) return true;
    for (const n of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
      if (isValid(grid, idx, n)) {
        grid[idx] = n;
        if (fill(idx + 1)) return true;
        grid[idx] = 0;
      }
    }
    return false;
  }
  fill(0);
  return grid;
}

function makePuzzle(solution: number[]) {
  const given = new Array(81).fill(true);
  const removable = shuffle([...Array(81).keys()]).slice(0, 81 - GIVENS);
  for (const idx of removable) given[idx] = false;
  const values = solution.map((v, i) => (given[i] ? v : 0));
  return { given, values };
}

function newPuzzle() {
  const solution = generateSolution();
  const { given, values } = makePuzzle(solution);
  return { solution, given, values };
}

type Phase = 'playing' | 'won';

export function Sudoku() {
  const [{ solution, given, values }, setBoard] = useState(newPuzzle);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('playing');

  function startNew() {
    setBoard(newPuzzle());
    setSelected(null);
    setPhase('playing');
  }

  function setValue(value: number) {
    if (phase !== 'playing' || selected === null || given[selected]) return;
    const next = values.map((v, i) => (i === selected ? value : v));
    setBoard({ solution, given, values: next });
    if (next.every((v, i) => v === solution[i])) setPhase('won');
  }

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-3xl border-2 border-brand-pink/30 bg-white p-6 shadow-xl shadow-pink-200/40 dark:border-white/15 dark:bg-white/10 dark:shadow-purple-950/30">
      <h2 className="font-display text-xl font-bold">
        🔢 <span className="brand-gradient-text">Sudoku</span>
      </h2>

      <p className="text-sm text-black/60 dark:text-white/60">
        {phase === 'won' ? '¡Completado! 🎉' : 'Elige una casilla y un número'}
      </p>

      <div className="grid grid-cols-9 gap-0">
        {values.map((value, i) => {
          const r = Math.floor(i / 9);
          const c = i % 9;
          const isGiven = given[i];
          const isWrong = !isGiven && value !== 0 && value !== solution[i];
          return (
            <button
              key={i}
              onClick={() => !isGiven && phase === 'playing' && setSelected(i)}
              disabled={isGiven || phase !== 'playing'}
              className={`flex h-7 w-7 items-center justify-center border border-black/10 text-xs font-bold select-none sm:h-8 sm:w-8 dark:border-white/10 ${
                c % 3 === 2 && c !== 8 ? 'border-r-2 border-r-black/30 dark:border-r-white/30' : ''
              } ${
                r % 3 === 2 && r !== 8 ? 'border-b-2 border-b-black/30 dark:border-b-white/30' : ''
              } ${
                selected === i
                  ? 'bg-brand-pink/30'
                  : isGiven
                    ? 'bg-black/10 dark:bg-white/10'
                    : 'bg-black/5 hover:bg-brand-cyan/20 dark:bg-white/5 dark:hover:bg-purple-500/30'
              } ${isWrong ? 'text-rose-500 dark:text-rose-300' : isGiven ? '' : 'text-emerald-600 dark:text-emerald-400'}`}
            >
              {value !== 0 ? value : ''}
            </button>
          );
        })}
      </div>

      <div className="grid w-full grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => setValue(n)}
            disabled={phase !== 'playing' || selected === null}
            className="rounded-lg bg-black/5 py-2 text-sm font-bold text-black/80 transition hover:bg-brand-pink/20 disabled:opacity-30 dark:bg-white/10 dark:text-white/80 dark:hover:bg-purple-500/30"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => setValue(0)}
          disabled={phase !== 'playing' || selected === null}
          className="rounded-lg bg-black/5 py-2 text-sm font-bold text-black/80 transition hover:bg-brand-pink/20 disabled:opacity-30 dark:bg-white/10 dark:text-white/80 dark:hover:bg-purple-500/30"
        >
          ✖
        </button>
      </div>

      <button
        onClick={startNew}
        className="w-full rounded-xl bg-gradient-to-r from-brand-pink to-brand-cyan px-3 py-2 text-sm font-bold text-white shadow-md shadow-pink-300/50 transition hover:scale-[1.02] dark:shadow-purple-900/40"
      >
        🔄 Nuevo sudoku
      </button>
    </div>
  );
}
