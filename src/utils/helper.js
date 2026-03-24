export const generateTherapists = (count) =>
  Array.from({ length: count }, (_, i) => ({
    id: `th-${i + 1}`,
    name: `Therapist ${i + 1}`,
    gender: Math.random() > 0.5 ? 'female' : 'male'
  }));

 export const avatarColor = (th) => {
  const g = (th.gender || '').toLowerCase();
  if (g === 'female' || g === 'f') return '#EC4899';
  if (g === 'male'   || g === 'm') return '#3B82F6';
  const POOL = ['#EC4899','#3B82F6','#8B5CF6','#F97316','#14B8A6'];
  return POOL[parseInt(th.therapist_id || th.id || 0) % POOL.length];
};

export const toMins = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours * 60) + minutes;
};