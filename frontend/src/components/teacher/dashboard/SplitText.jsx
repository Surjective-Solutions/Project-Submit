'use client';

import { createElement, useLayoutEffect, useMemo, useRef } from 'react';

// Text whose letters (or words) animate in one after another.
//
//   <SplitText text="Hello, you!" effect="rise" splitType="chars" delay={50} duration={1.25} trigger="view" />
//
// Props (all optional except `text`):
//   text            the words to show
//   effect          "rise" | "drop" | "fade" | "scale" | "blur"      how each piece comes in
//   splitType       "chars" | "words"                                 what animates on its own
//   delay           milliseconds between one piece and the next
//   duration        seconds for one piece to come in
//   staggerFrom     "start" | "end" | "center" | "edges"              where the wave begins
//   ease            any CSS easing (default: a soft ease-out)
//   trigger         "view" (when it scrolls into view) | "load" (right away)
//   threshold       how much of the text must be in view (0 to 1)
//   rootMargin      shrinks (negative) or grows the area that counts as "in view", e.g. "-100px"
//   hoverEffect     "lift" | "scale" | "none"                         what a letter does under the pointer
//   loop, loopDelay  with loop on, wait loopDelay seconds once it is in, take it out and bring it in again
//   mask            true: pieces slide in from behind an invisible line instead of fading
//   textAlign, className, style, as (the tag, "span" by default)
//   onLetterAnimationComplete   called each time every piece has finished coming in
//
// It reads normally to screen readers, and shows plain, still text when the visitor prefers reduced motion.

const DISTANCE = '0.8em';
const EFFECTS = {
  rise: { from: { opacity: 0, transform: `translateY(${DISTANCE})` }, to: { opacity: 1, transform: 'translateY(0)' } },
  drop: { from: { opacity: 0, transform: `translateY(-${DISTANCE})` }, to: { opacity: 1, transform: 'translateY(0)' } },
  fade: { from: { opacity: 0, transform: 'translateY(0)' }, to: { opacity: 1, transform: 'translateY(0)' } },
  scale: { from: { opacity: 0, transform: 'scale(0.5)' }, to: { opacity: 1, transform: 'scale(1)' } },
  blur: { from: { opacity: 0, transform: 'translateY(0)', filter: 'blur(8px)' }, to: { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' } },
};
// Behind a mask a piece slides in whole, so it is not faded.
const MASKED = {
  rise: { from: { opacity: 1, transform: 'translateY(110%)' }, to: { opacity: 1, transform: 'translateY(0)' } },
  drop: { from: { opacity: 1, transform: 'translateY(-110%)' }, to: { opacity: 1, transform: 'translateY(0)' } },
};
export function framesFor(effect, mask) {
  return (mask && MASKED[effect]) || EFFECTS[effect] || EFFECTS.rise;
}

// How long piece `i` of `n` waits before it starts, in seconds.
export function delayFor(i, n, from, stagger) {
  if (from === 'end') return (n - 1 - i) * stagger;
  if (from === 'center') return Math.abs(i - (n - 1) / 2) * stagger;
  if (from === 'edges') return Math.min(i, n - 1 - i) * stagger;
  return i * stagger;
}

const HOVER = { lift: 'translateY(-0.14em)', scale: 'scale(1.18)' };
const hiddenText = { position: 'absolute', width: 1, height: 1, margin: -1, padding: 0, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0 };

// "Hello, you!" -> [{ word: "Hello," }, { space: " " }, { word: "you!" }]
function tokens(text) {
  return String(text)
    .split(/(\s+)/)
    .filter((part) => part !== '')
    .map((part) => (/^\s+$/.test(part) ? { space: ' ' } : { word: part }));
}

// "-100px" -> -100 (only the first value, in px, is used)
const marginPx = (value) => {
  const n = parseFloat(String(value || '0'));
  return Number.isFinite(n) ? n : 0;
};

export default function SplitText({
  text,
  className,
  effect = 'rise',
  splitType = 'chars',
  delay = 50,
  duration = 1.25,
  staggerFrom = 'start',
  ease = 'cubic-bezier(0.22, 1, 0.36, 1)',
  trigger = 'view',
  threshold = 0.1,
  rootMargin = '0px',
  hoverEffect = 'lift',
  loop = false,
  loopDelay = 1.5,
  mask = false,
  textAlign,
  style,
  as = 'span',
  onLetterAnimationComplete,
}) {
  const rootRef = useRef(null);
  const doneRef = useRef(onLetterAnimationComplete);
  doneRef.current = onLetterAnimationComplete;
  const parts = useMemo(() => tokens(text), [text]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const units = [...root.querySelectorAll('[data-split-unit]')];
    const calm = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!units.length || calm || typeof units[0].animate !== 'function') return undefined; // plain text

    let stopped = false;
    let timer = 0;
    let observer = null;
    const cleanups = [];
    const { from, to } = framesFor(effect, mask);
    const stagger = delay / 1000;

    // Start hidden, so nothing shows before it comes in.
    units.forEach((unit) => Object.assign(unit.style, from));

    const sleep = (seconds) => new Promise((resolve) => { timer = window.setTimeout(resolve, seconds * 1000); });

    // Brings every piece in (or takes it out), each after its own delay, and keeps the end state.
    async function play(toIn) {
      const animations = units.map((unit, i) =>
        unit.animate(toIn ? [from, to] : [to, from], {
          duration: (toIn ? duration : Math.min(duration, 0.5)) * 1000,
          delay: delayFor(i, units.length, staggerFrom, stagger) * 1000,
          easing: toIn ? ease : 'ease-in',
          fill: 'both',
        }),
      );
      cleanups.push(() => animations.forEach((a) => a.cancel()));
      await Promise.all(animations.map((a) => a.finished.catch(() => {})));
      if (stopped) return;
      // Keep the end state as plain styles and drop the finished animations.
      animations.forEach((a) => {
        try {
          a.commitStyles();
        } catch {
          // The piece is not on screen; the animation's own end state stays.
        }
        a.cancel();
      });
      if (toIn) doneRef.current?.();
    }

    async function run() {
      await play(true);
      while (!stopped && loop) {
        await sleep(loopDelay);
        if (stopped) break;
        await play(false);
        if (stopped) break;
        await play(true);
      }
    }

    // When to start. The area that counts as "in view" is shrunk by rootMargin, but text that is already on screen
    // above that line (a heading at the top of the page) starts at once, so it is never left hidden.
    const box = root.getBoundingClientRect();
    const viewport = window.innerHeight || document.documentElement.clientHeight;
    const triggerLine = viewport + Math.min(0, marginPx(rootMargin)); // a negative margin moves the bottom edge up
    const onScreen = box.bottom > 0 && box.top < viewport;
    if (trigger === 'load' || typeof IntersectionObserver === 'undefined' || (onScreen && box.top < triggerLine)) {
      run();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer.disconnect();
            run();
          }
        },
        { threshold, rootMargin },
      );
      observer.observe(root);
    }

    // A letter under the pointer lifts (or grows), and settles when the pointer leaves.
    const hover = HOVER[hoverEffect];
    if (hover) {
      const inner = (event) => (event.pointerType === 'touch' ? null : event.target.closest?.('[data-split-inner]'));
      const over = (event) => {
        const el = inner(event);
        if (el && root.contains(el)) el.style.transform = hover;
      };
      const out = (event) => {
        const el = inner(event);
        if (el) el.style.transform = '';
      };
      root.addEventListener('pointerover', over);
      root.addEventListener('pointerout', out);
      cleanups.push(() => {
        root.removeEventListener('pointerover', over);
        root.removeEventListener('pointerout', out);
      });
    }

    return () => {
      stopped = true;
      window.clearTimeout(timer);
      observer?.disconnect();
      cleanups.forEach((fn) => fn());
      units.forEach((unit) => {
        unit.style.transform = '';
        unit.style.opacity = '';
        unit.style.filter = '';
      });
    };
  }, [parts, effect, delay, duration, staggerFrom, ease, trigger, threshold, rootMargin, hoverEffect, loop, loopDelay, mask]);

  const wrapStyle = mask ? { display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.14em', marginBottom: '-0.14em' } : { display: 'inline-block' };
  const unitStyle = { display: 'inline-block', willChange: 'transform, opacity' };
  const innerStyle = { display: 'inline-block', transition: 'transform 0.25s ease-out' };
  const piece = (content, key) => (
    <span key={key} style={wrapStyle}>
      <span data-split-unit="" style={unitStyle}>
        <span data-split-inner="" style={innerStyle}>
          {content}
        </span>
      </span>
    </span>
  );

  return createElement(
    as,
    { ref: rootRef, className, style: { display: 'inline-block', textAlign, ...style } },
    <span data-split-sr="" style={hiddenText}>
      {text}
    </span>,
    <span aria-hidden="true">
      {parts.map((part, i) => {
        if (part.space) return ' ';
        if (splitType === 'words') return piece(part.word, i);
        // Each word stays in one piece so lines only break between words.
        return (
          <span key={i} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {Array.from(part.word).map((char, j) => piece(char, `${i}-${j}`))}
          </span>
        );
      })}
    </span>,
  );
}
