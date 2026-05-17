import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { DocumentType } from '../enums/document-type.enum';
import { DocumentStatus } from '../enums/document-status.enum';

@Entity('knowledge_documents')
@Index(['botId', 'status'])
@Index(['organizationId', 'createdAt'])
@Index(['isPublicBase'])
export class KnowledgeDocument extends BaseEntity {
  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid', nullable: true })
  botId: string | null;

  @Column({ type: 'boolean', default: false })
  isPublicBase: boolean;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  originalName: string | null;

  @Column({ type: 'enum', enum: DocumentType })
  fileType: DocumentType;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  sourceUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  storageKey: string | null;

  @Column({ type: 'bigint', nullable: true })
  fileSizeBytes: number | null;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt: Date | null;

  @Column({ type: 'int', default: 0 })
  chunkCount: number;

  @Column({ type: 'int', nullable: true })
  pageCount: number | null;

  @Column({ type: 'int', nullable: true })
  wordCount: number | null;

  @Column({ type: 'jsonb', nullable: true })
  sourceMetadata: Record<string, unknown> | null;

  @Column({ type: 'int', default: 1 })
  version: number;

  @ManyToOne('Organization', 'knowledgeDocuments', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: any;

  @ManyToOne('Bot', 'knowledgeDocuments', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'botId' })
  bot: any | null;

  @OneToMany('DocumentChunk', 'document')
  chunks: any[];
}
