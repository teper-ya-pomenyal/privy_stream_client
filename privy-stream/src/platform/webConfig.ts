/**
 * config.json веб-версии. Его пишет контейнер при старте из переменных окружения
 * (docker/40-privy-config.sh). Пример:
 *   { "node": { "url": "https://node.example", "name": "open.eu3" } }
 */
export interface WebConfig {
  node: { url: string; name: string };
}

export type WebConfigResult = { ok: true; config: WebConfig } | { ok: false; reason: string };

function parseNode(raw: unknown): WebConfig['node'] | string {
  const node = raw as { url?: unknown; name?: unknown } | null;
  if (!node || typeof node.url !== 'string' || !node.url) return 'не указан адрес узла (PRIVY_NODE_URL)';
  let url: URL;
  try {
    url = new URL(node.url);
  } catch {
    return `адрес узла «${node.url}» — не URL`;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return 'адрес узла должен начинаться с https://';
  const base = (url.origin + url.pathname).replace(/\/+$/, '');
  const name = typeof node.name === 'string' && node.name.trim() ? node.name.trim() : url.hostname;
  return { url: base, name };
}

export async function loadWebConfig(): Promise<WebConfigResult> {
  let raw: unknown;
  try {
    const res = await fetch('./config.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    raw = await res.json();
  } catch {
    // В разработке без контейнера узел можно задать через VITE_WEB_NODE_URL.
    const devUrl = import.meta.env.VITE_WEB_NODE_URL;
    if (!devUrl) return { ok: false, reason: 'файл не найден' };
    raw = { node: { url: devUrl, name: import.meta.env.VITE_WEB_NODE_NAME } };
  }
  const node = parseNode((raw as { node?: unknown })?.node);
  return typeof node === 'string' ? { ok: false, reason: node } : { ok: true, config: { node } };
}
