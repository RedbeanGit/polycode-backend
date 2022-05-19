import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { ExerciceSetsController } from './exerciceSets.controller';
import { ExerciceSetsService } from './exerciceSets.service';

@Module({
  imports: [UsersModule],
  controllers: [ExerciceSetsController],
  providers: [ExerciceSetsService],
})
export class ExerciceSetsModule {}
