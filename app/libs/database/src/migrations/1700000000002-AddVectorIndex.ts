import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVectorIndex1700000000002 implements MigrationInterface {
  name = 'AddVectorIndex1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX "IDX_document_chunks_embedding_hnsw"
      ON "document_chunks" USING hnsw (embedding vector_cosine_ops)
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_document_chunks_bot_public"
      ON "document_chunks" ("bot_id", "is_public")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_document_chunks_bot_public"`);
    await queryRunner.query(`DROP INDEX "IDX_document_chunks_embedding_hnsw"`);
  }
}
