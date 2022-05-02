import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './core/database/database.module';
import { ExerciceSetsModule } from './modules/exercice-sets/exerciceSets.module';
import { ExercicesModule } from './modules/exercices/exercices.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    DatabaseModule,
    ExercicesModule,
    ExerciceSetsModule,
    UsersModule,
  ],
})
export class AppModule {}
