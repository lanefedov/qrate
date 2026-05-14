function getJwtSecret(): string {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }

  return 'dev-secret-change-me';
}

function parseOrigins(value: string | undefined): string[] {
  return (value || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }
  return value === 'true';
}

function parseDurationMs(value: string | undefined, fallbackMs: number): number {
  if (!value) {
    return fallbackMs;
  }

  const match = value.match(/^(\d+)(ms|s|m|h|d)?$/);
  if (!match) {
    return fallbackMs;
  }

  const amount = Number(match[1]);
  const unit = match[2] ?? 'ms';
  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
}

export default () => {
  const jwtRefreshExpiration = process.env.JWT_REFRESH_EXPIRATION || '7d';

  return {
    port: parseInt(process.env.PORT || '3001', 10),
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/qrate',
    jwtSecret: getJwtSecret(),
    jwtExpiration: process.env.JWT_EXPIRATION || '15m',
    jwtRefreshExpiration,
    refreshCookieMaxAgeMs: parseDurationMs(jwtRefreshExpiration, 7 * 24 * 60 * 60 * 1000),
    frontendOrigins: parseOrigins(process.env.FRONTEND_ORIGIN),
    cookieDomain: process.env.COOKIE_DOMAIN || undefined,
    cookieSameSite: process.env.COOKIE_SAME_SITE || 'lax',
    cookieSecure: parseBoolean(
      process.env.COOKIE_SECURE,
      process.env.NODE_ENV === 'production',
    ),
    calcGrpcUrl: process.env.CALC_GRPC_URL || 'localhost:50051',
  };
};
