import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ensureCsvFileExists } from './utils/CSV';
import { CSV_FILE_USER, CSV_HEADERS_USER } from './users/csv-user.repository';
import { CSV_FILE_GROUP, CSV_HEADERS_GROUP } from './group/group.repository';
async function bootstrap() {
  await ensureCsvFileExists({
    CSV_FILE: CSV_FILE_USER,
    CSV_HEADERS: CSV_HEADERS_USER,
  });

  await ensureCsvFileExists({
    CSV_FILE: CSV_FILE_GROUP,
    CSV_HEADERS: CSV_HEADERS_GROUP,
  });

  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('ZAP ZAP 2')
    .setDescription('bora passar')
    .setVersion('2.9.9')
    .addBearerAuth()
    // .addTag('cats')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`esta rodando em http://localhost:${3000}/api`);
}
bootstrap();
