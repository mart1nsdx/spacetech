import * as winston from 'winston';

export const prettyFormatter = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, context, correlationId, ...meta }) => {
    const ctx = context ? `[${context}]` : '';
    const cid = correlationId ? ` (${String(correlationId).slice(0, 8)})` : '';
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level} ${ctx}${cid}: ${message}${extra}`;
  }),
);
