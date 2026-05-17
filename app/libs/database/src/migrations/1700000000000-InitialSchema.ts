import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "organization_plan_enum" AS ENUM ('free', 'pro', 'enterprise')
    `);
    await queryRunner.query(`
      CREATE TYPE "member_role_enum" AS ENUM ('owner', 'admin', 'member')
    `);
    await queryRunner.query(`
      CREATE TYPE "bot_tone_enum" AS ENUM ('formal', 'friendly', 'technical', 'casual')
    `);
    await queryRunner.query(`
      CREATE TYPE "llm_provider_enum" AS ENUM ('openai', 'anthropic', 'groq', 'ollama')
    `);
    await queryRunner.query(`
      CREATE TYPE "message_role_enum" AS ENUM ('user', 'assistant', 'system')
    `);
    await queryRunner.query(`
      CREATE TYPE "document_status_enum" AS ENUM ('pending', 'processing', 'ready', 'error', 'outdated')
    `);
    await queryRunner.query(`
      CREATE TYPE "document_type_enum" AS ENUM ('pdf', 'docx', 'txt', 'url', 'markdown')
    `);
    await queryRunner.query(`
      CREATE TYPE "analytics_event_type_enum" AS ENUM (
        'message_sent', 'session_started', 'session_ended',
        'document_uploaded', 'document_processed',
        'api_key_used', 'bot_created', 'error_occurred'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "organizations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        "name" varchar(100) NOT NULL,
        "slug" varchar(100) NOT NULL,
        "plan" "organization_plan_enum" NOT NULL DEFAULT 'free',
        "plan_overrides" jsonb,
        "is_active" boolean NOT NULL DEFAULT true,
        "metadata" jsonb,
        CONSTRAINT "PK_organizations" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_organizations_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        "organization_id" uuid NOT NULL,
        "email" varchar(255) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "first_name" varchar(100),
        "last_name" varchar(100),
        "avatar_url" varchar(500),
        "role" "member_role_enum" NOT NULL DEFAULT 'member',
        "refresh_token_hashes" text[] NOT NULL DEFAULT '{}',
        "is_email_verified" boolean NOT NULL DEFAULT false,
        "email_verification_token" varchar(255),
        "password_reset_token" varchar(255),
        "password_reset_expires_at" TIMESTAMPTZ,
        "last_login_at" TIMESTAMPTZ,
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "FK_users_organization" FOREIGN KEY ("organization_id")
          REFERENCES "organizations"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "api_keys" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        "organization_id" uuid NOT NULL,
        "name" varchar(100) NOT NULL,
        "key_hash" varchar(64) NOT NULL,
        "key_preview" varchar(8) NOT NULL,
        "prefix" varchar(10) NOT NULL DEFAULT 'aa_live_',
        "is_active" boolean NOT NULL DEFAULT true,
        "scopes" text[] NOT NULL DEFAULT '{}',
        "last_used_at" TIMESTAMPTZ,
        "usage_count" int NOT NULL DEFAULT 0,
        "expires_at" TIMESTAMPTZ,
        "allowed_ips" text[] NOT NULL DEFAULT '{}',
        CONSTRAINT "PK_api_keys" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_api_keys_key_hash" UNIQUE ("key_hash"),
        CONSTRAINT "FK_api_keys_organization" FOREIGN KEY ("organization_id")
          REFERENCES "organizations"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "bots" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        "organization_id" uuid NOT NULL,
        "name" varchar(100) NOT NULL,
        "description" varchar(500),
        "avatar_url" varchar(500),
        "tone" "bot_tone_enum" NOT NULL DEFAULT 'friendly',
        "language" varchar(10) NOT NULL DEFAULT 'es-CO',
        "system_prompt" text NOT NULL,
        "welcome_message" text,
        "blocked_topics" text[] NOT NULL DEFAULT '{}',
        "llm_provider" "llm_provider_enum" NOT NULL DEFAULT 'openai',
        "llm_model" varchar(100) NOT NULL DEFAULT 'gpt-4o-mini',
        "temperature" decimal(3,2) NOT NULL DEFAULT 0.7,
        "max_tokens" int NOT NULL DEFAULT 1000,
        "context_window_size" int NOT NULL DEFAULT 10,
        "rag_top_k" int NOT NULL DEFAULT 5,
        "rag_min_similarity" decimal(3,2) NOT NULL DEFAULT 0.70,
        "use_public_knowledge_base" boolean NOT NULL DEFAULT true,
        "is_active" boolean NOT NULL DEFAULT true,
        "is_public" boolean NOT NULL DEFAULT false,
        "total_sessions" int NOT NULL DEFAULT 0,
        "total_messages" int NOT NULL DEFAULT 0,
        "total_tokens_used" bigint NOT NULL DEFAULT 0,
        CONSTRAINT "PK_bots" PRIMARY KEY ("id"),
        CONSTRAINT "FK_bots_organization" FOREIGN KEY ("organization_id")
          REFERENCES "organizations"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        "bot_id" uuid NOT NULL,
        "external_user_id" varchar(255) NOT NULL,
        "external_user_metadata" jsonb,
        "is_active" boolean NOT NULL DEFAULT true,
        "last_activity_at" TIMESTAMPTZ,
        "message_count" int NOT NULL DEFAULT 0,
        "total_tokens_used" int NOT NULL DEFAULT 0,
        "context" jsonb,
        "channel" varchar(50),
        CONSTRAINT "PK_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sessions_bot" FOREIGN KEY ("bot_id")
          REFERENCES "bots"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        "session_id" uuid NOT NULL,
        "role" "message_role_enum" NOT NULL,
        "content" text NOT NULL,
        "tokens_input" int,
        "tokens_output" int,
        "latency_ms" int,
        "retrieved_chunk_ids" jsonb,
        "retrieval_scores" jsonb,
        "llm_model" varchar(100),
        "finish_reason" varchar(50),
        "feedback" varchar(20),
        "feedback_comment" text,
        CONSTRAINT "PK_messages" PRIMARY KEY ("id"),
        CONSTRAINT "FK_messages_session" FOREIGN KEY ("session_id")
          REFERENCES "sessions"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "knowledge_documents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        "organization_id" uuid NOT NULL,
        "bot_id" uuid,
        "is_public_base" boolean NOT NULL DEFAULT false,
        "file_name" varchar(255) NOT NULL,
        "original_name" varchar(255),
        "file_type" "document_type_enum" NOT NULL,
        "source_url" varchar(2048),
        "storage_key" varchar(500),
        "file_size_bytes" bigint,
        "status" "document_status_enum" NOT NULL DEFAULT 'pending',
        "error_message" text,
        "processed_at" TIMESTAMPTZ,
        "chunk_count" int NOT NULL DEFAULT 0,
        "page_count" int,
        "word_count" int,
        "source_metadata" jsonb,
        "version" int NOT NULL DEFAULT 1,
        CONSTRAINT "PK_knowledge_documents" PRIMARY KEY ("id"),
        CONSTRAINT "FK_knowledge_documents_org" FOREIGN KEY ("organization_id")
          REFERENCES "organizations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_knowledge_documents_bot" FOREIGN KEY ("bot_id")
          REFERENCES "bots"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "document_chunks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        "document_id" uuid NOT NULL,
        "bot_id" uuid,
        "is_public" boolean NOT NULL DEFAULT false,
        "content" text NOT NULL,
        "embedding" varchar,
        "chunk_index" int NOT NULL,
        "page_number" int,
        "metadata" jsonb,
        "token_count" int,
        "embedding_model" varchar(100) NOT NULL DEFAULT 'text-embedding-3-small',
        CONSTRAINT "PK_document_chunks" PRIMARY KEY ("id"),
        CONSTRAINT "FK_document_chunks_document" FOREIGN KEY ("document_id")
          REFERENCES "knowledge_documents"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "analytics_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        "organization_id" uuid NOT NULL,
        "bot_id" uuid NOT NULL,
        "session_id" uuid,
        "message_id" uuid,
        "event_type" "analytics_event_type_enum" NOT NULL,
        "payload" jsonb,
        "tokens_input" int,
        "tokens_output" int,
        "latency_ms" int,
        "channel" varchar(50),
        "ip_address" varchar(45),
        CONSTRAINT "PK_analytics_events" PRIMARY KEY ("id"),
        CONSTRAINT "FK_analytics_events_org" FOREIGN KEY ("organization_id")
          REFERENCES "organizations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_analytics_events_bot" FOREIGN KEY ("bot_id")
          REFERENCES "bots"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "webhooks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        "organization_id" uuid NOT NULL,
        "bot_id" uuid,
        "url" varchar(2048) NOT NULL,
        "events" text[] NOT NULL,
        "signing_secret" varchar(255) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "custom_headers" jsonb,
        "total_deliveries" int NOT NULL DEFAULT 0,
        "failed_deliveries" int NOT NULL DEFAULT 0,
        "last_delivered_at" TIMESTAMPTZ,
        "last_status_code" int,
        CONSTRAINT "PK_webhooks" PRIMARY KEY ("id"),
        CONSTRAINT "FK_webhooks_org" FOREIGN KEY ("organization_id")
          REFERENCES "organizations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_webhooks_bot" FOREIGN KEY ("bot_id")
          REFERENCES "bots"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "webhooks"`);
    await queryRunner.query(`DROP TABLE "analytics_events"`);
    await queryRunner.query(`DROP TABLE "document_chunks"`);
    await queryRunner.query(`DROP TABLE "knowledge_documents"`);
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "bots"`);
    await queryRunner.query(`DROP TABLE "api_keys"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "organizations"`);
    await queryRunner.query(`DROP TYPE "analytics_event_type_enum"`);
    await queryRunner.query(`DROP TYPE "document_type_enum"`);
    await queryRunner.query(`DROP TYPE "document_status_enum"`);
    await queryRunner.query(`DROP TYPE "message_role_enum"`);
    await queryRunner.query(`DROP TYPE "llm_provider_enum"`);
    await queryRunner.query(`DROP TYPE "bot_tone_enum"`);
    await queryRunner.query(`DROP TYPE "member_role_enum"`);
    await queryRunner.query(`DROP TYPE "organization_plan_enum"`);
  }
}
