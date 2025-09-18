import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const bootstrap = async () => {
  if (import.meta.env.DEV) {
    const devtrace = await import('@ton-ai-core/devtrace').catch(() => null);
    if (devtrace) {
      try {
        devtrace.installStackLogger({
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
        devtrace.installDevInstrumentation();
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
