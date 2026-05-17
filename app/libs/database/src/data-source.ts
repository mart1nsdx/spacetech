import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
  Organization,
  User,
  ApiKey,
  Bot,
  Session,
  Message,
  KnowledgeDocument,
  DocumentChunk,
  AnalyticsEvent,
  Webhook,
} from './entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env['DATABASE_URL'],
  entities: [
    Organization,
    User,
    ApiKey,
    Bot,
    Session,
    Message,
    KnowledgeDocument,
    DocumentChunk,
    AnalyticsEvent,
    Webhook,
  ],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
  logging: process.env['NODE_ENV'] === 'development',
});
