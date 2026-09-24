import type { ButtonHTMLAttributes, CSSProperties, InputHTMLAttributes, ReactNode } from 'react';
import type { NodeInfo, Track } from '../api';
import { fmtTime, trackNum } from '../lib/format';
import { useCurrentTrack } from '../store/player';
import s from './ui.module.css';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/** Адрес узла для показа: без схемы (https://node.example → node.example). */
export const hostLabel = (host: string) => host.replace(/^https?:\/\//, '');

export function Logo({ small }: { small?: boolean }) {
  return (
    <div className={cx(s.logo, small && s.logoSm)}>
      <div className={s.logoMark} />
      <div className={s.logoText}>
        PRIVY<span className={s.logoSlash}>/</span>STREAM
      </div>
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'accent' | 'outline' | 'quiet';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  selected?: boolean;
};

export function Button({ variant = 'outline', size = 'md', selected, className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cx(s.btn, s[variant], s[size], selected && s.selected, className)} {...rest} />;
}

export function TextLink({ className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={cx(s.link, className)} {...rest} />;
}

export function Field({ label, ...input }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={s.field}>
      <span className="t-label">{label}</span>
      <input className={s.input} spellCheck={false} autoComplete="off" {...input} />
    </label>
  );
}

export function PrefixedInput({
  prefix,
  suffix,
  className,
  style,
  ...input
}: InputHTMLAttributes<HTMLInputElement> & { prefix: string; suffix?: ReactNode }) {
  return (
    <div className={cx(s.prefixed, className)} style={style}>
      <span className={s.prefix}>{prefix}</span>
      <input className={s.bareInput} spellCheck={false} autoComplete="off" {...input} />
      {suffix != null && <span className={s.suffix}>{suffix}</span>}
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <div className={s.error} role="alert">
      {children}
    </div>
  );
}

export type NodeVisualState = 'active' | 'connecting' | 'online' | 'offline';

export function nodeState(node: NodeInfo, activeId: string, connectingId: string | null): NodeVisualState {
  if (connectingId === node.id) return 'connecting';
  if (node.status !== 'online') return 'offline';
  return node.id === activeId ? 'active' : 'online';
}

export const NODE_STATUS: Record<NodeVisualState, { label: string; color: string; dot: string }> = {
  active: { label: 'ПОДКЛЮЧЁН', color: 'var(--accent)', dot: 'var(--accent)' },
  connecting: { label: 'ПОДКЛЮЧЕНИЕ…', color: 'var(--warn)', dot: 'var(--ok)' },
  online: { label: 'ДОСТУПЕН', color: 'var(--ok)', dot: 'var(--ok)' },
  offline: { label: 'НЕ ОТВЕЧАЕТ', color: 'var(--text-5)', dot: 'var(--dot-off)' },
};

export function StatusDot({ color, blink, size = 7, style }: { color: string; blink?: string; size?: number; style?: CSSProperties }) {
  return (
    <div
      className={s.dot}
      style={{ width: size, height: size, background: color, animation: blink ? `pv-blink ${blink} infinite` : undefined, ...style }}
    />
  );
}

export function Cover({
  caption,
  code,
  flagged,
  src,
  className,
  style,
}: {
  caption?: ReactNode;
  code?: string;
  flagged?: boolean;
  /** Реальная обложка с узла; без неё остаётся плейсхолдер. */
  src?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={cx(s.cover, className)} style={style}>
      {src ? <img className={s.coverImg} src={src} alt="" /> : caption && <span className={s.coverCaption}>{caption}</span>}
      {code && <span className={s.coverCode}>{code}</span>}
      {flagged && <span className={s.coverFlag}>18+</span>}
    </div>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  return <div className={s.screen}>{children}</div>;
}

export function ScreenHeader({ eyebrow, title, aside }: { eyebrow: ReactNode; title: ReactNode; aside?: ReactNode }) {
  return (
    <div className={s.screenHeader}>
      <div className={s.screenTitle}>
        <div className="t-eyebrow">{eyebrow}</div>
        <h2 className="t-h2">{title}</h2>
      </div>
      {aside}
    </div>
  );
}

export function EmptyState({ label, text, action }: { label: string; text: ReactNode; action?: ReactNode }) {
  return (
    <div className={s.empty}>
      <div className="t-label" style={{ letterSpacing: '.18em' }}>
        {label}
      </div>
      <div className={s.emptyText}>{text}</div>
      {action}
    </div>
  );
}

export function Skeleton({ style }: { style?: CSSProperties }) {
  return <div className={s.skel} style={style} />;
}

/**
 * Таблица треков.
 * release — треклист релиза (с подписью «артист · формат»), popular — без подписи,
 * library — шесть колонок фонотеки.
 */
export function TrackTable({
  tracks,
  variant,
  onPlay,
  header = true,
}: {
  tracks: Track[];
  variant: 'release' | 'popular' | 'library';
  onPlay: (t: Track) => void;
  header?: boolean;
}) {
  const current = useCurrentTrack();
  const cols = variant === 'library' ? s.colsLibrary : s.colsRelease;
  return (
    <div>
      {header && (
        <div className={cx(s.trackHead, cols)}>
          <span>#</span>
          <span>НАЗВАНИЕ</span>
          {variant === 'library' && (
            <>
              <span>АРТИСТ</span>
              <span>РЕЛИЗ</span>
            </>
          )}
          <span>ФОРМАТ</span>
          <span className={s.right}>ВРЕМЯ</span>
        </div>
      )}
      {tracks.map((t, i) => {
        const playing = current?.id === t.id;
        return (
          <button key={t.id} type="button" className={cx(s.trackRow, cols, playing && s.playing)} onClick={() => onPlay(t)}>
            <span className={s.tNum}>{trackNum(i)}</span>
            {variant === 'release' ? (
              <span className={s.tTitleCell}>
                <span className={cx(s.tTitle, 'ellipsis')}>{t.title}</span>
                <span className={s.tSub}>{[t.artist, t.format].filter(Boolean).join(' · ')}</span>
              </span>
            ) : (
              <span className={cx(s.tTitle, 'ellipsis')}>{t.title}</span>
            )}
            {variant === 'library' && (
              <>
                <span className={cx(s.tArtist, 'ellipsis')}>{t.artist}</span>
                <span className={cx(s.tRelease, 'ellipsis')}>{t.release}</span>
              </>
            )}
            <span className={s.tFmt}>{t.format ?? (t.explicit ? '18+' : '—')}</span>
            <span className={s.tDur}>{fmtTime(t.durationSec)}</span>
          </button>
        );
      })}
    </div>
  );
}

export function TrackTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={cx(s.trackRow, s.colsRelease)} style={{ cursor: 'default' }}>
          <Skeleton style={{ height: 10, width: 16 }} />
          <Skeleton style={{ height: 12, width: `${60 - i * 6}%` }} />
          <Skeleton style={{ height: 10, width: 32 }} />
          <Skeleton style={{ height: 10, width: 30, justifySelf: 'end' }} />
        </div>
      ))}
    </div>
  );
}
