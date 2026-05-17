import * as winston from 'winston';
import { jsonFormatter } from '../formatters/json.formatter';
import { prettyFormatter } from '../formatters/pretty.formatter';

export function createConsoleTransport(): winston.transports.ConsoleTransportInstance {
  const isProd = process.env['NODE_ENV'] === 'production';
  return new winston.transports.Console({
    format: isProd ? jsonFormatter : prettyFormatter,
  });
}
