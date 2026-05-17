import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('api_keys')
@Index(['organizationId'])
export class ApiKey extends BaseEntity {
  @Column({ type: 'uuid' })
  organizationId!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64, unique: true })
  keyHash!: string;

  @Column({ type: 'varchar', length: 8 })
  keyPreview!: string;

  @Column({ type: 'varchar', length: 10, default: 'aa_live_' })
  prefix!: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'text', array: true, default: [] })
  scopes!: string[];

  @Column({ type: 'timestamptz', nullable: true })
  lastUsedAt: Date | null;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'text', array: true, default: [] })
  allowedIps: string[];

  @ManyToOne('Organization', 'apiKeys', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: any;

  @BeforeInsert()
  setDefaultScopes() {
    if (!this.scopes || this.scopes.length === 0) {
      this.scopes = ['chat:write', 'docs:read'];
    }
  }
}
