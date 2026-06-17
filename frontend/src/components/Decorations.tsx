const items = [
  { emoji: '🎈', top: '6%', left: '8%', size: 'text-5xl', anim: 'animate-float', opacity: 'opacity-70' },
  { emoji: '✨', top: '14%', left: '85%', size: 'text-3xl', anim: 'animate-float-slow', opacity: 'opacity-60' },
  { emoji: '🎉', top: '78%', left: '6%', size: 'text-4xl', anim: 'animate-float-slow', opacity: 'opacity-60' },
  { emoji: '🎊', top: '85%', left: '88%', size: 'text-5xl', anim: 'animate-float', opacity: 'opacity-70' },
  { emoji: '⭐', top: '40%', left: '3%', size: 'text-2xl', anim: 'animate-float', opacity: 'opacity-50' },
  { emoji: '💖', top: '8%', left: '45%', size: 'text-2xl', anim: 'animate-float-slow', opacity: 'opacity-50' },
  { emoji: '🌟', top: '60%', left: '92%', size: 'text-3xl', anim: 'animate-float', opacity: 'opacity-60' },
];

export function Decorations() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {items.map((item, i) => (
        <span
          key={i}
          className={`absolute ${item.size} ${item.anim} ${item.opacity}`}
          style={{ top: item.top, left: item.left }}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
}
