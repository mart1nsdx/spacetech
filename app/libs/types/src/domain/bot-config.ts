export interface BotRuntimeConfig {
  id: string;
  organizationId: string;
  name: string;
  tone: string;
  language: string;
  systemPrompt: string;
  welcomeMessage: string | null;
  blockedTopics: string[];
  llmProvider: string;
  llmModel: string;
  temperature: number;
  maxTokens: number;
  contextWindowSize: number;
  ragTopK: number;
  ragMinSimilarity: number;
  usePublicKnowledgeBase: boolean;
}
