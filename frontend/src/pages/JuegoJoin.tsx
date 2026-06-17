import { useEffect, useRef, useState } from 'react';
import { GoogleGate } from '../components/GoogleGate';
import { ScoreChart } from '../components/ScoreChart';
import { socket } from '../lib/socket';
import type { VerifiedUser } from '../lib/api';

type Question = {
  index: number;
  total: number;
  question: string;
  options: string[];
  timeLimitMs: number;
};

type Phase = 'join' | 'lobby' | 'question' | 'answered' | 'revealed' | 'over';

export function JuegoJoin() {
  return (
    <GoogleGate>{(user) => <JoinGame user={user} />}</GoogleGate>
  );
}

function JoinGame({ user }: { user: VerifiedUser }) {
  const [phase, setPhase] = useState<Phase>('join');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [question, setQuestion] = useState<Question | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [reveal, setReveal] = useState<{
    correctIndex: number;
    scoreboard: { name: string; score: number }[];
  } | null>(null);
  const [chosenOption, setChosenOption] = useState<number | null>(null);
  const deadlineRef = useRef(0);

  useEffect(() => {
    socket.connect();

    socket.on('room:joined', () => setPhase('lobby'));
    socket.on('error:message', ({ message }) => setError(message));
    socket.on('question:show', (q: Question) => {
      setQuestion(q);
      setChosenOption(null);
      setReveal(null);
      setPhase('question');
      deadlineRef.current = Date.now() + q.timeLimitMs;
      setSecondsLeft(Math.ceil(q.timeLimitMs / 1000));
    });
    socket.on('question:reveal', (data) => {
      setReveal(data);
      const me = data.scoreboard.find((p: { name: string }) => p.name === user.name);
      if (me) setMyScore(me.score);
      setPhase('revealed');
    });
    socket.on('game:over', () => setPhase('over'));

    return () => {
      socket.off('room:joined');
      socket.off('error:message');
      socket.off('question:show');
      socket.off('question:reveal');
      socket.off('game:over');
      socket.disconnect();
    };
  }, [user.name]);

  useEffect(() => {
    if (phase !== 'question' && phase !== 'answered') return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, deadlineRef.current - Date.now());
      setSecondsLeft(Math.ceil(remaining / 1000));
    }, 250);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center gap-6 p-6 py-16 text-center">
      {phase === 'join' && (
        <div className="flex w-full flex-col items-center gap-6 rounded-3xl border-2 border-brand-pink/30 bg-white p-8 shadow-xl shadow-pink-200/40 dark:border-white/15 dark:bg-white/10 dark:shadow-purple-950/30">
          <span className="text-4xl">🎮</span>
          <h1 className="font-display text-2xl font-bold">
            <span className="brand-gradient-text">Únete a la partida</span>
          </h1>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="CÓDIGO"
            className="w-full rounded-xl border-2 border-brand-cyan/40 bg-black/5 p-3 text-center text-2xl tracking-widest text-black placeholder:text-black/30 dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/30"
            maxLength={4}
          />
          {error && <p className="text-rose-500 dark:text-rose-300">{error}</p>}
          <button
            onClick={() =>
              socket.emit('player:join', {
                code,
                name: user.name,
                picture: user.picture,
              })
            }
            disabled={code.length !== 4}
            className="rounded-2xl bg-gradient-to-r from-brand-pink to-brand-cyan px-6 py-3 font-display font-bold text-white shadow-lg shadow-pink-300/50 transition hover:scale-[1.03] disabled:opacity-40 disabled:hover:scale-100 dark:shadow-purple-900/40"
          >
            Entrar
          </button>
        </div>
      )}

      {phase === 'lobby' && (
        <div className="flex w-full flex-col items-center gap-4 rounded-3xl border-2 border-brand-pink/30 bg-white p-8 shadow-xl shadow-pink-200/40 dark:border-white/15 dark:bg-white/10 dark:shadow-purple-950/30">
          <span className="animate-float text-4xl">⏳</span>
          <p className="text-black/80 dark:text-white/80">
            Estás dentro, {user.name.split(' ')[0]}. Esperando a que empiece
            el anfitrión...
          </p>
        </div>
      )}

      {(phase === 'question' || phase === 'answered') && question && (
        <div className="flex w-full flex-col items-center gap-5 rounded-3xl border-2 border-brand-pink/30 bg-white p-8 shadow-xl shadow-pink-200/40 dark:border-white/15 dark:bg-white/10 dark:shadow-purple-950/30">
          <p className="text-black/60 dark:text-white/60">
            Pregunta {question.index + 1} / {question.total}
          </p>
          <p
            className={`font-display text-4xl font-extrabold ${
              secondsLeft <= 5
                ? 'animate-pulse text-rose-500'
                : 'brand-gradient-text'
            }`}
          >
            {secondsLeft}s
          </p>
          <h2 className="text-xl font-bold">{question.question}</h2>
          {phase === 'question' ? (
            <div className="grid w-full grid-cols-1 gap-3">
              {question.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setChosenOption(i);
                    socket.emit('player:answer', { optionIndex: i });
                    setPhase('answered');
                  }}
                  className="rounded-xl border-2 border-brand-cyan/40 bg-black/5 p-3 text-black/90 transition hover:scale-[1.02] hover:bg-brand-pink/20 dark:border-white/15 dark:bg-white/10 dark:text-white/90 dark:hover:bg-purple-500/40"
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-black/80 dark:text-white/80">
              Respuesta enviada, esperando...
            </p>
          )}
        </div>
      )}

      {phase === 'revealed' && reveal && question && (
        <div className="flex w-full flex-col items-center gap-4 rounded-3xl border-2 border-brand-pink/30 bg-white p-8 shadow-xl shadow-pink-200/40 dark:border-white/15 dark:bg-white/10 dark:shadow-purple-950/30">
          <span className="text-4xl">
            {chosenOption === reveal.correctIndex ? '✅' : '❌'}
          </span>
          <p
            className={
              chosenOption === reveal.correctIndex
                ? 'font-bold text-emerald-500 dark:text-emerald-400'
                : 'font-bold text-rose-500 dark:text-rose-300'
            }
          >
            {chosenOption === reveal.correctIndex ? '¡Correcto!' : 'Fallaste'}
          </p>
          <p className="text-black/70 dark:text-white/70">
            Respuesta correcta: {question.options[reveal.correctIndex]}
          </p>
          <h3 className="font-display text-lg font-bold">📊 Cómo van</h3>
          <ScoreChart players={reveal.scoreboard} />
        </div>
      )}

      {phase === 'over' && (
        <div className="flex w-full flex-col items-center gap-4 rounded-3xl border-2 border-brand-pink/30 bg-white p-8 shadow-xl shadow-pink-200/40 dark:border-white/15 dark:bg-white/10 dark:shadow-purple-950/30">
          <span className="text-4xl">🏆</span>
          <h2 className="font-display text-xl font-bold">¡Partida terminada!</h2>
          <p className="text-black/80 dark:text-white/80">
            Puntuación final: {myScore}
          </p>
        </div>
      )}
    </div>
  );
}
