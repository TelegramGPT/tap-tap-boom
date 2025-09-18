const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

interface CommandOverlayPayload {
  readonly command: string[];
  readonly exitCode: number | null;
  readonly success: boolean;
  readonly output: string;
  readonly clean: string;
}

interface CommandOverlayLifecyclePayload {
  readonly command: string[];
  readonly timestamp: number;
}

interface CommandOverlayFailurePayload {
  readonly command: string[];
  readonly message: string;
  readonly timestamp: number;
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

const isLifecyclePayload = (
  value: unknown,
): value is CommandOverlayLifecyclePayload => {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const maybe = value as Record<string, unknown>;
  return isStringArray(maybe.command) && typeof maybe.timestamp === 'number';
};

const isFailurePayload = (
  value: unknown,
): value is CommandOverlayFailurePayload => {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const maybe = value as Record<string, unknown>;
  return (
    isStringArray(maybe.command) &&
    typeof maybe.timestamp === 'number' &&
    typeof maybe.message === 'string'
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
  console.info('[command-overlay] attempting to register listeners');

  if (!import.meta.hot) {
    console.warn('[command-overlay] HMR API unavailable');
    return;
  }

  console.info('[command-overlay] HMR API detected, attaching listeners');

  import.meta.hot.on('command-overlay:plugin-registered', (data) => {
    const stamp =
      data && typeof (data as { timestamp?: number }).timestamp === 'number'
        ? new Date((data as { timestamp: number }).timestamp).toLocaleTimeString()
        : 'unknown time';
    console.info(`[command-overlay] plugin registered (${stamp})`);
  });

  import.meta.hot.on('command-overlay:lint-started', (data) => {
    if (isLifecyclePayload(data)) {
      const when = new Date(data.timestamp).toLocaleTimeString();
      const label = formatLabel(data.command);
      console.info(`${label} ▶ lint started at ${when}`);
    }
  });

  import.meta.hot.on('command-overlay:lint-finished', (data) => {
    if (isCommandOverlayPayload(data)) {
      logPayload(data);
    }
  });

  import.meta.hot.on('command-overlay:lint-failed', (data) => {
    if (isFailurePayload(data)) {
      const when = new Date(data.timestamp).toLocaleTimeString();
      const label = formatLabel(data.command);
      console.group(`${label} ✖ spawn failure (${when})`);
      console.error(data.message);
      console.groupEnd();
    }
  });

  console.info('[command-overlay] listeners ready');
};

export default registerCommandOverlay;
