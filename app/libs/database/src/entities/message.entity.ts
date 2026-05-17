import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { MessageRole } from '../enums/message-role.enum';

@Entity('messages')
@Index(['sessionId', 'createdAt'])
@Index(['sessionId', 'role'])
export class Message extends BaseEntity {
  @Column({ type: 'uuid' })
  sessionId!: string;

  @Column({ type: 'enum', enum: MessageRole })
  role!: MessageRole;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'int', nullable: true })
  tokensInput: number | null;

  @Column({ type: 'int', nullable: true })
  tokensOutput: number | null;

  @Column({ type: 'int', nullable: true })
  latencyMs: number | null;

  @Column({ type: 'jsonb', nullable: true })
  retrievedChunkIds: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  retrievalScores: number[] | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  llmModel: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  finishReason: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  feedback: string | null;

  @Column({ type: 'text', nullable: true })
  feedbackComment: string | null;

  @ManyToOne('Session', 'messages', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: any;
}
