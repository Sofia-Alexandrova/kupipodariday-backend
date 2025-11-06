import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Wish } from '../wishes/wish.entity';
import { User } from '../users/user.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer) private readonly repo: Repository<Offer>,
    @InjectRepository(Wish) private readonly wishesRepo: Repository<Wish>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async create(dto: CreateOfferDto): Promise<Offer> {
    const user = await this.usersRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');
    const wish = await this.wishesRepo.findOne({ where: { id: dto.itemId } });
    if (!wish) throw new NotFoundException('Wish not found');

    const offer = this.repo.create({
      user: user as any,
      item: wish as any,
      amount: dto.amount,
      hidden: dto.hidden ?? false,
    });
    const saved = await this.repo.save(offer);

    // Update wish.raised
    wish.raised = Number((Number(wish.raised) + Number(dto.amount)).toFixed(2));
    await this.wishesRepo.save(wish);

    return saved;
  }

  async findAll(): Promise<Offer[]> {
    return this.repo.find({ relations: ['user', 'item'] });
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Offer not found');
    await this.repo.remove(entity);
  }
}
