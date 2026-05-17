import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { LogContext } from './interfaces/log-context.interface';
import { createConsoleTransport } from './transports/console.transport';
import { createFileTransport } from './transports/file.transport';

@Injectable()
export class AeroLogger implements LoggerService {
  private readonly winston: winston.Logger;

  constructor() {
    const transports: winston.transport[] = [createConsoleTransport()];
    if (process.env['NODE_ENV'] === 'production') {
      transports.push(createFileTransport());
    }
    this.winston = winston.createLogger({
      level: process.env['LOG_LEVEL'] ?? 'info',
      transports,
    });
  }

  log(message: string, context?: string | LogContext): void {
    this.winston.info(message, this.buildMeta(context));
  }

  error(message: string, trace?: string, context?: string | LogContext): void {
    this.winston.error(message, { ...this.buildMeta(context), trace });
  }

  warn(message: string, context?: string | LogContext): void {
    this.winston.warn(message, this.buildMeta(context));
  }

  debug(message: string, context?: string | LogContext): void {
    this.winston.debug(message, this.buildMeta(context));
  }

  verbose(message: string, context?: string | LogContext): void {
    this.winston.verbose(message, this.buildMeta(context));
  }

  private buildMeta(context?: string | LogContext): Record<string, unknown> {
    if (!context) return {};
    if (typeof context === 'string') return { context };
    return context;
  }
}
