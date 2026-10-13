/**
 Generates available 15-minute time slots between 6:00 PM and 10:00 PM in 12-hour format.
 
 */
export function getEveningTimeSlots(
  selectedDate: Date | string,
  intervalMinutes: number = 15,
): { slots: string[]; message?: string } {
  const selected = new Date(selectedDate);
  const now = new Date();

  // Check if the selected date is today
  const isToday =
    selected.getFullYear() === now.getFullYear() &&
    selected.getMonth() === now.getMonth() &&
    selected.getDate() === now.getDate();

  const slots = [];

  // Range: 18:00 (6:00 PM) to 22:00 (10:00 PM)
  const startHour = 18;
  const endHour = 22;

  let slotTime = new Date(selected);
  slotTime.setHours(startHour, 0, 0, 0);

  const endTime = new Date(selected);
  endTime.setHours(endHour, 0, 0, 0);

  while (slotTime <= endTime) {
    if (!isToday || slotTime > now) {
      let hours = slotTime.getHours();
      const minutes = slotTime.getMinutes();

      // Convert to 12-hour format
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // Handle hour '0' as '12'

      const formattedHours = String(hours).padStart(2, "0");
      const formattedMinutes = String(minutes).padStart(2, "0");

      slots.push(`${formattedHours}:${formattedMinutes} ${ampm}`);
    }

    slotTime.setMinutes(slotTime.getMinutes() + intervalMinutes);
  }

  if (slots.length === 0) {
    return {
      slots: [],
      message: "No available slots for today. Please select the next date.",
    };
  }

  return { slots };
}
