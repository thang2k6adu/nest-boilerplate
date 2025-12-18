import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailQueue } from './email.queue';
import { NotificationQueue } from './notification.queue';
import { EmailProcessor } from './processors/email.processor';
import { NotificationProcessor } from './processors/notification.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get<string>('redis.host');
        const redisPort = configService.get<number>('redis.port');
        const redisPassword = configService.get<string>('redis.password');

        return {
          redis: {
            host: redisHost,
            port: redisPort,
            password: redisPassword || undefined,
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'notification' },
    ),
  ],
  providers: [EmailQueue, NotificationQueue, EmailProcessor, NotificationProcessor],
  exports: [EmailQueue, NotificationQueue],
})
export class QueuesModule {}

