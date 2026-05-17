import { Global, Module } from '@nestjs/common';
import { AeroLogger } from './logger.service';

@Global()
@Module({
  providers: [AeroLogger],
  exports: [AeroLogger],
})
export class LoggerModule {}
