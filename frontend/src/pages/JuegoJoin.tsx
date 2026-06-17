import { useEffect, useRef, useState } from 'react';
import { GoogleGate } from '../components/GoogleGate';
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
        <>
          <h1 className="text-2xl font-semibold text-white">Únete a la partida</h1>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Código de sala"
            className="w-full rounded-lg border border-white/20 bg-white/5 p-3 text-center text-2xl tracking-widest text-white"
            maxLength={4}
          />
          {error && <p className="text-rose-300">{error}</p>}
          <button
            onClick={() =>
              socket.emit('player:join', {
                code,
                name: user.name,
                picture: user.picture,
              })
            }
            disabled={code.length !== 4}
            className="rounded-full bg-purple-500 px-6 py-3 font-medium text-white hover:bg-purple-400 disabled:opacity-40"
          >
            Entrar
          </button>
        </>
      )}

      {phase === 'lobby' && (
        <p className="text-white/80">
          Estás dentro, {user.name.split(' ')[0]}. Esperando a que empiece el
          anfitrión...
        </p>
      )}

      {(phase === 'question' || phase === 'answered') && question && (
        <>
          <p className="text-white/60">
            Pregunta {question.index + 1} / {question.total}
          </p>
          <p className="text-3xl font-bold text-purple-300">{secondsLeft}s</p>
          <h2 className="text-xl text-white">{question.question}</h2>
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
                  className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/90 hover:bg-purple-500/40"
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-white/80">Respuesta enviada, esperando...</p>
          )}
        </>
      )}

      {phase === 'revealed' && reveal && question && (
        <>
          <p
            className={
              chosenOption === reveal.correctIndex
                ? 'text-emerald-400'
                : 'text-rose-300'
            }
          >
            {chosenOption === reveal.correctIndex ? '¡Correcto!' : 'Fallaste'}
          </p>
          <p className="text-white/70">
            Respuesta correcta: {question.options[reveal.correctIndex]}
          </p>
          <p className="text-white/60">Tu puntuación: {myScore}</p>
        </>
      )}

      {phase === 'over' && (
        <h2 className="text-xl text-white">
          🏆 ¡Partida terminada! Puntuación final: {myScore}
        </h2>
      )}
    </div>
  );
}
