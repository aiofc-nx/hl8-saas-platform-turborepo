import { Module } from '@nestjs/common';
import { APP_NAME } from '@repo/constants/app';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

/**
 * Logger module for application-wide request and response logging using Pino.
 *
 * Configures the Pino logger with pretty-printing and daily log file rotation.
 * Logs are output to both the console and a dated log file under `./storage/logs/`.
 */
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      useFactory: () => ({
        forRoutes: ['*'],
        pinoHttp: {
          name: APP_NAME,
          autoLogging: true,
          serializers: {
            req: (req) => ({
              method: req.method,
              url: req.url,
              headers: req.headers,
            }),
            res: (res) => ({
              statusCode: res.statusCode,
            }),
            err: (err) => ({
              type: err.constructor.name,
              message: err.message,
              stack: err.stack,
            }),
          },
          transport: {
            targets: [
              {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                },
              },
            ],
          },
        },
      }),
    }),
  ],
})
export class LoggerModule {}
