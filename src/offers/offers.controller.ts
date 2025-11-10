import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Offer } from './offer.entity';

@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly svc: OffersService) {}

  @Post()
  async create(@Body() dto: CreateOfferDto, @Request() req) {
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
    if (!res) throw new NotFoundException('Offer not found');
    return this.sanitize(res);
  }

  private sanitize(offer: Offer | null) {
    if (!offer) return null;
    const o: any = { ...offer } as any;
    if (o.user) {
      const u = { ...o.user } as any;
      if (u.password) delete u.password;
      o.user = u;
    }
    if (o.item) {
      const item = { ...o.item } as any;
      if (item.owner) {
        const owner = { ...item.owner } as any;
        if (owner.password) delete owner.password;
        item.owner = owner;
      }
      o.item = item;
    }
    return o;
  }

  private sanitizeMany(items: Offer[]) {
    return items.map((i) => this.sanitize(i));
  }
}
