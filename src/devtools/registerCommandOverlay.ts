const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

interface CommandOverlayPayload {
  readonly command: string[];
  readonly exitCode: number | null;
  readonly success: boolean;
  readonly output: string;
  readonly clean: string;
}

const isCommandOverlayPayload = (
  value: unknown,
): value is CommandOverlayPayload => {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const maybe = value as Record<string, unknown>;
  return (
    typeof maybe.success === 'boolean' &&
    typeof maybe.output === 'string' &&
    typeof maybe.clean === 'string' &&
    (maybe.exitCode === null || typeof maybe.exitCode === 'number') &&
    isStringArray(maybe.command)
  );
};

const formatLabel = (command: string[]): string => {
  const rendered = command.join(' ');
  return `[command-overlay] ${rendered}`;
};

const logPayload = (payload: CommandOverlayPayload): void => {
  const label = formatLabel(payload.command);
  const message = payload.clean.trim().length > 0
    ? payload.clean
    : 'Command completed with no output.';

  if (payload.success) {
    console.groupCollapsed(`${label} ✓`);
    console.info(message);
    console.groupEnd();
    return;
  }

  const codeLabel = payload.exitCode ?? 'unknown';
  console.group(`${label} ✗ (exit code ${codeLabel})`);
  console.error(message);
  console.groupEnd();
};

export const registerCommandOverlay = (): void => {
  if (!import.meta.hot) {
    return;
  }

  import.meta.hot.on('command-overlay:lint-finished', (data) => {
    if (isCommandOverlayPayload(data)) {
      logPayload(data);
    }
  });
};

export default registerCommandOverlay;
