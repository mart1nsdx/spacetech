export interface LogContext {
  correlationId?: string;
  organizationId?: string;
  botId?: string;
  userId?: string;
  method?: string;
  path?: string;
  [key: string]: unknown;
}
