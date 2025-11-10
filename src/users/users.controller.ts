import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UseGuards,
  Request,
  Patch,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WishesService } from '../wishes/wishes.service';
import { sanitizeUser, sanitizeAny } from '../utils/utils';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly svc: UsersService,
    private readonly wishesSvc: WishesService,
  ) {}

  @Get('me')
  async me(@Request() req) {
    const user = await this.svc.findOne(req.user.id);
    return sanitizeUser(user);
  }

  @Patch('me')
  async updateMe(@Request() req, @Body() dto: UpdateUserDto) {
    const updated = await this.svc.update(req.user.id, dto);
    return sanitizeUser(updated);
  }

  @Get('me/wishes')
  async myWishes(@Request() req, @Query('limit', ParseIntPipe) limit = 20) {
    const res = await this.wishesSvc.findByOwnerId(
      req.user.id,
      Number(limit) || 20,
    );
    return sanitizeAny(res);
  }

  @Get('by/:username')
  async getByUsername(@Param('username') username: string) {
    const user = await this.svc.findByUsername(username);
    if (!user) return null;
    return sanitizeUser(user);
  }

  @Get('by/:username/wishes')
  async getWishesByUsername(
    @Param('username') username: string,
    @Query('limit', ParseIntPipe) limit = 20,
  ) {
    const res = await this.wishesSvc.findByOwnerUsername(
      username,
      Number(limit) || 20,
    );
    return sanitizeAny(res);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.svc.findOne(id);
    return sanitizeUser(user);
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.svc.create(dto);
    return sanitizeUser(user);
  }

  @Get()
  async findAll() {
    const users = await this.svc.findAll();
    return sanitizeAny(users);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.svc.update(id, dto);
    return sanitizeUser(user);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.svc.remove(id);
    return { ok: true };
  }

  @Post('find')
  async findUsers(@Body('query') query: string, @Body('limit') limit = 10) {
    return this.svc.search(query, Number(limit) || 10);
  }
}
