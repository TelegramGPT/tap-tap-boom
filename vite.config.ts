import { defineConfig, type PluginOption, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { componentTagger } from 'lovable-tagger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ansiPattern = new RegExp(
  String.raw`[\u001B\u009B][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]`,
  'g',
);

const createCommandOverlayPlugin = (): PluginOption => ({
  name: 'command-overlay',
  configureServer(server: ViteDevServer): void {
    const pattern = 'src/**/*';
    const stripAnsi = (text: string): string => text.replace(ansiPattern, '');
    const runAndOverlay = (): void => {
      const cmd = ['npm', 'run', 'lint'];
      const child = spawn(cmd[0], cmd.slice(1), { stdio: ['ignore', 'pipe', 'pipe'] });
      const { stdout, stderr } = child;
      let output = '';

      const appendAndForward = (chunk: Buffer): void => {
        output += chunk.toString();
      };

      stdout?.on('data', (chunk: Buffer) => {
        appendAndForward(chunk);
        process.stdout.write(chunk);
      });

      stderr?.on('data', (chunk: Buffer) => {
        appendAndForward(chunk);
        process.stderr.write(chunk);
      });

      child.on('close', (code: number | null) => {
        const clean = stripAnsi(output);
        const success = !code;

        server.ws.send({
          type: 'custom',
          event: 'command-overlay:lint-finished',
          data: {
            command: cmd,
            exitCode: code,
            success,
            output,
            clean,
          },
        });

        if (!success) {
          server.config.logger.error(clean);
          server.ws.send({
            type: 'error',
            err: {
              plugin: 'command-overlay',
              message: `Command failed: ${cmd.join(' ')} \nlog: ${clean}`,
              id: 'command-overlay',
              stack: '',
            },
          });
        } else {
          server.ws.send({ type: 'full-reload' });
        }
      });
    };

    runAndOverlay();
    server.watcher.add(pattern);
    server.watcher.on('change', runAndOverlay);
    server.watcher.on('unlink', runAndOverlay);
  },
});

export default defineConfig(({ mode }) => {
  const isDevLikeMode = mode === 'development' || mode === 'lovable';

  const pluginEntries: Array<PluginOption | false> = [
    react(),
    isDevLikeMode && createCommandOverlayPlugin(),
    isDevLikeMode && componentTagger(),
  ];

  const plugins = pluginEntries.filter(
    (plugin): plugin is PluginOption => Boolean(plugin),
  );

  return {
    server: {
      host: '::',
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
