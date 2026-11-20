"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";

/**
 * ExamFlow page transition.
 *
 * 1. COVER   – brand-colour layers sweep in from the left with a slanted edge.
 * 2. SWAP    – the route changes underneath while the screen is covered.
 * 3. REVEAL  – the cover becomes a circle that turns into the brand globe,
 *              spinning as it shrinks away to reveal the new page.
 *
 * No dependencies — Web Animations API + CSS clip-path / transforms.
 *
 * Next.js notes: the logo is served from /public, and a page can call
 * useTransitionReady(false) while it is still loading so the reveal waits for it.
 */

export const BRAND = {
  darkRed: "#e72425",
  coral: "#f3755d",
  red: "#ed1e28",
  cyan: "#24a5cc",
  navy: "#2f3795",
  paleYellow: "#f4ec8e",
  yellow: "#f7df46",
};

const TransitionContext = createContext(null);

const EASE_IN_OUT = "cubic-bezier(0.76, 0, 0.24, 1)";
const EASE_REVEAL = "cubic-bezier(0.65, 0, 0.3, 1)";

const DEFAULTS = {
  color: BRAND.navy, // the colour that fully covers the screen (and the circle starts as)
  stripes: [BRAND.yellow, BRAND.cyan, BRAND.red], // layers that sweep in before it
  logo: "/images/brand-globe.svg", // image the circle turns into (public/images/brand-globe.svg)
  cover: "stripes", // "stripes" | "wipe" | "iris"
  reveal: "globe", // "globe" | "iris" | "wipe"
  coverDuration: 480, // ms per layer
  stagger: 70, // ms between stripe layers
  holdDuration: 120, // ms the screen stays covered after the page swap
  revealDuration: 950, // ms
  spin: 150, // degrees the globe unwinds while shrinking (ends upright)
  origin: null, // { x, y } px for the circle centre; null = screen centre
  maxWait: 3000, // ms to wait at most for a page that is still loading
};

const HIDDEN = "inset(0 100% 0 0)";

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function center(origin) {
  return {
    x: origin?.x ?? window.innerWidth / 2,
    y: origin?.y ?? window.innerHeight / 2,
  };
}

// Distance to the farthest corner, so a circle of this radius covers the screen.
function coverRadius({ x, y }) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return Math.ceil(Math.hypot(Math.max(x, w - x), Math.max(y, h - y))) + 2;
}

function coverFrames(kind, origin) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (kind === "iris") {
    const c = center(origin);
    return [`circle(0px at ${c.x}px ${c.y}px)`, `circle(${coverRadius(c)}px at ${c.x}px ${c.y}px)`];
  }
  if (kind === "wipe") return ["inset(0 100% 0 0)", "inset(0 0% 0 0)"];
  // "stripes": straight wipe with a slanted leading edge (top leads)
  const s = Math.round(h * 0.35);
  return [
    `polygon(0px 0px, 0px 0px, ${-s}px ${h}px, 0px ${h}px)`,
    `polygon(0px 0px, ${w + s}px 0px, ${w}px ${h}px, 0px ${h}px)`,
  ];
}

export function PageTransitionProvider({ children, defaults }) {
  const layersRef = useRef([]);
  const globeRef = useRef(null);
  const discRef = useRef(null);
  const logoRef = useRef(null);
  const busyRef = useRef(false);
  const holdsRef = useRef(new Set());
  const waitersRef = useRef([]);
  const base = useMemo(() => ({ ...DEFAULTS, ...defaults }), [defaults]);

  const maxLayers = Math.max(base.stripes.length + 1, 6);

  // Decode the logo up front so the first transition doesn't flash.
  useEffect(() => {
    logoRef.current?.decode?.().catch(() => {});
  }, [base.logo]);

  // A page that is still loading can ask the reveal to wait (see useTransitionReady).
  const hold = useCallback(() => {
    const token = {};
    holdsRef.current.add(token);
    return () => {
      holdsRef.current.delete(token);
      if (holdsRef.current.size === 0) waitersRef.current.splice(0).forEach((resolve) => resolve());
    };
  }, []);

  const whenReleased = useCallback(
    (maxMs) =>
      holdsRef.current.size === 0
        ? Promise.resolve()
        : new Promise((resolve) => {
            const done = () => {
              clearTimeout(timer);
              resolve();
            };
            const timer = setTimeout(done, maxMs);
            waitersRef.current.push(done);
          }),
    []
  );

  const reset = useCallback(() => {
    layersRef.current.forEach((el) => {
      if (!el) return;
      el.getAnimations().forEach((a) => a.cancel());
      el.style.clipPath = HIDDEN;
      el.style.visibility = "hidden";
    });
    [globeRef.current, discRef.current, logoRef.current].forEach((el) =>
      el?.getAnimations().forEach((a) => a.cancel())
    );
    if (globeRef.current) globeRef.current.style.visibility = "hidden";
  }, []);

  /**
   * Run `action` (e.g. () => navigate("/exams")) while the screen is covered.
   * If `action` returns a promise (lazy route, data fetch), the reveal waits for it.
   */
  const transition = useCallback(
    async (action, options = {}) => {
      if (busyRef.current) return;
      const opts = { ...base, ...options };

      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion || !layersRef.current[0]) {
        await action?.();
        return;
      }

      busyRef.current = true;
      const blocker = layersRef.current[0].parentElement;
      blocker.style.pointerEvents = "auto";

      try {
        // 1. Cover ------------------------------------------------------------
        const colours = opts.cover === "stripes" ? [...opts.stripes, opts.color] : [opts.color];
        const layers = colours.map((c, i) => {
          const el = layersRef.current[i];
          el.style.background = c;
          el.style.visibility = "visible";
          return el;
        });
        const [from, to] = coverFrames(opts.cover, opts.origin);
        await Promise.all(
          layers.map(
            (el, i) =>
              el.animate([{ clipPath: from }, { clipPath: to }], {
                duration: opts.coverDuration,
                delay: i * opts.stagger,
                easing: EASE_IN_OUT,
                fill: "both",
              }).finished
          )
        );
        const top = layers[layers.length - 1];
        layers.forEach((el) => {
          el.style.clipPath = "none";
          el.getAnimations().forEach((a) => a.cancel());
          if (el !== top) el.style.visibility = "hidden";
        });

        // 2. Swap the page underneath ----------------------------------------
        await action?.();
        window.scrollTo(0, 0);
        await nextFrame();
        await nextFrame();
        await whenReleased(opts.maxWait); // the new page asked us to wait until it has loaded
        await wait(opts.holdDuration);

        // 3. Reveal -----------------------------------------------------------
        const c = center(opts.origin);
        const R = coverRadius(c);
        const timing = { duration: opts.revealDuration, easing: EASE_REVEAL, fill: "forwards" };

        if (opts.reveal === "globe") {
          const globe = globeRef.current;
          Object.assign(globe.style, {
            left: `${c.x - R}px`,
            top: `${c.y - R}px`,
            width: `${2 * R}px`,
            height: `${2 * R}px`,
            visibility: "visible",
          });
          discRef.current.style.background = opts.color;
          logoRef.current.src = opts.logo;
          top.style.visibility = "hidden"; // the full-size disc now covers the screen instead

          const linear = { duration: opts.revealDuration, easing: "linear", fill: "forwards" };
          await Promise.all([
            globe.animate(
              [
                { transform: `scale(1) rotate(${opts.spin}deg)` },
                { transform: "scale(0) rotate(0deg)" },
              ],
              timing
            ).finished,
            // circle → brand globe: the globe fades in over the solid circle,
            // then the circle drops away so the page shows through the gaps.
            logoRef.current.animate(
              [{ opacity: 0 }, { opacity: 0, offset: 0.06 }, { opacity: 1, offset: 0.22 }, { opacity: 1 }],
              linear
            ).finished,
            discRef.current.animate(
              [{ opacity: 1 }, { opacity: 1, offset: 0.24 }, { opacity: 0, offset: 0.4 }, { opacity: 0 }],
              linear
            ).finished,
          ]);
        } else {
          const frames =
            opts.reveal === "wipe"
              ? ["inset(0 0 0 0%)", "inset(0 0 0 100%)"]
              : [`circle(${R}px at ${c.x}px ${c.y}px)`, `circle(0px at ${c.x}px ${c.y}px)`];
          await top.animate([{ clipPath: frames[0] }, { clipPath: frames[1] }], timing).finished;
        }
      } finally {
        reset();
        blocker.style.pointerEvents = "none";
        busyRef.current = false;
      }
    },
    [base, reset, whenReleased]
  );

  const value = useMemo(() => ({ transition, hold }), [transition, hold]);

  const fill = { position: "absolute", inset: 0, clipPath: HIDDEN, visibility: "hidden", willChange: "clip-path" };

  return (
    <TransitionContext.Provider value={value}>
      {children}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none", overflow: "hidden" }}>
        {Array.from({ length: maxLayers }, (_, i) => (
          <div
            key={i}
            ref={(el) => {
              layersRef.current[i] = el;
            }}
            style={fill}
          />
        ))}
        <div ref={globeRef} style={{ position: "absolute", visibility: "hidden", willChange: "transform" }}>
          <div ref={discRef} style={{ position: "absolute", inset: 0, borderRadius: "50%", background: base.color }} />
          <img
            ref={logoRef}
            src={base.logo}
            alt=""
            draggable="false"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, objectFit: "contain" }}
          />
        </div>
      </div>
    </TransitionContext.Provider>
  );
}

export function usePageTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("usePageTransition must be used inside <PageTransitionProvider>");
  return ctx;
}

/**
 * Call from a page that loads data after it mounts. While `ready` is false, a running
 * transition keeps the screen covered, so the reveal shows the finished page.
 * Does nothing when there is no provider or no transition is running.
 */
export function useTransitionReady(ready = true) {
  const ctx = useContext(TransitionContext);
  useEffect(() => {
    if (ready || !ctx) return undefined;
    return ctx.hold();
  }, [ready, ctx]);
}

/** Like usePageTransition, but returns null instead of throwing when there is no provider. */
export function useOptionalPageTransition() {
  return useContext(TransitionContext);
}
