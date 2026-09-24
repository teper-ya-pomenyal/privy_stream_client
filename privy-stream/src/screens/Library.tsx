import { useLibrary } from '../api/queries';
import { plural } from '../lib/format';
import { usePlayer } from '../store/player';
import { Screen, ScreenHeader, TrackTable, TrackTableSkeleton } from '../ui';
import s from './screens.module.css';

export function Library() {
  const library = useLibrary();
  const play = usePlayer((p) => p.play);
  const tracks = library.data ?? [];

  return (
    <Screen>
      <div className={s.libHeader}>
        <ScreenHeader
          eyebrow="ЛОКАЛЬНОЕ ХРАНИЛИЩЕ · НЕ ИНДЕКСИРУЕТСЯ"
          title="Библиотека"
          aside={
            <div className={s.libStats}>
              {tracks.length} {plural(tracks.length, ['трек', 'трека', 'треков'])} · 14.2 ГБ
              <br />
              синхронизация 3 устройства
            </div>
          }
        />
      </div>
      {library.data ? (
        <TrackTable variant="library" tracks={tracks} onPlay={(t) => play(t, tracks)} />
      ) : (
        <TrackTableSkeleton rows={9} />
      )}
    </Screen>
  );
}
