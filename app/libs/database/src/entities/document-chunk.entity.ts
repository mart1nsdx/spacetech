import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { VectorTransformer } from '../types/pgvector.type';

@Entity('document_chunks')
@Index(['botId', 'isPublic'])
export class DocumentChunk extends BaseEntity {
  @Column({ type: 'uuid' })
  documentId: string;

  @Column({ type: 'uuid', nullable: true })
  botId: string | null;

  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'varchar',
    nullable: true,
    select: false,
    transformer: VectorTransformer,
  })
  embedding: number[] | null;

  @Column({ type: 'int' })
  chunkIndex: number;

  @Column({ type: 'int', nullable: true })
  pageNumber: number | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @Column({ type: 'int', nullable: true })
  tokenCount: number | null;

  @Column({ type: 'varchar', length: 100, default: 'text-embedding-3-small' })
  embeddingModel: string;

  @ManyToOne('KnowledgeDocument', 'chunks', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'documentId' })
  document: any;
}
