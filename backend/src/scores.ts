import fs from 'fs';
import path from 'path';

export type FlappyScore = {
  id: string;
  name: string;
  score: number;
  createdAt: string;
};

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), 'data');
const SCORES_FILE = path.join(DATA_DIR, 'flappy-scores.json');

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(SCORES_FILE)) {
  fs.writeFileSync(SCORES_FILE, '[]');
}

function readScores(): FlappyScore[] {
  return JSON.parse(fs.readFileSync(SCORES_FILE, 'utf-8'));
}

function writeScores(scores: FlappyScore[]): void {
  fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
}

export function addScore(name: string, score: number): FlappyScore {
  const scores = readScores();
  const entry: FlappyScore = {
    id: Math.random().toString(36).slice(2, 10),
    name,
    score,
    createdAt: new Date().toISOString(),
  };
  scores.push(entry);
  writeScores(scores);
  return entry;
}

export function topScores(limit: number): FlappyScore[] {
  return readScores()
    .sort((a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt))
    .slice(0, limit);
}
