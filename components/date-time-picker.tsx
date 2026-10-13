"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getEveningTimeSlots } from "@/lib/generateTimeSlots";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ["AM", "PM"] as const;
type Period = (typeof PERIODS)[number];

const pad = (n: number) => String(n).padStart(2, "0");

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export const getMinDate = () => {
  const now = new Date();
  return now;
};

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Fallback start: now + 5 minutes, seconds and ms zeroed */
function getSafeStart() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 5, 0, 0);
  return d;
}

/** Next full hour from now */
function defaultStart() {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return d;
}

type Props = {
  /** The selected moment. Store `value.toISOString()` (UTC) in your DB. */
  value: Date | null;
  onChange: (date: Date) => void;
};

export default function DateTimePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date | null>(
    value ? startOfMonth(value) : null,
  );
  const [today, setToday] = useState<Date | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const slideDir = useRef(0);

  useEffect(() => {
    setToday(new Date());
  }, []);

  // Single source of truth is `value`; the wheels are derived from it.
  const hour12 = value ? value.getHours() % 12 || 12 : 12;
  const minute = value ? value.getMinutes() : 0;
  const period: Period = value && value.getHours() >= 12 ? "PM" : "AM";

  const commit = (next: Date) => {
    console.log("commit runs here");
    const d = new Date(next);
    d.setSeconds(0, 0);
    onChange(d < getMinDate() ? getSafeStart() : d);
  };

  const setTime = (parts: {
    hour12?: number;
    minute?: number;
    period?: Period;
  }) => {
    const base = value ?? defaultStart();
    const h = parts.hour12 ?? (base.getHours() % 12 || 12);
    const m = parts.minute ?? base.getMinutes();
    const p = parts.period ?? (base.getHours() >= 12 ? "PM" : "AM");
    const next = new Date(base);
    next.setHours((h % 12) + (p === "PM" ? 12 : 0), m, 0, 0);
    commit(next);
  };

  const setDay = (day: number) => {
    if (!viewDate) return;
    const base = value ?? defaultStart();
    commit(
      new Date(
        viewDate.getFullYear(),
        viewDate.getMonth(),
        day,
        base.getHours(),
        base.getMinutes(),
      ),
    );
  };

  const toggle = () => {
    if (open) {
      // setTimeOpen(false);
    } else {
      const base = value ?? defaultStart();
      if (!value) onChange(base);
      setViewDate(startOfMonth(base));
    }
    setOpen((o) => !o);
  };

  const changeMonth = (dir: 1 | -1) => {
    if (!viewDate) return;
    slideDir.current = dir;
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + dir, 1));
  };

  // Slide the day grid in when the month changes
  const viewKey = viewDate
    ? viewDate.getFullYear() * 12 + viewDate.getMonth()
    : -1;
  useEffect(() => {
    const el = gridRef.current;
    const dir = slideDir.current;
    slideDir.current = 0;
    if (!el || !dir) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.animate(
      [
        { opacity: 0, transform: `translateX(${dir * 18}px)` },
        { opacity: 1, transform: "translateX(0)" },
      ],
      { duration: 240, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
  }, [viewKey]);

  const cells: (number | null)[] = viewDate
    ? [
        ...Array<null>(viewDate.getDay()).fill(null),
        ...Array.from(
          {
            length: new Date(
              viewDate.getFullYear(),
              viewDate.getMonth() + 1,
              0,
            ).getDate(),
          },
          (_, i) => i + 1,
        ),
      ]
    : [];

  const canGoPrev = !viewDate || startOfMonth(viewDate) > getMinDate();

  const isDayDisabled = (day: number) =>
    !!viewDate &&
    new Date(
      viewDate.getFullYear(),
      viewDate.getMonth(),
      day,
      23,
      59,
      59,
      999,
    ) < getMinDate();

  return (
    <div
      className={`rounded-xl bg-card py-2 text-card-foreground transition-shadow duration-300 sm:py-3 ${
        open ? "shadow-2xl shadow-black/20" : ""
      }`}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex min-h-12 w-full touch-manipulation items-center justify-between gap-3 rounded-xl px-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
      >
        <span
          className={`text-primary font-medium tracking-tight ${
            value ? "" : "text-muted-foreground"
          }`}
        >
          {value ? dateFormatter.format(value) : "Select date and time"}
        </span>
        <CalendarDays
          className="size-4.5 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity,margin,visibility] duration-400 ease-out ${
          open
            ? "visible mt-2 grid-rows-[1fr] opacity-100"
            : "invisible mt-0 grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          {viewDate && (
            <div className="bg-background p-3 sm:p-4">
              {/* Month header */}
              <div className="mb-3 flex items-center justify-between sm:mb-4">
                <h2 className="text-[16px] font-semibold tracking-tight sm:text-[22px]">
                  {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    disabled={!canGoPrev}
                    aria-label="Previous month"
                    className="grid size-8 touch-manipulation place-items-center rounded-full text-primary transition hover:bg-accent disabled:pointer-events-none disabled:text-muted-foreground/40"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    aria-label="Next month"
                    className="grid size-8 touch-manipulation place-items-center rounded-full text-primary transition hover:bg-accent"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              </div>

              {/* Weekdays + days */}
              <div className="grid grid-cols-7 text-center">
                {WEEKDAYS.map((d) => (
                  <span
                    key={d}
                    className="pb-2 text-sm font-medium text-muted-foreground"
                  >
                    {d}
                  </span>
                ))}
              </div>
              <div
                // added key here to solve flash UI bug
                key={viewKey}
                ref={gridRef}
                className="grid grid-cols-7 gap-y-1 text-center"
              >
                {cells.map((day, i) => {
                  if (!day) return <span key={`empty-${i}`} />;
                  const date = new Date(
                    viewDate.getFullYear(),
                    viewDate.getMonth(),
                    day,
                  );
                  const active = !!value && sameDay(date, value);
                  const isToday = !!today && sameDay(date, today);
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isDayDisabled(day)}
                      onClick={() => setDay(day)}
                      aria-pressed={active}
                      aria-current={isToday ? "date" : undefined}
                      aria-label={date.toDateString()}
                      className={`mx-auto flex aspect-square w-full max-w-11 touch-manipulation items-center justify-center rounded-full text-lg transition-colors duration-200 disabled:pointer-events-none disabled:text-muted-foreground/40 sm:text-xl ${
                        active
                          ? "bg-[#EA2412] font-semibold text-primary"
                          : isToday
                            ? "font-semibold text-primary hover:bg-accent"
                            : "text-foreground hover:bg-accent"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Time row */}
              <div className="mt-4 border-t border-border px-1 pt-4 grid grid-cols-3 gap-y-2 gap-x-2">

                
                  
                
                <button
                  type="button"
                  className="touch-manipulation rounded-lg px-2 py-1.5 text-xl leading-none tabular-nums transition-colors bg-accent text-primary"
                >
                  {hour12}:{pad(minute)}
                </button>}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
              }}
              className="touch-manipulation rounded-lg px-3 py-2 text-base font-medium text-primary transition hover:bg-accent"
            >
              <CheckCheck size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
