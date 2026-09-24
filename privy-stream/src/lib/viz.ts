// Детерминированные высоты для индикатора уровня и волны — как в макете.
// Заменить на реальные пики (от узла или через Web Audio) и анализ уровня.

export function meterHeights(tick: number, playing: boolean, count = 14): number[] {
  return Array.from({ length: count }, (_, i) => (playing ? 18 + Math.abs(Math.sin((tick + i) * 0.9)) * 82 : 8));
}

export function wavePeaks(count = 72): number[] {
  return Array.from({ length: count }, (_, i) => 22 + Math.abs(Math.sin(i * 0.42) * Math.cos(i * 0.17)) * 74);
}
