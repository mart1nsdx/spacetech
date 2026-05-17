import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { AnalyticsEventType } from '../enums/analytics-event-type.enum';

@Entity('analytics_events')
@Index(['organizationId', 'createdAt'])
@Index(['botId', 'createdAt'])
@Index(['botId', 'eventType'])
@Index(['createdAt'])
export class AnalyticsEvent extends BaseEntity {
  @Column({ type: 'uuid' })
  organizationId!: string;

  @Column({ type: 'uuid' })
  botId!: string;

  @Column({ type: 'uuid', nullable: true })
  sessionId: string | null;

  @Column({ type: 'uuid', nullable: true })
  messageId: string | null;

  @Column({ type: 'enum', enum: AnalyticsEventType })
  eventType!: AnalyticsEventType;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown> | null;

  @Column({ type: 'int', nullable: true })
  tokensInput: number | null;

  @Column({ type: 'int', nullable: true })
  tokensOutput: number | null;

  @Column({ type: 'int', nullable: true })
  latencyMs: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  channel: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @ManyToOne('Organization', 'analyticsEvents', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: any;

  @ManyToOne('Bot', 'analyticsEvents', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'botId' })
  bot: any;
}
