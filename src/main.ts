import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as config from 'config'
import * as process from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const serverConfig = config.get('server');
  if (process.env.NODE_ENV == 'development') {
    app.enableCors();
  }
  else {
    app.enableCors({origin: serverConfig.origin});
  }

  const port = process.env.PORT || serverConfig.port;
  await app.listen(port);
}
bootstrap();
