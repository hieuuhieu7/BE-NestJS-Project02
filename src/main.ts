import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TransformInterceptor } from './core/transform.interceptor';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
// require('dotenv').config()


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );
  const configService = app.get(ConfigService);

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  // Interceptor
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  // EJS
  app.useStaticAssets(join(__dirname, '..', 'public')); //js, css, imgs
  app.setBaseViewsDir(join(__dirname, '..', 'views')); // view engine
  app.setViewEngine('ejs');

  // Validate Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }));

  // Config cookie
  app.use(cookieParser());

  // config CORS
  app.enableCors(
    {
      "origin": true,
      "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      "preflightContinue": false,
      credentials: true
    }
  );

  // Config versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1', '2'] // v1, v2
  });

  app.use(helmet());

  await app.listen(configService.get<string>('PORT'));
}
bootstrap();
