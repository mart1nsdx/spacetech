export interface LlmRuntimeConfig {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey?: string;
}
