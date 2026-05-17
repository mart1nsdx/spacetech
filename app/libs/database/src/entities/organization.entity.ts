import {
  Entity,
  Column,
  OneToMany,
  BeforeInsert,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { OrganizationPlan } from '../enums/organization-plan.enum';

@Entity('organizations')
export class Organization extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({
    type: 'enum',
    enum: OrganizationPlan,
    default: OrganizationPlan.FREE,
  })
  plan: OrganizationPlan;

  @Column({ type: 'jsonb', nullable: true })
  planOverrides: Record<string, unknown> | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @OneToMany('User', 'organization')
  users: any[];

  @OneToMany('Bot', 'organization')
  bots: any[];

  @OneToMany('ApiKey', 'organization')
  apiKeys: any[];

  @OneToMany('Webhook', 'organization')
  webhooks: any[];

  @OneToMany('KnowledgeDocument', 'organization')
  knowledgeDocuments: any[];

  @OneToMany('AnalyticsEvent', 'organization')
  analyticsEvents: any[];

  @BeforeInsert()
  generateSlug() {
    if (!this.slug && this.name) {
      this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
  }
}
