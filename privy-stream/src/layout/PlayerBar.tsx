import { useEffect, useState, type MouseEvent } from 'react';
import type { Track } from '../api';
import { fmtTime } from '../lib/format';
import { meterHeights } from '../lib/viz';
import { useCurrentTrack, useDuration, usePlayer } from '../store/player';
import { cx } from '../ui';
import s from './layout.module.css';

/** Доля ширины элемента под курсором — для seek по полосе/волне. */
export const pointerFraction = (e: MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  return (e.clientX - r.left) / r.width;
};

export const playGlyph = (playing: boolean) => (playing ? '❙❙' : '▶');

export const trackSubline = (t: Track) => (t.release ? `${t.artist} · ${t.release}` : t.artist);

export function PlayerBar() {
  const track = useCurrentTrack();
  const { playing, position, loading, error, toggle, next, prev, seek, setFullscreen } = usePlayer();
  const duration = useDuration();
  const tick = useMeterTick(playing && !loading);
  const pct = duration ? Math.min(100, (position / duration) * 100) : 0;

  return (
    <div className={s.player}>
      <button type="button" className={s.nowPlaying} onClick={() => track && setFullscreen(true)}>
        <div className={s.thumb} />
        <div className={s.nowText}>
          <span className={cx(s.nowTitle, 'ellipsis')}>{track?.title ?? '—'}</span>
          <span className={cx(s.nowSub, 'ellipsis')} style={error ? { color: 'var(--accent-text)' } : undefined} title={error || undefined}>
            {error || (loading ? 'загрузка с узла…' : track ? trackSubline(track) : 'очередь пуста')}
          </span>
        </div>
      </button>

      <div className={s.center}>
        <div className={s.transport}>
          <button type="button" className={s.skip} onClick={prev} aria-label="Предыдущий">
            ◀◀
          </button>
          <button type="button" className={s.playBtn} onClick={toggle} aria-label={playing ? 'Пауза' : 'Играть'}>
            {playGlyph(playing)}
          </button>
          <button type="button" className={s.skip} onClick={next} aria-label="Следующий">
            ▶▶
          </button>
        </div>
        <div className={s.progressRow}>
          <span className={s.time}>{fmtTime(position)}</span>
          <div className={s.progress} onClick={(e) => seek(pointerFraction(e))}>
            <div className={s.progressFill} style={{ width: `${pct}%` }} />
          </div>
          <span className={s.time}>{fmtTime(duration)}</span>
        </div>
      </div>

      <div className={s.right}>
        <div className={s.meter}>
          {meterHeights(tick, playing && !loading).map((h, i) => (
            <div key={i} className={s.meterBar} style={{ height: `${h}%`, background: i > 10 ? 'var(--accent)' : 'var(--line-hover)' }} />
          ))}
        </div>
        <div className={s.spec}>
          24 BIT / 96 kHz
          <br />
          NO LOG
        </div>
      </div>
    </div>
  );
}

/** Такт анимации индикатора уровня (декоративный, как в макете). */
function useMeterTick(playing: boolean) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setTick((t) => t + 1), 900);
    return () => clearInterval(id);
  }, [playing]);
  return tick;
}
