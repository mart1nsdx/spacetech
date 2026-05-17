import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompoundIndexes1700000000003 implements MigrationInterface {
  name = 'AddCompoundIndexes1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX "IDX_messages_session_created"
      ON "messages" ("session_id", "created_at" DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_messages_session_role"
      ON "messages" ("session_id", "role")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_analytics_bot_created"
      ON "analytics_events" ("bot_id", "created_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_analytics_org_created"
      ON "analytics_events" ("organization_id", "created_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_analytics_bot_event"
      ON "analytics_events" ("bot_id", "event_type")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_sessions_bot_activity"
      ON "sessions" ("bot_id", "last_activity_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_sessions_bot_user"
      ON "sessions" ("bot_id", "external_user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_bots_org_active"
      ON "bots" ("organization_id", "is_active")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_knowledge_bot_status"
      ON "knowledge_documents" ("bot_id", "status")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_knowledge_public"
      ON "knowledge_documents" ("is_public_base")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_knowledge_public"`);
    await queryRunner.query(`DROP INDEX "IDX_knowledge_bot_status"`);
    await queryRunner.query(`DROP INDEX "IDX_bots_org_active"`);
    await queryRunner.query(`DROP INDEX "IDX_sessions_bot_user"`);
    await queryRunner.query(`DROP INDEX "IDX_sessions_bot_activity"`);
    await queryRunner.query(`DROP INDEX "IDX_analytics_bot_event"`);
    await queryRunner.query(`DROP INDEX "IDX_analytics_org_created"`);
    await queryRunner.query(`DROP INDEX "IDX_analytics_bot_created"`);
    await queryRunner.query(`DROP INDEX "IDX_messages_session_role"`);
    await queryRunner.query(`DROP INDEX "IDX_messages_session_created"`);
  }
}
