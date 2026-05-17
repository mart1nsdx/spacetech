export interface GenerateEmbeddingsJob {
  documentId: string;
  chunks: Array<{
    index: number;
    content: string;
    metadata: Record<string, unknown>;
  }>;
  botId: string | null;
  isPublic: boolean;
}
