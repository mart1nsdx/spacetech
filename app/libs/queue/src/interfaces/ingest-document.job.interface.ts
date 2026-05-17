export interface IngestDocumentJob {
  documentId: string;
  botId: string;
  organizationId: string;
  storageKey: string;
  fileType: string;
}
