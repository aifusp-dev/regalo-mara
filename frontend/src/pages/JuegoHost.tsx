import { useEffect, useRef, useState } from 'react';
import { socket } from '../lib/socket';

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
      <h1 className="font-display text-3xl font-bold text-white">
        🎙️ Panel del anfitrión
      </h1>

      {phase === 'idle' && (
        <button
          onClick={() => socket.emit('host:create')}
          className="rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-violet-500 px-6 py-3 font-display font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:scale-[1.03]"
        >
          Crear sala
        </button>
      )}

      {phase === 'lobby' && (
        <div className="flex w-full flex-col items-center gap-6 rounded-3xl border border-white/15 bg-white/10 p-8 shadow-xl shadow-purple-950/30 backdrop-blur-sm">
          <p className="text-white/70">Código de sala</p>
          <p className="font-display text-6xl font-extrabold tracking-widest text-fuchsia-300 drop-shadow-[0_2px_12px_rgba(232,121,249,0.5)]">
            {code}
          </p>
          <PlayerList players={players} />
          <button
            onClick={() => socket.emit('host:start')}
            disabled={players.length === 0}
            className="rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-violet-500 px-6 py-3 font-display font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:scale-[1.03] disabled:opacity-40 disabled:hover:scale-100"
          >
            Empezar
          </button>
        </div>
      )}

      {phase === 'question' && question && (
        <div className="flex w-full flex-col items-center gap-5 rounded-3xl border border-white/15 bg-white/10 p-8 shadow-xl shadow-purple-950/30 backdrop-blur-sm">
          <p className="text-white/60">
            Pregunta {question.index + 1} / {question.total}
          </p>
          <p
            className={`font-display text-5xl font-extrabold ${
              secondsLeft <= 5 ? 'animate-pulse text-rose-400' : 'text-fuchsia-300'
            }`}
          >
            {secondsLeft}s
          </p>
          <h2 className="text-xl text-white">{question.question}</h2>
          <ul className="grid w-full grid-cols-2 gap-3">
            {question.options.map((opt, i) => (
              <li
                key={i}
                className="rounded-xl border border-white/15 bg-white/5 p-3 text-white/80"
              >
                {opt}
              </li>
            ))}
          </ul>
          <p className="text-white/60">
            Respuestas recibidas: {answeredCount} / {players.length}
          </p>
        </div>
      )}

      {phase === 'revealed' && reveal && question && (
        <div className="flex w-full flex-col items-center gap-5 rounded-3xl border border-white/15 bg-white/10 p-8 shadow-xl shadow-purple-950/30 backdrop-blur-sm">
          <p className="text-white/80">
            Respuesta correcta:{' '}
            <span className="font-semibold text-emerald-400">
              {question.options[reveal.correctIndex]}
            </span>
          </p>
          <PlayerList players={reveal.scoreboard} />
          <p className="text-white/50">Siguiente pregunta en unos segundos...</p>
        </div>
      )}

      {phase === 'over' && (
        <div className="flex w-full flex-col items-center gap-5 rounded-3xl border border-white/15 bg-white/10 p-8 shadow-xl shadow-purple-950/30 backdrop-blur-sm">
          <h2 className="font-display text-2xl font-bold text-white">
            🏆 Resultado final
          </h2>
          <PlayerList players={players} />
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
            className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-2 text-white/80"
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
