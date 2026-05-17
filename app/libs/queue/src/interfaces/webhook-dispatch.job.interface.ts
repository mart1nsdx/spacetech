export interface WebhookDispatchJob {
  webhookId: string;
  event: string;
  payload: Record<string, unknown>;
  attempt: number;
}
