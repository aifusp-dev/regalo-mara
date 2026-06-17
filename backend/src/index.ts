import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { verifyGoogleToken } from './auth.js';
import {
  createRoom,
  getRoom,
  removeRoom,
  publicPlayers,
  scoreForAnswer,
  type Question,
  type RoomState,
} from './gameRoom.js';
import questionsData from './data/questions.json' with { type: 'json' };

const questions = questionsData as Question[];
const CAPSULE_ALLOWED_EMAIL = process.env.CAPSULE_ALLOWED_EMAIL?.toLowerCase();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/auth/verify', async (req, res) => {
  try {
    const { idToken } = req.body;
    const user = await verifyGoogleToken(idToken);
    const isCapsuleOwner = CAPSULE_ALLOWED_EMAIL
      ? user.email.toLowerCase() === CAPSULE_ALLOWED_EMAIL
      : false;
    res.json({ user, isCapsuleOwner });
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.join(__dirname, '../public');
app.use(express.static(frontendDist));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

function startQuestion(room: RoomState) {
  room.currentQuestionIndex += 1;
  const question = room.questions[room.currentQuestionIndex];
  if (!question) {
    io.to(room.code).emit('game:over', { scoreboard: publicPlayers(room) });
    removeRoom(room.code);
    return;
  }
  room.answeredBy.clear();
  room.questionStartedAt = Date.now();
  io.to(room.code).emit('question:show', {
    index: room.currentQuestionIndex,
    total: room.questions.length,
    question: question.question,
    options: question.options,
    timeLimitMs: room.timeLimitMs,
  });
  room.questionTimer = setTimeout(() => revealQuestion(room), room.timeLimitMs);
}

function revealQuestion(room: RoomState) {
  const question = room.questions[room.currentQuestionIndex];
  io.to(room.code).emit('question:reveal', {
    correctIndex: question.correctIndex,
    scoreboard: publicPlayers(room).sort((a, b) => b.score - a.score),
  });
  room.revealTimer = setTimeout(() => startQuestion(room), room.revealDurationMs);
}

io.on('connection', (socket) => {
  socket.on('host:create', () => {
    const room = createRoom(socket.id, questions);
    socket.join(room.code);
    socket.data.role = 'host';
    socket.data.roomCode = room.code;
    socket.emit('room:created', { code: room.code });
  });

  socket.on('player:join', ({ code, name, picture }) => {
    const room = getRoom(code);
    if (!room) {
      socket.emit('error:message', { message: 'Sala no encontrada' });
      return;
    }
    room.players.set(socket.id, { socketId: socket.id, name, picture, score: 0 });
    socket.join(code);
    socket.data.role = 'player';
    socket.data.roomCode = code;
    io.to(room.hostSocketId).emit('room:update', { players: publicPlayers(room) });
    socket.emit('room:joined', { code });
  });

  socket.on('host:start', () => {
    const code = socket.data.roomCode;
    const room = code ? getRoom(code) : undefined;
    if (!room || room.hostSocketId !== socket.id || room.currentQuestionIndex !== -1) return;
    startQuestion(room);
  });

  socket.on('player:answer', ({ optionIndex }) => {
    const code = socket.data.roomCode;
    const room = code ? getRoom(code) : undefined;
    if (!room || room.answeredBy.has(socket.id)) return;

    const points = scoreForAnswer(room, optionIndex, Date.now());
    room.answeredBy.set(socket.id, optionIndex);
    const player = room.players.get(socket.id);
    if (player) player.score += points;
    io.to(room.hostSocketId).emit('answer:received', { count: room.answeredBy.size });
  });

  socket.on('disconnect', () => {
    const code = socket.data.roomCode;
    if (!code) return;
    const room = getRoom(code);
    if (!room) return;
    if (room.hostSocketId === socket.id) {
      io.to(code).emit('error:message', { message: 'El anfitrión cerró la sala' });
      removeRoom(code);
    } else {
      room.players.delete(socket.id);
      io.to(room.hostSocketId).emit('room:update', { players: publicPlayers(room) });
    }
  });
});

const port = Number(process.env.PORT) || 3001;
httpServer.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
});
