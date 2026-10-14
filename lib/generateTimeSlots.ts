export type TimeSlot = {
  /** Display text, e.g. "6:15 PM" */
  label: string;
  /** 24h hour, 0-23 (use this to build the Date, never parse `label`) */
  hours: number;
  /** 0-59 */
  minutes: number;
};

const START_MINUTES = 18 * 60; // 6:00 PM
const END_MINUTES = 22 * 60; // 10:00 PM (inclusive)

const EMPTY_MESSAGE =
  "No slots left for this date. Please select the next date.";

function formatSlot(totalMinutes: number): TimeSlot {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return {
    label: `${hour12}:${String(minutes).padStart(2, "0")} ${period}`,
    hours,
    minutes,
  };
}

/**
 * Evening slots (6:00 PM - 10:00 PM) for a given calendar day.
 *
 * - Works on minutes-since-midnight, so no Date mutation and no DST surprises.
 * - For today, hides slots that start sooner than `leadMinutes` from now.
 * - For a past day, returns no slots.
 */
export function getEveningTimeSlots(
  selectedDate: Date,
  intervalMinutes = 15,
  leadMinutes = 30,
  now: Date = new Date(),
): { slots: TimeSlot[]; message?: string } {
  const dayStart = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const selectedStart = dayStart(selectedDate);
  const todayStart = dayStart(now);

  if (selectedStart < todayStart) {
    return { slots: [], message: EMPTY_MESSAGE };
  }

  const isToday = selectedStart === todayStart;
  const earliest = now.getHours() * 60 + now.getMinutes() + leadMinutes;

  const slots: TimeSlot[] = [];
  for (let m = START_MINUTES; m <= END_MINUTES; m += intervalMinutes) {
    if (isToday && m < earliest) continue;
    slots.push(formatSlot(m));
  }

  return slots.length === 0 ? { slots, message: EMPTY_MESSAGE } : { slots };
}
