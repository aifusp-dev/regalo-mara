import fs from 'fs';
import path from 'path';

export type CapsuleEntry = {
  id: string;
  title: string;
  text: string;
  imageUrl: string | null;
  createdAt: string;
};

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const ENTRIES_FILE = path.join(DATA_DIR, 'entries.json');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(ENTRIES_FILE)) {
  fs.writeFileSync(ENTRIES_FILE, '[]');
}

export function getUploadsDir(): string {
  return UPLOADS_DIR;
}

function readEntries(): CapsuleEntry[] {
  return JSON.parse(fs.readFileSync(ENTRIES_FILE, 'utf-8'));
}

function writeEntries(entries: CapsuleEntry[]): void {
  fs.writeFileSync(ENTRIES_FILE, JSON.stringify(entries, null, 2));
}

export function listEntries(): CapsuleEntry[] {
  return readEntries().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addEntry(entry: {
  title: string;
  text: string;
  imageUrl: string | null;
}): CapsuleEntry {
  const entries = readEntries();
  const newEntry: CapsuleEntry = {
    id: Math.random().toString(36).slice(2, 10),
    title: entry.title,
    text: entry.text,
    imageUrl: entry.imageUrl,
    createdAt: new Date().toISOString(),
  };
  entries.push(newEntry);
  writeEntries(entries);
  return newEntry;
}

export function deleteEntry(id: string): void {
  const entries = readEntries();
  const entry = entries.find((e) => e.id === id);
  if (entry?.imageUrl) {
    const filePath = path.join(UPLOADS_DIR, path.basename(entry.imageUrl));
    fs.rm(filePath, { force: true }, () => {});
  }
  writeEntries(entries.filter((e) => e.id !== id));
}
