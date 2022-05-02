import { Module } from '@nestjs/common';
import { ExercicesService } from './exercices.service';
import { ExercicesController } from './exercices.controller';
import { exercicesProviders } from './exercices.providers';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [ExercicesService, ...exercicesProviders],
  controllers: [ExercicesController],
})
export class ExercicesModule {}
