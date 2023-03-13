import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { LogInterceptor } from "./interceptors/log.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    methods: ["*"],
    origin: ["*"],
  });

  app.useGlobalPipes(new ValidationPipe());

  //app.useGlobalInterceptors(new LogInterceptor());

  await app.listen(3006);
}
bootstrap();
