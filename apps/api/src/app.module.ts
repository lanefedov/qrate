import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';
import { CalculationModule } from './calculation/calculation.module';
import { TestTypesModule } from './test-types/test-types.module';
import {
  attachMongooseConnectionLogging,
  configureMongooseLogging,
} from './common/mongoose-logging';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongodbUri'),
        connectionFactory: (connection: Connection) => {
          configureMongooseLogging();
          return attachMongooseConnectionLogging(connection);
        },
      }),
    }),
    AuthModule,
    UsersModule,
    CustomersModule,
    OrdersModule,
    CalculationModule,
    TestTypesModule,
  ],
})
export class AppModule {}
