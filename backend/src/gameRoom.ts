export type Question = {
  id: string;
  type: 'general' | 'quiendijo';
  question: string;
  options: string[];
  correctIndex: number;
};

export type Player = {
  socketId: string;
  name: string;
  picture?: string;
  score: number;
};

export type RoomState = {
  code: string;
  hostSocketId: string;
  players: Map<string, Player>;
  questions: Question[];
  currentQuestionIndex: number;
  questionStartedAt: number | null;
  answeredBy: Map<string, number>;
  timeLimitMs: number;
};

const rooms = new Map<string, RoomState>();

function generateCode(): string {
  let code: string;
  do {
    code = Math.random().toString(36).slice(2, 6).toUpperCase();
  } while (rooms.has(code));
  return code;
}

export function createRoom(hostSocketId: string, questions: Question[]): RoomState {
  const room: RoomState = {
    code: generateCode(),
    hostSocketId,
    players: new Map(),
    questions,
    currentQuestionIndex: -1,
    questionStartedAt: null,
    answeredBy: new Map(),
    timeLimitMs: 15000,
  };
  rooms.set(room.code, room);
  return room;
}

export function getRoom(code: string): RoomState | undefined {
  return rooms.get(code);
}

export function removeRoom(code: string): void {
  rooms.delete(code);
}

export function publicPlayers(room: RoomState) {
  return Array.from(room.players.values()).map((p) => ({
    name: p.name,
    picture: p.picture,
    score: p.score,
  }));
}

export function scoreForAnswer(
  room: RoomState,
  optionIndex: number,
  answeredAtMs: number,
): number {
  const question = room.questions[room.currentQuestionIndex];
  if (!question || optionIndex !== question.correctIndex || room.questionStartedAt === null) {
    return 0;
  }
  const elapsed = answeredAtMs - room.questionStartedAt;
  const remainingFraction = Math.max(0, 1 - elapsed / room.timeLimitMs);
  return Math.round(500 + 500 * remainingFraction);
}
