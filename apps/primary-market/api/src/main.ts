// SPDX-License-Identifier: Apache-2.0
import { NestFactory } from '@nestjs/core'
import { AppModule } from './AppModule'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS
  app.enableCors()

  // Set global prefix
  app.setGlobalPrefix('api/v1/')

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('GreenBonds Primary Market API')
    .setDescription('The GreenBonds Primary Market API documentation')
    .setVersion('1.0')
    .addTag('primary-market', 'greenbonds')
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documentFactory)

  // Start the application
  const port = process.env.PORT ?? 3000
  await app.listen(port)

  console.log(`🏃 GreenBond Primary Market API is running on: http://localhost:${port}`)
  console.log(`📖 API Documentation: http://localhost:${port}/api`)
}
void bootstrap()
