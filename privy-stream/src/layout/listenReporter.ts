import { nodeApi } from '../api';
import { usePlayer } from '../store/player';

/** Шаг между соседними обновлениями позиции больше этого — перемотка, а не воспроизведение. */
const MAX_PLAY_STEP_SEC = 1.5;

/** Порог прослушивания: 30 с, для треков короче минуты — половина длительности. */
export function listenThreshold(durationSec: number): number {
  return durationSec > 0 && durationSec < 60 ? durationSec / 2 : 30;
}

/**
 * Засчитывает прослушивание на узле, когда трек реально проиграл порог.
 * Считается только время воспроизведения: перемотка и пауза не накапливаются.
 * Один раз за проигрывание (play/next/prev, в том числе повтор того же трека).
 * Отправил и забыл: без повторов и без очереди, чтобы не хранить историю.
 * Возвращает функцию отписки.
 */
export function startListenReporter(): () => void {
  let playId = -1;
  let trackId: string | undefined;
  let played = 0;
  let reported = false;

  return usePlayer.subscribe((s, prev) => {
    const track = s.queue[s.index];
    if (s.playId !== playId || track?.id !== trackId) {
      playId = s.playId;
      trackId = track?.id;
      played = 0;
      reported = false;
      return;
    }
    if (!track?.host || reported || !s.playing || s.position === prev.position) return;

    const step = s.position - prev.position;
    if (step > 0 && step < MAX_PLAY_STEP_SEC) played += step;

    if (played >= listenThreshold(s.mediaDuration || track.durationSec)) {
      reported = true;
      nodeApi.markListened(track.host, track.id).catch(() => {});
    }
  });
}
