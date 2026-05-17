import 'winston-daily-rotate-file';
import * as winston from 'winston';
import { jsonFormatter } from '../formatters/json.formatter';

export function createFileTransport(): winston.transport {
  return new (winston.transports as any).DailyRotateFile({
    filename: 'logs/app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
    maxSize: '20m',
    format: jsonFormatter,
    zippedArchive: true,
  });
}
