import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
  Request,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Wish } from './wish.entity';

@Controller('wishes')
export class WishesController {
  constructor(private readonly svc: WishesService) {}

  @Get('top')
  async top(@Query('limit', ParseIntPipe) limit = 10) {
    const res = await this.svc.findTop(Number(limit) || 10);
    return this.sanitizeMany(res);
  }

  @Get('last')
  async last(@Query('limit', ParseIntPipe) limit = 10) {
    const res = await this.svc.findLast(Number(limit) || 10);
    return this.sanitizeMany(res);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateWishDto, @Request() req) {
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
    if (!res) throw new NotFoundException('Wish not found');
    return this.sanitize(res);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWishDto,
    @Request() req,
  ) {
    const updated = await this.svc.updateWithAuth(id, dto, req.user.id);
    return this.sanitize(updated);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.svc.removeWithAuth(id, req.user.id);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/copy')
  async copy(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const copied = await this.svc.copyWish(req.user.id, id);
    return this.sanitize(copied);
  }

  private sanitize(wish: Wish | null) {
    if (!wish) return null;
    const w: any = { ...wish } as any;

    if (w.owner) {
      const owner = { ...w.owner } as any;
      if (owner.password) delete owner.password;
      w.owner = owner;
    }

    if (Array.isArray(w.offers)) {
      w.offers = w.offers.map((o: any) => {
        const offer = { ...o } as any;
        if (offer.user) {
          const u = { ...offer.user } as any;
          if (u.password) delete u.password;
          offer.user = u;
        }
        return offer;
      });
    }

    return w;
  }

  private sanitizeMany(items: Wish[]) {
    return items.map((i) => this.sanitize(i));
  }
}
