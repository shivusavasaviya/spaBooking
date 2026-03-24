

export const BOOKING_STATUSES = {
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

export const GENDER_COLORS = {
  female: '#EC4899',
  male: '#3B82F6'
};

const MINUTES_INTERVAL = 15; // 15 minute slots

// Total slots = (hours * 60) / interval
// (12 hours * 60) / 15 = 48 slots

// Height per row in pixels

// Total height for one therapist row
// Business hours: 9:00 AM to 9:00 PM
export const START_HOUR = 9;  // 9 AM
export const END_HOUR = 21;   // 9 PM
export const ROW_HEIGHT = 20;

export const TOTAL_ROWS = ((END_HOUR - START_HOUR) * 60) / MINUTES_INTERVAL; // = 48
export const THERAPIST_ROW_HEIGHT = TOTAL_ROWS * ROW_HEIGHT; // 48 * 20 = 960px

export const TIME_SLOTS = Array.from({ length: TOTAL_ROWS }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});
 