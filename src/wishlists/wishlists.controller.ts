import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Get,
  Delete,
  UseGuards,
  Request,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Wishlist } from './wishlist.entity';

@UseGuards(JwtAuthGuard)
@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly svc: WishlistsService) {}

  @Post()
  async create(@Body() dto: CreateWishlistDto, @Request() req) {
    const saved = await this.svc.create(req.user.id, dto);
    return this.sanitize(saved);
  }

  @Get()
  async findAll() {
    const res = await this.svc.findAll();
    return this.sanitizeMany(res);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const res = await this.svc.findOne(id);
    if (!res) throw new NotFoundException('Wishlist not found');
    return this.sanitize(res);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateWishlistDto,
    @Request() req,
  ) {
    const updated = await this.svc.update(id, req.user.id, dto);
    return this.sanitize(updated);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.svc.remove(id);
    return { ok: true };
  }

  private sanitize(wl: Wishlist | null) {
    if (!wl) return null;
    const w: any = { ...wl } as any;
    if (w.owner) {
      const owner = { ...w.owner } as any;
      if (owner.password) delete owner.password;
      w.owner = owner;
    }
    if (Array.isArray(w.items)) {
      w.items = w.items.map((it: any) => {
        const item = { ...it } as any;
        if (item.owner) {
          const owner = { ...item.owner } as any;
          if (owner.password) delete owner.password;
          item.owner = owner;
        }
        return item;
      });
    }
    return w;
  }

  private sanitizeMany(items: Wishlist[]) {
    return items.map((i) => this.sanitize(i));
  }
}
