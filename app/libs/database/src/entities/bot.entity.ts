import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { BotTone } from '../enums/bot-tone.enum';
import { LlmProvider } from '../enums/llm-provider.enum';

@Entity('bots')
@Index(['organizationId'])
@Index(['organizationId', 'createdAt'])
@Index(['organizationId', 'isActive'])
export class Bot extends BaseEntity {
  @Column({ type: 'uuid' })
  organizationId!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'enum', enum: BotTone, default: BotTone.FRIENDLY })
  tone!: BotTone;

  @Column({ type: 'varchar', length: 10, default: 'es-CO' })
  language!: string;

  @Column({ type: 'text' })
  systemPrompt!: string;

  @Column({ type: 'text', nullable: true })
  welcomeMessage: string | null;

  @Column({ type: 'text', array: true, default: [] })
  blockedTopics!: string[];

  @Column({ type: 'enum', enum: LlmProvider, default: LlmProvider.OPENAI })
  llmProvider!: LlmProvider;

  @Column({ type: 'varchar', length: 100, default: 'gpt-4o-mini' })
  llmModel!: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.7 })
  temperature!: number;

  @Column({ type: 'int', default: 1000 })
  maxTokens!: number;

  @Column({ type: 'int', default: 10 })
  contextWindowSize!: number;

  @Column({ type: 'int', default: 5 })
  ragTopK!: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.7 })
  ragMinSimilarity!: number;

  @Column({ type: 'boolean', default: true })
  usePublicKnowledgeBase!: boolean;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false })
  isPublic!: boolean;

  @Column({ type: 'boolean', default: false })
  useTools!: boolean;

  @Column({ type: 'int', default: 0 })
  totalSessions!: number;

  @Column({ type: 'int', default: 0 })
  totalMessages!: number;

  @Column({ type: 'bigint', default: 0 })
  totalTokensUsed!: number;

  @ManyToOne('Organization', 'bots', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: any;

  @OneToMany('Session', 'bot')
  sessions: any[];

  @OneToMany('KnowledgeDocument', 'bot')
  knowledgeDocuments: any[];

  @OneToMany('Webhook', 'bot')
  webhooks: any[];

  @OneToMany('AnalyticsEvent', 'bot')
  analyticsEvents: any[];
}
