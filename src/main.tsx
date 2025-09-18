import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

type DevtraceModule = {
  installStackLogger?: (options: {
    limit: number;
    skip: number;
    tail: boolean;
    ascending: boolean;
    mapSources: boolean;
    snippet: number;
    preferApp: boolean;
    onlyApp: boolean;
  }) => void;
  installDevInstrumentation?: () => void;
};

const isDevtraceModule = (value: unknown): value is DevtraceModule => {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const maybe = value as Record<string, unknown>;
  const stack = maybe.installStackLogger;
  const instrumentation = maybe.installDevInstrumentation;

  const stackValid = stack === undefined || typeof stack === 'function';
  const instrumentationValid =
    instrumentation === undefined || typeof instrumentation === 'function';

  return stackValid && instrumentationValid;
};

const bootstrap = async (): Promise<void> => {
  if (import.meta.hot) {
    await import('./devtools/registerCommandOverlay')
      .then(({ registerCommandOverlay }) => {
        registerCommandOverlay();
      })
      .catch(() => undefined);
  }

  if (import.meta.env.DEV) {
    const devtraceImport: unknown = await import('@ton-ai-core/devtrace').catch(
      () => null,
    );
    if (isDevtraceModule(devtraceImport)) {
      const devtrace = devtraceImport;
      try {
        devtrace.installStackLogger?.({
          limit: 5,
          skip: 0,
          tail: false,
          ascending: true,
          mapSources: true,
          snippet: 1,
          preferApp: true,
          onlyApp: false,
        });
      } catch {
        // ignore instrumentation failures during development bootstrap
      }
      try {
        devtrace.installDevInstrumentation?.();
      } catch {
        // ignore instrumentation failures during development bootstrap
      }
    }
  }

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  createRoot(rootElement).render(<App />);
};

void bootstrap();
