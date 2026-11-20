'use client';

import { useEffect, useRef } from 'react';

const EASINGS = { linear: 'linear', easeIn: 'ease-in', easeOut: 'ease-out', easeInOut: 'ease-in-out' };

// A light that travels around the edge of its parent, like a progress ring along the border.
// Put it inside a `relative` (or fixed / absolute) parent that has rounded corners; it follows those corners.
//
//   <BorderTrail className="bg-linear-to-l from-green-300 via-green-500 to-green-300" size={120}
//                transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }} />
//
// Props: className (colours the light), size (its length in px), thickness (how wide the line is in px, default 1),
// style, onAnimationComplete, and
// transition = { duration (seconds), repeat (extra laps; Infinity = until it is removed), ease, delay (seconds) }.
// ease is 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' or a cubic-bezier as [x1, y1, x2, y2].
// It uses the browser's own animation API, so it needs no extra package, and it stays still-and-hidden for people
// who ask for reduced motion.
export function BorderTrail({ className, size = 60, thickness = 1, transition, onAnimationComplete, style }) {
  const lightRef = useRef(null);
  const doneRef = useRef(onAnimationComplete);
  doneRef.current = onAnimationComplete;

  const duration = transition?.duration ?? 5;
  const repeat = transition?.repeat ?? Infinity;
  const delay = transition?.delay ?? 0;
  const ease = transition?.ease ?? 'linear';
  const easeKey = Array.isArray(ease) ? ease.join(',') : String(ease);

  useEffect(() => {
    const light = lightRef.current;
    if (!light || typeof light.animate !== 'function') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      light.style.display = 'none';
      return undefined;
    }
    const easing = easeKey.includes(',') ? `cubic-bezier(${easeKey})` : (EASINGS[easeKey] ?? 'linear');
    const animation = light.animate([{ offsetDistance: '0%' }, { offsetDistance: '100%' }], {
      duration: duration * 1000,
      delay: delay * 1000,
      iterations: repeat === Infinity ? Infinity : repeat + 1,
      easing,
      fill: 'forwards',
    });
    animation.onfinish = () => doneRef.current?.();
    return () => animation.cancel();
  }, [duration, repeat, delay, easeKey]);

  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]"
      style={{ borderWidth: thickness }}
    >
      <div
        ref={lightRef}
        className={`absolute aspect-square ${className || 'bg-zinc-500'}`}
        style={{ width: size, offsetPath: `rect(0 auto auto 0 round ${size}px)`, ...style }}
        aria-hidden="true"
      />
    </div>
  );
}
