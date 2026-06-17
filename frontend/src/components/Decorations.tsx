import { useState } from 'react';
import ajoloteAzul from '../assets/ajoloteazul.png';
import ajoloteRosa from '../assets/ajoloterosa.png';

type Decoration = {
  id: number;
  emoji?: string;
  img?: string;
  top: string;
  left: string;
  size: string;
  anim: string;
  opacity: string;
  poppable: boolean;
};

const initialItems: Decoration[] = [
  { id: 1, emoji: '🎈', top: '6%', left: '8%', size: 'text-5xl', anim: 'animate-float', opacity: 'opacity-70', poppable: true },
  { id: 2, emoji: '✨', top: '14%', left: '85%', size: 'text-3xl', anim: 'animate-float-slow', opacity: 'opacity-60', poppable: false },
  { id: 3, emoji: '🎉', top: '78%', left: '6%', size: 'text-4xl', anim: 'animate-float-slow', opacity: 'opacity-60', poppable: false },
  { id: 4, emoji: '🎊', top: '85%', left: '88%', size: 'text-5xl', anim: 'animate-float', opacity: 'opacity-70', poppable: false },
  { id: 5, emoji: '⭐', top: '40%', left: '3%', size: 'text-2xl', anim: 'animate-float', opacity: 'opacity-50', poppable: false },
  { id: 6, emoji: '💖', top: '8%', left: '45%', size: 'text-2xl', anim: 'animate-float-slow', opacity: 'opacity-50', poppable: false },
  { id: 7, emoji: '🌟', top: '60%', left: '92%', size: 'text-3xl', anim: 'animate-float', opacity: 'opacity-60', poppable: false },
  { id: 8, emoji: '🎈', top: '32%', left: '72%', size: 'text-4xl', anim: 'animate-float-slow', opacity: 'opacity-70', poppable: true },
  { id: 9, emoji: '🎈', top: '68%', left: '22%', size: 'text-4xl', anim: 'animate-float', opacity: 'opacity-70', poppable: true },
  { id: 10, img: ajoloteAzul, top: '20%', left: '12%', size: 'w-14', anim: 'animate-float-slow', opacity: 'opacity-80', poppable: false },
  { id: 11, img: ajoloteRosa, top: '72%', left: '80%', size: 'w-14', anim: 'animate-float', opacity: 'opacity-80', poppable: false },
];

function randomPosition() {
  return {
    top: `${5 + Math.random() * 85}%`,
    left: `${3 + Math.random() * 88}%`,
  };
}

export function Decorations() {
  const [items, setItems] = useState(initialItems);
  const [popping, setPopping] = useState<Set<number>>(new Set());

  function pop(id: number) {
    if (popping.has(id)) return;
    setPopping((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...randomPosition() } : item,
        ),
      );
      setPopping((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 250);
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {items.map((item) =>
        item.poppable ? (
          <button
            key={item.id}
            onClick={() => pop(item.id)}
            aria-label="Globo"
            className={`pointer-events-auto absolute cursor-pointer select-none transition-all duration-300 ${item.size} ${
              popping.has(item.id)
                ? 'scale-150 opacity-0'
                : `${item.anim} ${item.opacity} hover:scale-110`
            }`}
            style={{ top: item.top, left: item.left }}
          >
            {item.emoji}
          </button>
        ) : item.img ? (
          <img
            key={item.id}
            src={item.img}
            alt=""
            className={`absolute select-none [image-rendering:pixelated] ${item.size} ${item.anim} ${item.opacity}`}
            style={{ top: item.top, left: item.left }}
          />
        ) : (
          <span
            key={item.id}
            className={`absolute ${item.size} ${item.anim} ${item.opacity}`}
            style={{ top: item.top, left: item.left }}
          >
            {item.emoji}
          </span>
        ),
      )}
    </div>
  );
}
