import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const configService = new ConfigService();
  const port = configService.get<number>('PORT');
  const url = configService.get<string>('URL');

  const config = new DocumentBuilder()
    .setTitle('Finance App API')
    .setDescription('API documentation for the Finance App')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(`http://${url}:${port}`)
    .addTag('Authentication')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  console.log(`Swagger documentation available at http://${url}:${port}/docs`);
}
