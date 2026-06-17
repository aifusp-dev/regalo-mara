type Player = { name: string; picture?: string; score: number };

export function ScoreChart({ players }: { players: Player[] }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const maxScore = Math.max(1, ...sorted.map((p) => p.score));

  return (
    <div className="flex w-full flex-col gap-3">
      {sorted.map((p, i) => (
        <div key={i} className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-display text-black/80 dark:text-white/80">
              {i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : ''}
              {p.name}
            </span>
            <span className="font-mono text-black/70 dark:text-white/70">
              {p.score}
            </span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-pink to-brand-cyan transition-all duration-700 ease-out"
              style={{ width: `${(p.score / maxScore) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
