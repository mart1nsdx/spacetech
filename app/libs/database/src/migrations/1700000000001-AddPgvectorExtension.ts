import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPgvectorExtension1700000000001 implements MigrationInterface {
  name = 'AddPgvectorExtension1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);
    await queryRunner.query(`
      ALTER TABLE "document_chunks"
      ALTER COLUMN "embedding" TYPE vector(1536)
      USING embedding::vector
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "document_chunks"
      ALTER COLUMN "embedding" TYPE varchar
      USING embedding::text
    `);
  }
}
