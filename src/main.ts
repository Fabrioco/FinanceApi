import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const configService = new ConfigService();
  const port = configService.get<number>('PORT');
  const url = configService.get<string>('URL');
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://${url}:${port}`);
}
bootstrap();
