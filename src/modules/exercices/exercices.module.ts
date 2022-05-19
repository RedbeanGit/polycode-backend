import { Module } from '@nestjs/common';
import { ExercicesService } from './exercices.service';
import { ExercicesController } from './exercices.controller';
import { UsersModule } from '../users/users.module';
import { RunnersModule } from 'src/core/runners/runners.module';
import { RunnersService } from 'src/core/runners/runners.service';

@Module({
  imports: [UsersModule, RunnersModule],
  providers: [ExercicesService, RunnersService],
  controllers: [ExercicesController],
})
export class ExercicesModule {}
