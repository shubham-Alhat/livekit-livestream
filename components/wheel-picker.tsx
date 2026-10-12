"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

export const ITEM_H = 36; // px, must match the h-9 class below
const VISIBLE = 5; // odd number of visible rows
const PAD = ITEM_H * ((VISIBLE - 1) / 2);

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Props<T extends string | number> = {
  values: readonly T[];
  value: T;
  onChange: (value: T) => void;
  format?: (value: T) => string;
  /** Endless wheel (hours, minutes). Off for AM/PM. */
  loop?: boolean;
  label: string;
  className?: string;
};

export default function WheelPicker<T extends string | number>({
  values,
  value,
  onChange,
  format = String,
  loop = false,
  label,
  className = "",
}: Props<T>) {
  const n = values.length;
  const copies = loop ? 3 : 1;
  const total = n * copies;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touching = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const raf = useRef(0);
  const didMount = useRef(false);

  // Always call the newest props from async callbacks (scroll, timers)
  const latest = useRef({ value, onChange, values });
  useIsoLayoutEffect(() => {
    latest.current = { value, onChange, values };
  });

  const items = useMemo(
    () => Array.from({ length: total }, (_, i) => values[i % n]),
    [values, n, total],
  );

  // Rotate / fade rows based on their distance from the centre (iOS drum look).
  // Written straight to the DOM so scrolling never triggers a React render.
  const paint = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const pos = el.scrollTop / ITEM_H;
    const from = Math.max(0, Math.floor(pos) - 3);
    const to = Math.min(total - 1, Math.ceil(pos) + 3);
    for (let i = from; i <= to; i++) {
      const node = itemRefs.current[i];
      if (!node) continue;
      const d = Math.max(-3, Math.min(3, i - pos));
      const abs = Math.abs(d);
      node.style.transform = `rotateX(${-d * 22}deg) scale(${1 - abs * 0.04})`;
      node.style.opacity = String(Math.max(0.15, 1 - abs * 0.3));
    }
  }, [total]);

  // Once scrolling has stopped: recentre (loop) and commit the value.
  const settle = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || touching.current) return;

    const idx = Math.max(
      0,
      Math.min(total - 1, Math.round(el.scrollTop / ITEM_H)),
    );
    const realIdx = idx % n;

    if (loop && (idx < n || idx >= 2 * n)) {
      el.scrollTop = (n + realIdx) * ITEM_H; // invisible jump to the middle copy
      paint();
    }

    const next = latest.current.values[realIdx];
    if (next !== latest.current.value) latest.current.onChange(next);
  }, [loop, n, total, paint]);

  const armSettle = useCallback(() => {
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(settle, 120);
  }, [settle]);

  const handleScroll = () => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(paint);
    armSettle();
  };

  // Keep the wheel in sync when `value` is changed from outside.
  useIsoLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const vi = values.indexOf(value);
    if (vi < 0) return;

    const first = !didMount.current;
    didMount.current = true;
    const curIdx = Math.round(el.scrollTop / ITEM_H);

    if (!first && curIdx % n === vi) return; // already showing it

    let target = vi;
    if (loop) {
      target = n + vi; // middle copy
      if (!first) {
        // pick the nearest copy so the wheel takes the shortest path
        const candidates = [vi, n + vi, 2 * n + vi];
        target = candidates.reduce((best, c) =>
          Math.abs(c - curIdx) < Math.abs(best - curIdx) ? c : best,
        );
      }
    }

    if (first) el.scrollTop = target * ITEM_H;
    else el.scrollTo({ top: target * ITEM_H, behavior: "smooth" });
    paint();
  }, [value, values, n, loop, paint]);

  useEffect(
    () => () => {
      clearTimeout(settleTimer.current);
      cancelAnimationFrame(raf.current);
    },
    [],
  );

  const scrollToIndex = (idx: number) => {
    const clamped = Math.max(0, Math.min(total - 1, idx));
    scrollerRef.current?.scrollTo({
      top: clamped * ITEM_H,
      behavior: "smooth",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const el = scrollerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / ITEM_H);
    scrollToIndex(idx + (e.key === "ArrowDown" ? 1 : -1));
  };

  return (
    <div
      className={`relative ${className}`}
      style={{ height: ITEM_H * VISIBLE }}
    >
      <div
        ref={scrollerRef}
        role="listbox"
        aria-label={label}
        tabIndex={0}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        onTouchStart={() => {
          touching.current = true;
          clearTimeout(settleTimer.current);
        }}
        onTouchEnd={() => {
          touching.current = false;
          armSettle();
        }}
        onTouchCancel={() => {
          touching.current = false;
          armSettle();
        }}
        style={{ perspective: "700px" }}
        className="h-full touch-pan-y snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-lg outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&::-webkit-scrollbar]:hidden"
      >
        <div aria-hidden className="shrink-0" style={{ height: PAD }} />
        {items.map((item, i) => (
          <div
            key={i}
            ref={(node) => {
              itemRefs.current[i] = node;
            }}
            role="option"
            aria-selected={item === value}
            onClick={() => scrollToIndex(i)}
            className="flex h-9 cursor-pointer select-none snap-center items-center justify-center text-xl tabular-nums text-foreground will-change-transform [backface-visibility:hidden]"
          >
            {format(item)}
          </div>
        ))}
        <div aria-hidden className="shrink-0" style={{ height: PAD }} />
      </div>
    </div>
  );
}
