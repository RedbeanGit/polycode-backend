import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { ExerciceSetsController } from './exerciceSets.controller';
import { exerciceSetProviders } from './exerciceSets.providers';
import { ExerciceSetsService } from './exerciceSets.service';

@Module({
  imports: [UsersModule],
  controllers: [ExerciceSetsController],
  providers: [ExerciceSetsService, ...exerciceSetProviders],
})
export class ExerciceSetsModule {}
