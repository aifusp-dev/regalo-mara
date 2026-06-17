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
      <h1 className="text-2xl font-semibold text-white">Panel del anfitrión</h1>

      {phase === 'idle' && (
        <button
          onClick={() => socket.emit('host:create')}
          className="rounded-full bg-purple-500 px-6 py-3 font-medium text-white hover:bg-purple-400"
        >
          Crear sala
        </button>
      )}

      {phase === 'lobby' && (
        <>
          <p className="text-white/70">Código de sala</p>
          <p className="text-5xl font-bold tracking-widest text-purple-300">
            {code}
          </p>
          <PlayerList players={players} />
          <button
            onClick={() => socket.emit('host:start')}
            disabled={players.length === 0}
            className="rounded-full bg-purple-500 px-6 py-3 font-medium text-white hover:bg-purple-400 disabled:opacity-40"
          >
            Empezar
          </button>
        </>
      )}

      {phase === 'question' && question && (
        <>
          <p className="text-white/60">
            Pregunta {question.index + 1} / {question.total}
          </p>
          <p className="text-4xl font-bold text-purple-300">{secondsLeft}s</p>
          <h2 className="text-xl text-white">{question.question}</h2>
          <ul className="grid w-full grid-cols-2 gap-3">
            {question.options.map((opt, i) => (
              <li
                key={i}
                className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/80"
              >
                {opt}
              </li>
            ))}
          </ul>
          <p className="text-white/60">
            Respuestas recibidas: {answeredCount} / {players.length}
          </p>
        </>
      )}

      {phase === 'revealed' && reveal && question && (
        <>
          <p className="text-white/80">
            Respuesta correcta:{' '}
            <span className="font-semibold text-emerald-400">
              {question.options[reveal.correctIndex]}
            </span>
          </p>
          <PlayerList players={reveal.scoreboard} />
          <p className="text-white/50">Siguiente pregunta en unos segundos...</p>
        </>
      )}

      {phase === 'over' && (
        <>
          <h2 className="text-xl text-white">🏆 Resultado final</h2>
          <PlayerList players={players} />
        </>
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
            className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2 text-white/80"
          >
            <span>{p.name}</span>
            <span className="font-mono">{p.score}</span>
          </li>
        ))}
    </ul>
  );
}
