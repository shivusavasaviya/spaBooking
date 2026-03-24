export const generateTherapists = (count) =>
  Array.from({ length: count }, (_, i) => ({
    id: `th-${i + 1}`,
    name: `Therapist ${i + 1}`,
    gender: Math.random() > 0.5 ? 'female' : 'male'
  }));

  