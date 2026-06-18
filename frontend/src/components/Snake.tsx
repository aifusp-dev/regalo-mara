import { useEffect, useRef, useState } from 'react';
import ajoloteRosa from '../assets/ajoloterosa.png';

const COLS = 14;
const ROWS = 14;
const CELL_PX = 18;
const TICK_MS = 150;

type Point = { x: number; y: number };
type Direction = { dx: number; dy: number };

const DIRECTIONS = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
} satisfies Record<string, Direction>;

function initialSnake(): Point[] {
  const y = Math.floor(ROWS / 2);
  return [
    { x: 6, y },
    { x: 5, y },
    { x: 4, y },
  ];
}

function randomFood(snake: Point[]): Point {
  let food: Point;
  do {
    food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some((s) => s.x === food.x && s.y === food.y));
  return food;
}

type Phase = 'idle' | 'playing' | 'over';

export function Snake() {
  const [snake, setSnake] = useState<Point[]>(initialSnake);
  const [food, setFood] = useState<Point>(() => randomFood(initialSnake()));
  const [phase, setPhase] = useState<Phase>('idle');
  const [score, setScore] = useState(0);
  const directionRef = useRef<Direction>(DIRECTIONS.right);
  const pendingDirectionRef = useRef<Direction>(DIRECTIONS.right);
  const foodRef = useRef<Point>(food);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  function setDirection(dir: Direction) {
    const current = directionRef.current;
    if (current.dx === -dir.dx && current.dy === -dir.dy) return;
    pendingDirectionRef.current = dir;
    setPhase((p) => (p === 'idle' ? 'playing' : p));
  }

  function newGame() {
    const start = initialSnake();
    setSnake(start);
    setFood(randomFood(start));
    setPhase('idle');
    setScore(0);
    directionRef.current = DIRECTIONS.right;
    pendingDirectionRef.current = DIRECTIONS.right;
  }

  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = setInterval(() => {
      directionRef.current = pendingDirectionRef.current;
      setSnake((prev) => {
        const dir = directionRef.current;
        const head = prev[0];
        const newHead = { x: head.x + dir.dx, y: head.y + dir.dy };

        if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
          setPhase('over');
          return prev;
        }

        const food = foodRef.current;
        const ateFood = newHead.x === food.x && newHead.y === food.y;
        const body = ateFood ? prev : prev.slice(0, -1);

        if (body.some((s) => s.x === newHead.x && s.y === newHead.y)) {
          setPhase('over');
          return prev;
        }

        const next = [newHead, ...body];
        if (ateFood) {
          setScore((s) => s + 1);
          setFood(randomFood(next));
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    const KEY_MAP: Record<string, Direction> = {
      ArrowUp: DIRECTIONS.up,
      ArrowDown: DIRECTIONS.down,
      ArrowLeft: DIRECTIONS.left,
      ArrowRight: DIRECTIONS.right,
      w: DIRECTIONS.up,
      s: DIRECTIONS.down,
      a: DIRECTIONS.left,
      d: DIRECTIONS.right,
    };
    function onKeyDown(e: KeyboardEvent) {
      const dir = KEY_MAP[e.key];
      if (dir) {
        e.preventDefault();
        setDirection(dir);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const head = snake[0];

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-3xl border-2 border-brand-pink/30 bg-white p-6 shadow-xl shadow-pink-200/40 dark:border-white/15 dark:bg-white/10 dark:shadow-purple-950/30">
      <h2 className="font-display text-xl font-bold">
        🐍 <span className="brand-gradient-text">Serpiente</span>
      </h2>

      <p className="text-sm text-black/60 dark:text-white/60">
        {phase === 'idle' && 'Pulsa una flecha para empezar'}
        {phase === 'over' && `💀 ¡Choque! Puntos: ${score}`}
        {phase === 'playing' && `✨ Puntos: ${score}`}
      </p>

      <div
        className="grid gap-0.5 rounded-xl border-2 border-black/10 bg-black/5 dark:border-white/15 dark:bg-white/5"
        style={{
          gridTemplateColumns: `repeat(${COLS}, ${CELL_PX}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${CELL_PX}px)`,
        }}
      >
        {Array.from({ length: COLS * ROWS }).map((_, i) => {
          const x = i % COLS;
          const y = Math.floor(i / COLS);
          const isHead = head.x === x && head.y === y;
          const isBody = !isHead && snake.some((s) => s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;
          return (
            <div key={i} className="flex items-center justify-center">
              {isHead && (
                <img
                  src={ajoloteRosa}
                  alt=""
                  className="h-full w-full object-contain [image-rendering:pixelated]"
                />
              )}
              {isBody && <div className="h-full w-full rounded-sm bg-brand-pink/70" />}
              {isFood && <div className="h-2/3 w-2/3 rounded-full bg-brand-cyan" />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div />
        <DPadButton label="⬆️" onClick={() => setDirection(DIRECTIONS.up)} />
        <div />
        <DPadButton label="⬅️" onClick={() => setDirection(DIRECTIONS.left)} />
        <DPadButton label="⬇️" onClick={() => setDirection(DIRECTIONS.down)} />
        <DPadButton label="➡️" onClick={() => setDirection(DIRECTIONS.right)} />
      </div>

      <button
        onClick={newGame}
        className="w-full rounded-xl bg-gradient-to-r from-brand-pink to-brand-cyan px-3 py-2 text-sm font-bold text-white shadow-md shadow-pink-300/50 transition hover:scale-[1.02] dark:shadow-purple-900/40"
      >
        🔄 Nueva partida
      </button>
    </div>
  );
}

function DPadButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Cambiar dirección"
      className="flex h-10 items-center justify-center rounded-lg bg-black/5 text-lg transition hover:bg-brand-pink/20 dark:bg-white/10 dark:hover:bg-purple-500/30"
    >
      {label}
    </button>
  );
}
