import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UploadedFiles,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from "@nestjs/common";
import {
  FileInterceptor,
  FilesInterceptor,
  FileFieldsInterceptor,
} from "@nestjs/platform-express";
import { User } from "src/decorator/user.decorator";
import { AuthGuard } from "src/guards/auth.guard";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
import { AuthForgetDTO } from "./dto/auth-forget.dto";
import { AuthLoginDTO } from "./dto/auth-login.dto";
import { AuthMeDTO } from "./dto/auth-me.dto";
import { AuthRegisterDTO } from "./dto/auth-register.dto";
import { AuthResetDTO } from "./dto/auth-reset.dto";
import { join } from "path";
import { FileService } from "src/file/file.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly fileService: FileService,
  ) {}

  @Post("login")
  async login(@Body() { email, password }: AuthLoginDTO) {
    return this.authService.login(email, password);
  }

  @Post("register")
  async register(@Body() body: AuthRegisterDTO) {
    return this.authService.register(body);
  }

  @Post("forget")
  async forget(@Body() { email }: AuthForgetDTO) {
    return this.authService.forget(email);
  }

  @Post("reset")
  async reset(@Body() { password, token }: AuthResetDTO) {
    return this.authService.reset(password, token);
  }

  @UseGuards(AuthGuard)
  @Post("me")
  async me(@User("id") user) {
    return { user };
    //return this.authService.checkToken((token ?? "").split(" ")[1]);
  }

  /* PADRÃO DE LIMITE DE UPLOAD É DE 10MB, É POSSIVEL MUDAR O LIMITE */

  @UseInterceptors(FileInterceptor("file"))
  @UseGuards(AuthGuard)
  @Post("photo")
  async uploadPhoto(
    @User() user,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: "image/*" }),
          new MaxFileSizeValidator({ maxSize: 1024 * 50 }),
        ],
      }),
    )
    photo: Express.Multer.File,
  ) {
    /*
     PENSANDO EM ESCABILIDADE, SERIA FEITO UM BALANCEADOR DE CARGA COM 3 SERVIDORES
     ONDE DOIS ESTARIAM RESPONSÁVEIS POR ESTAR FAZENDO OS UPLOADS, E O TERCEIRO
     ARMAZENANDO. NO CASO DESTA CONST, ONDE RECEBE O DIRETORIO DE ONDE É SALVO
     SERIA CHAMADO O TERCEIRO SERVIDOR PARA SER SALVO.
     EM CASO DE SERVIDORES CLOUD, SERIA SUBSTITUIDO PARA A CHAMADA DE OUTRA API.
    */
    const path = join(
      __dirname,
      "..",
      "..",
      "storage",
      "photos",
      `photo-${user.id}.png`,
    );

    try {
      await this.fileService.upload(photo, path);
    } catch (e) {
      throw new BadRequestException(e);
    }
    return { sucess: true };
  }

  //insomnia não permite testar varios envios ao mesmo tempo, necessário criar input
  //1º metodo de envio de multiplos arquivos
  @UseInterceptors(FilesInterceptor("files"))
  @UseGuards(AuthGuard)
  @Post("files")
  async uploadFiles(
    @User() user,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return files;
  }

  //2º metodo de envio de multiplos arquivos - campos separados de envio
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: "photo",
        maxCount: 1,
      },
      {
        name: "documents",
        maxCount: 10,
      },
    ]),
  )
  @UseGuards(AuthGuard)
  @Post("files-fields")
  async uploadFilesFields(
    @User() user,
    @UploadedFiles()
    files: { photo: Express.Multer.File; documents: Express.Multer.File[] },
  ) {
    return files;
  }
}
