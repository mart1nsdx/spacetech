import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { WebhookEvent } from '../enums/webhook-event.enum';

@Entity('webhooks')
@Index(['organizationId'])
@Index(['botId'])
export class Webhook extends BaseEntity {
  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid', nullable: true })
  botId: string | null;

  @Column({ type: 'varchar', length: 2048 })
  url: string;

  @Column({ type: 'text', array: true })
  events: WebhookEvent[];

  @Column({ type: 'varchar', length: 255 })
  signingSecret: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  customHeaders: Record<string, string> | null;

  @Column({ type: 'int', default: 0 })
  totalDeliveries: number;

  @Column({ type: 'int', default: 0 })
  failedDeliveries: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastDeliveredAt: Date | null;

  @Column({ type: 'int', nullable: true })
  lastStatusCode: number | null;

  @ManyToOne('Organization', 'webhooks', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: any;

  @ManyToOne('Bot', 'webhooks', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'botId' })
  bot: any | null;
}
