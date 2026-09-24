import { useSyncExternalStore } from 'react';

/** Граница мобильного вида. Та же ширина зашита в @media (max-width: 720px) в CSS-модулях. */
export const MOBILE_QUERY = '(max-width: 720px)';

const mql = window.matchMedia(MOBILE_QUERY);
const subscribe = (cb: () => void) => {
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
};

/** Узкий экран: таб-бар и мини-плеер вместо сайдбара и нижней панели. */
export const useMobile = () => useSyncExternalStore(subscribe, () => mql.matches);
