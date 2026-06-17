import { useState } from 'react';

const ROWS = 9;
const COLS = 9;
const MINES = 10;

type Cell = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
};

type Phase = 'playing' | 'won' | 'lost';

const NUMBER_COLORS: Record<number, string> = {
  1: 'text-blue-500 dark:text-blue-300',
  2: 'text-emerald-600 dark:text-emerald-400',
  3: 'text-rose-500 dark:text-rose-300',
  4: 'text-indigo-600 dark:text-indigo-300',
  5: 'text-amber-600 dark:text-amber-300',
  6: 'text-cyan-600 dark:text-cyan-300',
  7: 'text-black dark:text-white',
  8: 'text-black/60 dark:text-white/60',
};

function createBoard(): Cell[] {
  const total = ROWS * COLS;
  const mineIndices = new Set<number>();
  while (mineIndices.size < MINES) {
    mineIndices.add(Math.floor(Math.random() * total));
  }
  const cells: Cell[] = Array.from({ length: total }, (_, i) => ({
    mine: mineIndices.has(i),
    revealed: false,
    flagged: false,
    adjacent: 0,
  }));
  for (let i = 0; i < total; i++) {
    if (cells[i].mine) continue;
    const r = Math.floor(i / COLS);
    const c = i % COLS;
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && cells[nr * COLS + nc].mine) {
          count++;
        }
      }
    }
    cells[i].adjacent = count;
  }
  return cells;
}

function floodReveal(cells: Cell[], start: number): Cell[] {
  const next = cells.map((c) => ({ ...c }));
  const stack = [start];
  while (stack.length) {
    const i = stack.pop()!;
    if (next[i].revealed || next[i].flagged) continue;
    next[i].revealed = true;
    if (next[i].adjacent === 0 && !next[i].mine) {
      const r = Math.floor(i / COLS);
      const c = i % COLS;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            const ni = nr * COLS + nc;
            if (!next[ni].revealed && !next[ni].mine) stack.push(ni);
          }
        }
      }
    }
  }
  return next;
}

export function Buscaminas() {
  const [cells, setCells] = useState<Cell[]>(() => createBoard());
  const [phase, setPhase] = useState<Phase>('playing');
  const [flagMode, setFlagMode] = useState(false);

  function newGame() {
    setCells(createBoard());
    setPhase('playing');
    setFlagMode(false);
  }

  function toggleFlag(i: number, e?: React.MouseEvent) {
    e?.preventDefault();
    if (phase !== 'playing' || cells[i].revealed) return;
    setCells((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, flagged: !c.flagged } : c)),
    );
  }

  function reveal(i: number) {
    if (phase !== 'playing') return;
    if (flagMode) {
      toggleFlag(i);
      return;
    }
    const cell = cells[i];
    if (cell.revealed || cell.flagged) return;

    if (cell.mine) {
      setCells((prev) => prev.map((c) => (c.mine ? { ...c, revealed: true } : c)));
      setPhase('lost');
      return;
    }

    const next = floodReveal(cells, i);
    setCells(next);
    const nonMineTotal = ROWS * COLS - MINES;
    const revealedNonMine = next.filter((c) => c.revealed && !c.mine).length;
    if (revealedNonMine === nonMineTotal) setPhase('won');
  }

  const flagsUsed = cells.filter((c) => c.flagged).length;

  return (
    <div className="flex w-full flex-col items-center gap-4 rounded-3xl border-2 border-brand-pink/30 bg-white p-6 shadow-xl shadow-pink-200/40 dark:border-white/15 dark:bg-white/10 dark:shadow-purple-950/30">
      <h2 className="font-display text-xl font-bold">
        🧨 <span className="brand-gradient-text">Buscaminas</span>
      </h2>

      <p className="text-sm text-black/60 dark:text-white/60">
        {phase === 'won' && '¡Ganaste! 🎉'}
        {phase === 'lost' && '💥 ¡Boom! Intenta de nuevo'}
        {phase === 'playing' && `🚩 ${flagsUsed}/${MINES}`}
      </p>

      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {cells.map((cell, i) => {
          const showNumber = cell.revealed && !cell.mine && cell.adjacent > 0;
          return (
            <button
              key={i}
              onClick={() => reveal(i)}
              onContextMenu={(e) => toggleFlag(i, e)}
              disabled={phase !== 'playing' && !cell.revealed}
              className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold select-none sm:h-8 sm:w-8 ${
                cell.revealed
                  ? cell.mine
                    ? 'bg-rose-400/70'
                    : 'bg-black/5 dark:bg-white/5'
                  : 'bg-black/10 transition hover:bg-brand-pink/20 dark:bg-white/10 dark:hover:bg-purple-500/30'
              }`}
            >
              {cell.revealed
                ? cell.mine
                  ? '💣'
                  : showNumber && (
                      <span className={NUMBER_COLORS[cell.adjacent]}>{cell.adjacent}</span>
                    )
                : cell.flagged
                  ? '🚩'
                  : ''}
            </button>
          );
        })}
      </div>

      <div className="flex w-full gap-3">
        <button
          onClick={() => setFlagMode((v) => !v)}
          disabled={phase !== 'playing'}
          className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm font-bold transition disabled:opacity-40 ${
            flagMode
              ? 'border-brand-pink bg-brand-pink/20 text-black dark:text-white'
              : 'border-brand-cyan/40 bg-black/5 text-black/70 dark:border-white/15 dark:bg-white/10 dark:text-white/70'
          }`}
        >
          🚩 Modo bandera
        </button>
        <button
          onClick={newGame}
          className="flex-1 rounded-xl bg-gradient-to-r from-brand-pink to-brand-cyan px-3 py-2 text-sm font-bold text-white shadow-md shadow-pink-300/50 transition hover:scale-[1.02] dark:shadow-purple-900/40"
        >
          🔄 Nueva partida
        </button>
      </div>
    </div>
  );
}
