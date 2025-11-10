import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { sanitizeUser } from '../utils/utils';

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signin(@Request() req) {
    const token = await this.authService.login(req.user);
    return { user: sanitizeUser(req.user), token };
  }

  @Post('signup')
  async signup(@Body() dto: CreateUserDto) {
    const exists = await this.usersService.findByUsername(dto.username);
    if (exists) throw new BadRequestException('Username already exists');
    const user = await this.usersService.create(dto);
    const token = await this.authService.login(user);
    return { user: sanitizeUser(user), token };
  }
}
