import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { CalculationService } from './calculation.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'CALC_PACKAGE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'qrate.calc',
            protoPath: join(process.cwd(), 'proto', 'calculation.proto'),
            url: config.get<string>('calcGrpcUrl'),
            loader: {
              keepCase: false,
              longs: String,
              enums: String,
              defaults: true,
              oneofs: true,
            },
          },
        }),
      },
    ]),
  ],
  providers: [CalculationService],
  exports: [CalculationService],
})
export class CalculationModule {}
