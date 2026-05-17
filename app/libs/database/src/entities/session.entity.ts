import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sessions')
@Index(['botId', 'createdAt'])
@Index(['botId', 'lastActivityAt'])
@Index(['botId', 'externalUserId'])
export class Session extends BaseEntity {
  @Column({ type: 'uuid' })
  botId!: string;

  @Column({ type: 'varchar', length: 255 })
  externalUserId!: string;

  @Column({ type: 'jsonb', nullable: true })
  externalUserMetadata: Record<string, unknown> | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastActivityAt: Date | null;

  @Column({ type: 'int', default: 0 })
  messageCount: number;

  @Column({ type: 'int', default: 0 })
  totalTokensUsed: number;

  @Column({ type: 'jsonb', nullable: true })
  context: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  channel: string | null;

  @ManyToOne('Bot', 'sessions', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'botId' })
  bot: any;

  @OneToMany('Message', 'session')
  messages: any[];
}
