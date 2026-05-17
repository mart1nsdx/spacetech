export interface RetrievedChunk {
  id: string;
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
  isPublic: boolean;
  source: string;
}
