import * as winston from 'winston';

export const jsonFormatter = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);
