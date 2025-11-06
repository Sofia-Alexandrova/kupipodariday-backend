import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Get,
  Delete,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';

@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly svc: WishlistsService) {}

  @Post(':ownerId')
  create(
    @Param('ownerId', ParseIntPipe) ownerId: number,
    @Body() dto: CreateWishlistDto,
  ) {
    return this.svc.create(ownerId, dto);
  }

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
