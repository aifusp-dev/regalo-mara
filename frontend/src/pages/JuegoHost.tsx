import { useEffect, useRef, useState } from 'react';
import { socket } from '../lib/socket';
import { ScoreChart } from '../components/ScoreChart';

type Player = { name: string; picture?: string; score: number };
type Question = {
  index: number;
  total: number;
  question: string;
  options: string[];
  timeLimitMs: number;
};

type Phase = 'idle' | 'lobby' | 'question' | 'revealed' | 'over';

export function JuegoHost() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [code, setCode] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [reveal, setReveal] = useState<{
    correctIndex: number;
    scoreboard: Player[];
  } | null>(null);
  const deadlineRef = useRef(0);

  useEffect(() => {
    socket.connect();

    socket.on('room:created', ({ code }) => {
      setCode(code);
      setPhase('lobby');
    });
    socket.on('room:update', ({ players }) => setPlayers(players));
    socket.on('question:show', (q: Question) => {
      setQuestion(q);
      setAnsweredCount(0);
      setReveal(null);
      setPhase('question');
      deadlineRef.current = Date.now() + q.timeLimitMs;
      setSecondsLeft(Math.ceil(q.timeLimitMs / 1000));
    });
    socket.on('answer:received', ({ count }) => setAnsweredCount(count));
    socket.on('question:reveal', (data) => {
      setReveal(data);
      setPhase('revealed');
    });
    socket.on('game:over', ({ scoreboard }) => {
      setPlayers(scoreboard);
      setPhase('over');
    });

    return () => {
      socket.off('room:created');
      socket.off('room:update');
      socket.off('question:show');
      socket.off('answer:received');
      socket.off('question:reveal');
      socket.off('game:over');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (phase !== 'question') return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, deadlineRef.current - Date.now());
      setSecondsLeft(Math.ceil(remaining / 1000));
    }, 250);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center gap-6 p-6 py-16 text-center">
      <h1 className="font-display text-3xl font-bold">
        🎙️ <span className="brand-gradient-text">Panel del anfitrión</span>
      </h1>

      {phase === 'idle' && (
        <button
          onClick={() => socket.emit('host:create')}
          className="rounded-2xl bg-gradient-to-r from-brand-pink to-brand-cyan px-6 py-3 font-display font-bold text-white shadow-lg shadow-pink-300/50 transition hover:scale-[1.03] dark:shadow-purple-900/40"
        >
          Crear sala
        </button>
      )}

      {phase === 'lobby' && (
        <div className="flex w-full flex-col items-center gap-6 rounded-3xl border-2 border-brand-pink/30 bg-white p-8 shadow-xl shadow-pink-200/40 dark:border-white/15 dark:bg-white/10 dark:shadow-purple-950/30">
          <p className="text-black/60 dark:text-white/70">Código de sala</p>
          <p className="font-display text-6xl font-extrabold tracking-widest brand-gradient-text">
            {code}
          </p>
          <PlayerList players={players} />
          <button
            onClick={() => socket.emit('host:start')}
            disabled={players.length === 0}
            className="rounded-2xl bg-gradient-to-r from-brand-pink to-brand-cyan px-6 py-3 font-display font-bold text-white shadow-lg shadow-pink-300/50 transition hover:scale-[1.03] disabled:opacity-40 disabled:hover:scale-100 dark:shadow-purple-900/40"
          >
            Empezar
          </button>
        </div>
      )}

      {phase === 'question' && question && (
        <div className="flex w-full flex-col items-center gap-5 rounded-3xl border-2 border-brand-pink/30 bg-white p-8 shadow-xl shadow-pink-200/40 dark:border-white/15 dark:bg-white/10 dark:shadow-purple-950/30">
          <p className="text-black/60 dark:text-white/60">
            Pregunta {question.index + 1} / {question.total}
          </p>
          <p
            className={`font-display text-5xl font-extrabold ${
              secondsLeft <= 5
                ? 'animate-pulse text-rose-500'
                : 'brand-gradient-text'
            }`}
          >
            {secondsLeft}s
          </p>
          <h2 className="text-xl font-bold">{question.question}</h2>
          <ul className="grid w-full grid-cols-2 gap-3">
            {question.options.map((opt, i) => (
              <li
                key={i}
                className="rounded-xl border border-brand-cyan/30 bg-black/5 p-3 text-black/80 dark:border-white/15 dark:bg-white/5 dark:text-white/80"
              >
                {opt}
              </li>
            ))}
          </ul>
          <p className="text-black/60 dark:text-white/60">
            Respuestas recibidas: {answeredCount} / {players.length}
          </p>
        </div>
      )}

      {phase === 'revealed' && reveal && question && (
        <div className="flex w-full flex-col items-center gap-5 rounded-3xl border-2 border-brand-pink/30 bg-white p-8 shadow-xl shadow-pink-200/40 dark:border-white/15 dark:bg-white/10 dark:shadow-purple-950/30">
          <p className="text-black/80 dark:text-white/80">
            Respuesta correcta:{' '}
            <span className="font-bold text-emerald-500 dark:text-emerald-400">
              {question.options[reveal.correctIndex]}
            </span>
          </p>
          <h3 className="font-display text-lg font-bold">📊 Cómo van</h3>
          <ScoreChart players={reveal.scoreboard} />
          <p className="text-black/50 dark:text-white/50">
            Siguiente pregunta en unos segundos...
          </p>
        </div>
      )}

      {phase === 'over' && (
        <div className="flex w-full flex-col items-center gap-5 rounded-3xl border-2 border-brand-pink/30 bg-white p-8 shadow-xl shadow-pink-200/40 dark:border-white/15 dark:bg-white/10 dark:shadow-purple-950/30">
          <h2 className="font-display text-2xl font-bold">🏆 Resultado final</h2>
          <ScoreChart players={players} />
        </div>
      )}
    </div>
  );
}

function PlayerList({ players }: { players: Player[] }) {
  return (
    <ul className="flex w-full flex-col gap-2">
      {players
        .slice()
        .sort((a, b) => b.score - a.score)
        .map((p, i) => (
          <li
            key={i}
            className="flex items-center justify-between rounded-xl bg-black/5 px-4 py-2 text-black/80 dark:bg-white/10 dark:text-white/80"
          >
            <span>
              {i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : ''}
              {p.name}
            </span>
            <span className="font-mono">{p.score}</span>
          </li>
        ))}
    </ul>
  );
}
