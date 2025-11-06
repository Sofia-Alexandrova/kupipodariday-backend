import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wish } from './wish.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish) private readonly repo: Repository<Wish>,
  ) {}

  async create(ownerId: number, dto: CreateWishDto): Promise<Wish> {
    const wish = this.repo.create({ ...dto, owner: { id: ownerId } as any });
    return this.repo.save(wish);
  }

  async findAll(): Promise<Wish[]> {
    return this.repo.find({ relations: ['owner', 'offers'] });
  }

  async findOne(id: number): Promise<Wish | null> {
    return this.repo.findOne({ where: { id }, relations: ['owner', 'offers'] });
  }

  async update(id: number, dto: UpdateWishDto): Promise<Wish> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Wish not found');
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Wish not found');
    await this.repo.remove(entity);
  }
}
