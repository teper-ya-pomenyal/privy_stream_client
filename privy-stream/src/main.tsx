import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { NodeError } from './api';
import { App } from './App';
import { IS_WEB } from './platform/mode';
import { loadWebConfig } from './platform/webConfig';
import { ConfigError } from './screens/ConfigError';
import { useServers, whenServersHydrated } from './store/servers';
import './styles/global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      // 4xx от узла повтором не исправить; сеть и 5xx — один повтор.
      retry: (count, err) => count < 1 && !(err instanceof NodeError && err.code >= 400 && err.code < 500),
      refetchOnWindowFocus: false,
    },
  },
});

const root = createRoot(document.getElementById('root')!);
const render = (node: ReactNode) => root.render(<StrictMode>{node}</StrictMode>);

async function boot() {
  // В приложении список узлов читается из файла асинхронно — ждём его до первого экрана.
  await whenServersHydrated();

  if (IS_WEB) {
    const cfg = await loadWebConfig();
    if (!cfg.ok) return render(<ConfigError reason={cfg.reason} />);
    useServers.getState().initWeb(cfg.config.node);
  }

  render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

void boot();
