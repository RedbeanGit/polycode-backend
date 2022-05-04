import { Module } from '@nestjs/common';
import { runnersProviders } from './runners.providers';

@Module({
  providers: [...runnersProviders],
  exports: [...runnersProviders],
})
export class RunnersModule {}
