import { Request } from 'express';

const REDACTED_KEYS = [
  'password',
  'passwordHash',
  'refreshToken',
  'refreshTokenHash',
  'accessToken',
  'token',
  'secret',
  'authorization',
  'cookie',
];

const MAX_DEPTH = 3;
const MAX_ARRAY_ITEMS = 10;
const MAX_OBJECT_KEYS = 20;
const MAX_STRING_LENGTH = 240;
const MAX_STACK_LINES = 8;

export interface AuthenticatedRequest extends Request {
  requestId?: string;
  user?: {
    userId?: string;
    email?: string;
  };
}

export function toLogMessage(
  event: string,
  payload: Record<string, unknown>,
): string {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    ...payload,
  });
}

export function sanitizeForLog(
  value: unknown,
  depth = 0,
  seen = new WeakSet<object>(),
): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return value.length > MAX_STRING_LENGTH
      ? `${value.slice(0, MAX_STRING_LENGTH)}...<truncated>`
      : value;
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return value;
  }

  if (typeof value === 'function') {
    return `[Function ${(value as Function).name || 'anonymous'}]`;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Buffer.isBuffer(value)) {
    return {
      type: 'Buffer',
      length: value.length,
    };
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: sanitizeStack(value.stack),
    };
  }

  if (Array.isArray(value)) {
    if (depth >= MAX_DEPTH) {
      return {
        type: 'Array',
        length: value.length,
      };
    }

    return {
      type: 'Array',
      length: value.length,
      items: value
        .slice(0, MAX_ARRAY_ITEMS)
        .map((item) => sanitizeForLog(item, depth + 1, seen)),
      truncated: value.length > MAX_ARRAY_ITEMS || undefined,
    };
  }

  if (typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;

    if (seen.has(objectValue)) {
      return '[Circular]';
    }

    seen.add(objectValue);

    const constructorName = value.constructor?.name;
    if (
      constructorName &&
      !['Object', 'Date'].includes(constructorName) &&
      depth >= MAX_DEPTH
    ) {
      return { type: constructorName };
    }

    if (depth >= MAX_DEPTH) {
      return {
        type: constructorName || 'Object',
        keys: Object.keys(objectValue).slice(0, MAX_OBJECT_KEYS),
      };
    }

    const entries = Object.entries(objectValue).slice(0, MAX_OBJECT_KEYS);
    const sanitizedObject = entries.reduce<Record<string, unknown>>(
      (acc, [key, nestedValue]) => {
        acc[key] = shouldRedactKey(key)
          ? '[REDACTED]'
          : sanitizeForLog(nestedValue, depth + 1, seen);
        return acc;
      },
      constructorName && constructorName !== 'Object'
        ? { type: constructorName }
        : {},
    );

    if (Object.keys(objectValue).length > MAX_OBJECT_KEYS) {
      sanitizedObject.__truncatedKeys = true;
    }

    return sanitizedObject;
  }

  return String(value);
}

function shouldRedactKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return REDACTED_KEYS.some((sensitiveKey) =>
    lowerKey.includes(sensitiveKey.toLowerCase()),
  );
}

function sanitizeStack(stack?: string): string[] | undefined {
  if (!stack) {
    return undefined;
  }

  return stack
    .split('\n')
    .map((line) => line.trim())
    .slice(0, MAX_STACK_LINES);
}
