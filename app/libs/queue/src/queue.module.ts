import { DynamicModule, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { QueueName } from './enums/queue-name.enum';

@Module({})
export class QueueModule {
  static forRoot(): DynamicModule {
    return {
      module: QueueModule,
      imports: [
        BullModule.forRootAsync({
          useFactory: (config: ConfigService) => ({
            connection: {
              url: config.get<string>('REDIS_URL'),
            },
          }),
          inject: [ConfigService],
        }),
        BullModule.registerQueue(
          { name: QueueName.INGESTION },
          { name: QueueName.EMBEDDINGS },
          { name: QueueName.WEBHOOKS },
        ),
      ],
      exports: [BullModule],
    };
  }
}
