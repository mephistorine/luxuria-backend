import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as morgan from 'morgan'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { env } from '../environments/env'
import { WebsocketAdapter } from './shared/adapters/ws.adapter'

async function bootstrap() {
  const server = env.get('server')
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true })

  app.enableCors({
    origin: [ 'localhost:8081' ],
    methods: [ 'GET', 'POST', 'OPTIONS', 'DELETE' ],
    allowedHeaders: [ 'Authorization' ]
  })
  app.use(morgan('dev'))
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/'
  })
  app.useWebSocketAdapter(new WebsocketAdapter(app))

  const options = new DocumentBuilder()
    .setTitle('Luxuria API')
    .setDescription('REST API for Luxuria app')
    .setContactEmail('stylesam@yandex.ru')
    .setVersion(env.get('appVersion'))
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, options)
  const swaggerPath = 'api-doc'

  SwaggerModule.setup(swaggerPath, app, document)

  console.log(`Swagger doc started on http://${server.host}:${server.port}/${swaggerPath}`)

  await app.listen(server.port)
}

bootstrap()
