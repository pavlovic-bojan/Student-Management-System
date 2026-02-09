import dotenv from 'dotenv';

dotenv.config();

export interface EnvConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  sessionSecret: string;
  /** CORS allowed origin. If set, only this origin is allowed; otherwise allow all (*). */
  corsOrigin: string | undefined;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env: EnvConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
  sessionSecret: requireEnv('SESSION_SECRET'),
  corsOrigin: process.env.CORS_ORIGIN,
};

