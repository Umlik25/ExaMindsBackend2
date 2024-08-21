import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './healthcheck/health.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from './users';
import { AuthModule } from './auth';

import { User } from './users/entities';
import { LoginRecord } from './auth/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // This makes ConfigModule globally available
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [User, LoginRecord], // Add all your entities here
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    HealthModule
  ],
})
export class AppModule {}
