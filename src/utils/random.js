export function createSeededRandom(seed = Date.now()) {
  let value = seed + 0x6d2b79f5;
  return () => {
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickInRange(rand, min, max) {
  const v = rand();
  return min + v * (max - min);
}

export function jitterAround(rand, value, amplitude) {
  return value + (rand() - 0.5) * amplitude * 2;
}

export function cloneSeeded(rand) {
  return createSeededRandom(Math.floor(rand() * 1_000_000_007));
}
