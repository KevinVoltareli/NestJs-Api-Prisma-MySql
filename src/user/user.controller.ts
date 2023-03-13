import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseInterceptors,
  UseGuards,
} from "@nestjs/common";
import { ParamId } from "src/decorator/param-id.decorator";
import { Roles } from "src/decorator/roles.decorator";
import { Role } from "src/enums/role.enum";
import { AuthGuard } from "src/guards/auth.guard";
import { RoleGuard } from "src/guards/role.guard";
import { LogInterceptor } from "src/interceptors/log.interceptor";
import { CreateUserDTO } from "./dto/create-user.dto";
import { UpdatePatchUserDTO } from "./dto/update-patch.user";
import { UpdatePutUserDTO } from "./dto/update-put-user";
import { UserService } from "./user.service";

@Roles(Role.Admin)
@UseGuards(AuthGuard, RoleGuard)
@UseInterceptors(LogInterceptor)
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  //Guardo do throttler é para limitar a requisição da rota
  //Caso queira sobrescrever o que foi feito no throttler em app.module -> new ThrottlerGuard({args})
  //@UseGuards(ThrottlerGuard)
  @Post()
  async create(@Body() data: CreateUserDTO) {
    return this.userService.create(data);
  }

  @Get()
  async read() {
    return this.userService.list();
  }

  @Get(":id")
  async readOne(@ParamId("id", ParseIntPipe) id: number) {
    console.log({ id });
    return this.userService.show(id);
  }

  //Pode-se ser substituido o parseintpipe por @paramid

  @Put(":id")
  async update(
    @Body() data: UpdatePutUserDTO,
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.userService.update(id, data);
  }

  @Patch(":id")
  async partialUpdate(
    @Body() data: UpdatePatchUserDTO,
    @Param("id", ParseIntPipe) id,
  ) {
    return this.userService.updatePartial(id, data);
  }

  @Delete(":id")
  async delete(@Param("id", ParseIntPipe) id: number) {
    return this.userService.delete(id);
  }
}
