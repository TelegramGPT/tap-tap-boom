import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { componentTagger } from 'lovable-tagger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const plugins = [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'development' && ((): PluginOption => ({
      name: 'command-overlay',
      configureServer(server) {
        const pattern = 'src/**/*';
        const stripAnsi = (text: string): string =>
          text.replace(/[\u001B\u009B][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
        const runAndOverlay = () => {
          const cmd = ['npm', 'run', 'lint'];
          const child = spawn(cmd[0], cmd.slice(1), { stdio: ['ignore', 'pipe', 'pipe'] });
          let output = '';
          child.stdout.on('data', (d) => {
            output += d.toString();
            process.stdout.write(d);
          });
          child.stderr.on('data', (d) => {
            output += d.toString();
            process.stderr.write(d);
          });
          child.on('close', (code) => {
            if (code && code !== 0) {
              const clean = stripAnsi(output);
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
    }))(),
  ].filter(Boolean) as PluginOption[];

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
