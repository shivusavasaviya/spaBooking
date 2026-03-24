import { ROW_HEIGHT } from './constants';

// "HH:MM:SS" or "HH:MM" → total minutes
const toMins = (time) => {
  if (!time) return 0;
  const [h, m] = String(time).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

// Top offset in px from midnight
export const calculateTop = (startTime) => {
  return Math.round((toMins(startTime) / 30) * ROW_HEIGHT);
};

// Height in px for a given duration in minutes
export const calculateHeight = (durationMins) => {
  const d = parseInt(durationMins) || 60;
  return Math.max(Math.round((d / 30) * ROW_HEIGHT), ROW_HEIGHT);
};

// "HH:MM:SS" → "HH:MM"
export const formatTime = (t) => (t ? String(t).substring(0, 5) : '');

// "YYYY-MM-DD" → "DD-MM-YYYY"
export const formatDate = (d) => {
  if (!d) return '';
  return d.split('-').reverse().join('-');
};