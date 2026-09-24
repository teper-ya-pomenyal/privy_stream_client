import { useNavigate, useParams } from 'react-router';
import { errorText } from '../api';
import { useArtist } from '../api/queries';
import { fmtNumber, plural } from '../lib/format';
import { usePlayer } from '../store/player';
import { releaseMeta } from './Catalog';
import { useActiveNode } from '../store/servers';
import { Button, Cover, EmptyState, ErrorNote, Screen, Skeleton, StatusDot, TextLink, TrackTable, TrackTableSkeleton } from '../ui';
import s from './screens.module.css';

export function Artist() {
  const { id = '' } = useParams();
  const node = useActiveNode();
  const navigate = useNavigate();
  const artist = useArtist(node.host, id);
  const play = usePlayer((p) => p.play);
  const a = artist.data;

  if (artist.isError) {
    return (
      <Screen>
        <TextLink className={s.back} onClick={() => navigate('/catalog')}>
          ← КАТАЛОГ
        </TextLink>
        <EmptyState
          label="АРТИСТ НЕДОСТУПЕН"
          text={<ErrorNote>{errorText(artist.error)}</ErrorNote>}
          action={
            <Button size="sm" onClick={() => navigate('/catalog')}>
              К ПОЛКЕ УЗЛА
            </Button>
          }
        />
      </Screen>
    );
  }

  const n = a?.releases.length ?? 0;

  return (
    <div>
      <div className={s.artistHero}>
        <div className={s.heroCaption}>фото артиста · 2400×720</div>
        <TextLink className={s.heroBack} onClick={() => navigate(-1)}>
          ← НАЗАД
        </TextLink>
        <div className={s.heroContent}>
          <div className={s.badge}>
            <StatusDot size={6} color="var(--accent)" />
            <span className="t-eyebrow">АРТИСТ · БЕЗ ГЕОБЛОКА</span>
          </div>
          {a ? <h2 className={s.artistName}>{a.name}</h2> : <Skeleton style={{ height: 62, width: 420, maxWidth: '100%' }} />}
          <div className={s.albumMeta}>
            {a ? [`${n} ${plural(n, ['РЕЛИЗ', 'РЕЛИЗА', 'РЕЛИЗОВ'])}`, a.activeYears].filter(Boolean).join(' · ') : '—'}
          </div>
        </div>
      </div>

      <Screen>
        {/* Статистика — только если узел её отдаёт (в API v1 её нет). */}
        {a?.stats && (
          <div className={s.stats}>
            {[
              ['СЛУШАТЕЛЕЙ', fmtNumber(a.stats.listeners)],
              ['РЕЛИЗОВ', String(n)],
              ['СТРАН БЕЗ БЛОКА', String(a.stats.countriesUnblocked)],
              ['В БИБЛИОТЕКАХ', fmtNumber(a.stats.inLibraries)],
            ].map(([k, v]) => (
              <div key={k} className={s.stat}>
                <div className={s.statKey}>{k}</div>
                <div className={s.statVal}>{v}</div>
              </div>
            ))}
          </div>
        )}

        <div className={s.twoCols}>
          <div className={s.col}>
            <div className="t-section">ПОПУЛЯРНОЕ</div>
            {a ? (
              a.popular.length ? (
                <TrackTable variant="popular" header={false} tracks={a.popular} onPlay={(t) => play(t, a.popular)} />
              ) : (
                <div className={s.discoMeta}>треков на узле нет</div>
              )
            ) : (
              <TrackTableSkeleton />
            )}
          </div>
          <div className={s.col}>
            <div className="t-section">ДИСКОГРАФИЯ</div>
            <div className={s.disco}>
              {a && a.releases.length === 0 && <div className={s.discoMeta}>релизов на узле нет</div>}
              {a?.releases.map((r) => (
                <div key={r.id} className={s.discoItem} onClick={() => navigate(`/album/${encodeURIComponent(r.id)}`)}>
                  <Cover caption="обложка" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span className={s.discoTitle}>{r.title}</span>
                    {releaseMeta(r) && <span className={s.discoMeta}>{releaseMeta(r)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Screen>
    </div>
  );
}
