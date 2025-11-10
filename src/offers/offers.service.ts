import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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

  async create(userId: number, dto: CreateOfferDto): Promise<Offer> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const wish = await this.wishesRepo.findOne({
      where: { id: dto.wishId },
      relations: ['owner'],
    });
    if (!wish) throw new NotFoundException('Wish not found');
    if (wish.owner && wish.owner.id === userId)
      throw new ForbiddenException('Cannot offer on your own wish');

    const offer = this.repo.create({
      user: user as any,
      item: wish as any,
      amount: dto.amount ?? 0,
      hidden: dto.anonymous ?? false,
    });
    const saved = await this.repo.save(offer);

    wish.raised = Number(
      (Number(wish.raised) + Number(dto.amount || 0)).toFixed(2),
    );
    await this.wishesRepo.save(wish);

    return saved;
  }

  async findAll(): Promise<Offer[]> {
    return this.repo.find({ relations: ['user', 'item'] });
  }

  async findOne(id: number): Promise<Offer | null> {
    return this.repo.findOne({ where: { id }, relations: ['user', 'item'] });
  }

  async remove(id: number): Promise<void> {
    const res = await this.repo.delete(id);
    if (res.affected === 0) throw new NotFoundException('Offer not found');
  }
}
