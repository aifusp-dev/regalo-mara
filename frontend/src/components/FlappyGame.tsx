import { useEffect, useRef, useState } from 'react';
import { fetchTopFlappyScores, submitFlappyScore, type FlappyScore } from '../lib/api';
import ajoloteRosaSrc from '../assets/ajoloterosa.png';

const WIDTH = 390;
const HEIGHT = 630;
const BIRD_X = 75;
const BIRD_SIZE = 45;
const GRAVITY = 0.48;
const FLAP_VELOCITY = -9.3;
const PIPE_WIDTH = 63;
const PIPE_GAP = 195;
const PIPE_SPEED = 2.55;
const PIPE_SPACING = 270;

type Pipe = { x: number; gapY: number; passed: boolean };
type Phase = 'idle' | 'playing' | 'over';

type GameState = {
  birdY: number;
  velocity: number;
  pipes: Pipe[];
  score: number;
  phase: Phase;
  distanceSinceSpawn: number;
};

function createState(): GameState {
  return {
    birdY: HEIGHT / 2,
    velocity: 0,
    pipes: [],
    score: 0,
    phase: 'idle',
    distanceSinceSpawn: 0,
  };
}

export function FlappyGame({ name }: { name: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const stateRef = useRef<GameState>(createState());
  const [phase, setPhase] = useState<Phase>('idle');
  const [finalScore, setFinalScore] = useState(0);
  const [topScores, setTopScores] = useState<FlappyScore[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = ajoloteRosaSrc;
    imgRef.current = img;
  }, []);

  useEffect(() => {
    fetchTopFlappyScores(10).then(setTopScores).catch(() => {});
  }, []);

  function resetGame() {
    stateRef.current = createState();
    setPhase('idle');
  }

  function flap() {
    const s = stateRef.current;
    if (s.phase === 'over') return;
    if (s.phase === 'idle') {
      s.phase = 'playing';
      setPhase('playing');
    }
    s.velocity = FLAP_VELOCITY;
  }

  function endGame(s: GameState) {
    s.phase = 'over';
    setPhase('over');
    setFinalScore(s.score);
    setSaving(true);
    submitFlappyScore(name, s.score)
      .then(() => fetchTopFlappyScores(10))
      .then(setTopScores)
      .catch(() => {})
      .finally(() => setSaving(false));
  }

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    function loop(now: number) {
      const dt = Math.min((now - last) / (1000 / 60), 3);
      last = now;
      const s = stateRef.current;

      if (s.phase === 'playing') {
        s.velocity += GRAVITY * dt;
        s.birdY += s.velocity * dt;

        s.distanceSinceSpawn += PIPE_SPEED * dt;
        if (s.distanceSinceSpawn >= PIPE_SPACING) {
          s.distanceSinceSpawn = 0;
          const margin = 75;
          const gapY = margin + Math.random() * (HEIGHT - margin * 2 - PIPE_GAP);
          s.pipes.push({ x: WIDTH, gapY, passed: false });
        }

        for (const p of s.pipes) p.x -= PIPE_SPEED * dt;
        s.pipes = s.pipes.filter((p) => p.x + PIPE_WIDTH > 0);

        const birdTop = s.birdY - BIRD_SIZE / 2;
        const birdBottom = s.birdY + BIRD_SIZE / 2;
        const birdLeft = BIRD_X - BIRD_SIZE / 2;
        const birdRight = BIRD_X + BIRD_SIZE / 2;

        if (birdTop <= 0 || birdBottom >= HEIGHT) {
          endGame(s);
        } else {
          for (const p of s.pipes) {
            const overlapX = birdRight > p.x && birdLeft < p.x + PIPE_WIDTH;
            if (overlapX) {
              const hitsGap = birdTop > p.gapY && birdBottom < p.gapY + PIPE_GAP;
              if (!hitsGap) {
                endGame(s);
                break;
              }
            }
            if (!p.passed && p.x + PIPE_WIDTH < birdLeft) {
              p.passed = true;
              s.score += 1;
            }
          }
        }
      }

      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) draw(ctx, s);
      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  function draw(ctx: CanvasRenderingContext2D, s: GameState) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    gradient.addColorStop(0, '#bff0ff');
    gradient.addColorStop(1, '#fff0fa');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = '#34d3c8';
    for (const p of s.pipes) {
      ctx.fillRect(p.x, 0, PIPE_WIDTH, p.gapY);
      ctx.fillRect(p.x, p.gapY + PIPE_GAP, PIPE_WIDTH, HEIGHT - (p.gapY + PIPE_GAP));
    }

    const img = imgRef.current;
    ctx.save();
    ctx.translate(BIRD_X, s.birdY);
    const angle = Math.max(-0.5, Math.min(0.9, s.velocity * 0.08));
    ctx.rotate(angle);
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, -BIRD_SIZE / 2, -BIRD_SIZE / 2, BIRD_SIZE, BIRD_SIZE);
    } else {
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(0, 0, BIRD_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(s.score), WIDTH / 2, 60);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'Space' || e.key === 'ArrowUp') {
        e.preventDefault();
        flap();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border-2 border-brand-pink/30 bg-white p-6 shadow-xl shadow-pink-200/40 dark:border-white/15 dark:bg-white/10 dark:shadow-purple-950/30">
      <h2 className="font-display text-xl font-bold">
        🐦 <span className="brand-gradient-text">FlappyAxolot</span>
      </h2>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          onClick={() => phase !== 'over' && flap()}
          className="block h-auto max-w-full touch-none cursor-pointer rounded-xl border-2 border-black/10 dark:border-white/15"
        />
        {phase === 'idle' && (
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center rounded-xl bg-black/10 pb-8 text-center font-bold text-white">
            Toca o pulsa espacio
            <br />
            para empezar
          </div>
        )}
        {phase === 'over' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-black/50 p-4 text-center text-white">
            <p className="font-display text-lg font-bold">💀 ¡Choque!</p>
            <p>Puntos: {finalScore}</p>
            {saving && <p className="text-xs">Guardando...</p>}
            <button
              onClick={resetGame}
              className="mt-2 rounded-xl bg-gradient-to-r from-brand-pink to-brand-cyan px-4 py-2 text-sm font-bold"
            >
              🔄 Jugar de nuevo
            </button>
          </div>
        )}
      </div>

      <div className="w-full">
        <h3 className="mb-2 text-sm font-bold text-black/70 dark:text-white/70">
          🏆 Top puntuaciones
        </h3>
        <ol className="flex flex-col gap-1 text-sm">
          {topScores.length === 0 && (
            <li className="text-black/40 dark:text-white/40">Sé el primero en puntuar</li>
          )}
          {topScores.map((s, i) => (
            <li
              key={s.id}
              className="flex justify-between rounded-lg bg-black/5 px-3 py-1 dark:bg-white/10"
            >
              <span>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`} {s.name}
              </span>
              <span className="font-mono font-bold">{s.score}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
