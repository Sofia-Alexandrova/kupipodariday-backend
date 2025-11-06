import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Wishlist } from './wishlist.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { User } from '../users/user.entity';
import { Wish } from '../wishes/wish.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist) private readonly repo: Repository<Wishlist>,
    @InjectRepository(Wish) private readonly wishesRepo: Repository<Wish>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async create(ownerId: number, dto: CreateWishlistDto): Promise<Wishlist> {
    const owner = await this.usersRepo.findOne({ where: { id: ownerId } });
    if (!owner) throw new NotFoundException('Owner not found');
    const items = dto.items
      ? await this.wishesRepo.find({ where: { id: In(dto.items) } })
      : [];
    const wl = this.repo.create({
      name: dto.name,
      description: dto.description,
      items,
      owner,
    });
    return this.repo.save(wl);
  }

  async findAll(): Promise<Wishlist[]> {
    return this.repo.find({ relations: ['items', 'owner'] });
  }

  async findOne(id: number): Promise<Wishlist | null> {
    return this.repo.findOne({ where: { id }, relations: ['items', 'owner'] });
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Wishlist not found');
    await this.repo.remove(entity);
  }
}
