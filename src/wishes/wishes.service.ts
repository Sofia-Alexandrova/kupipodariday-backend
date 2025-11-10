import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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
    const wish = this.repo.create({
      ...dto,
      owner: { id: ownerId } as any,
    });
    return this.repo.save(wish);
  }

  async findAll(): Promise<Wish[]> {
    return this.repo.find({ relations: ['owner', 'offers'] });
  }

  async findOne(id: number): Promise<Wish | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['owner', 'offers'],
    });
  }

  async update(id: number, dto: UpdateWishDto): Promise<Wish> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Wish not found');
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async updateWithAuth(
    id: number,
    dto: UpdateWishDto,
    userId: number,
  ): Promise<Wish> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!entity) throw new NotFoundException('Wish not found');
    if (!entity.owner || entity.owner.id !== userId)
      throw new ForbiddenException('Not owner');
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<void> {
    const res = await this.repo.delete(id);
    if (res.affected === 0) throw new NotFoundException('Wish not found');
  }

  async removeWithAuth(id: number, userId: number): Promise<void> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!entity) throw new NotFoundException('Wish not found');
    if (!entity.owner || entity.owner.id !== userId)
      throw new ForbiddenException('Not owner');
    await this.repo.remove(entity);
  }

  async findTop(limit = 10): Promise<Wish[]> {
    return this.repo.find({
      relations: ['owner', 'offers'],
      order: { copied: 'DESC' },
      take: limit,
    });
  }

  async findLast(limit = 10): Promise<Wish[]> {
    return this.repo.find({
      relations: ['owner', 'offers'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByOwnerId(ownerId: number, limit = 20): Promise<Wish[]> {
    return this.repo.find({
      where: { owner: { id: ownerId } as any },
      relations: ['owner', 'offers'],
      take: limit,
    });
  }

  async findByOwnerUsername(username: string, limit = 20): Promise<Wish[]> {
    return this.repo
      .createQueryBuilder('wish')
      .leftJoinAndSelect('wish.owner', 'owner')
      .leftJoinAndSelect('wish.offers', 'offers')
      .where('owner.username = :username', { username })
      .take(limit)
      .getMany();
  }

  async copyWish(userId: number, wishId: number): Promise<Wish> {
    const original = await this.repo.findOne({
      where: { id: wishId },
      relations: ['owner'],
    });
    if (!original) throw new NotFoundException('Wish not found');
    if (original.owner && original.owner.id === userId) {
      throw new ForbiddenException('Cannot copy your own wish');
    }

    const copy = this.repo.create({
      name: original.name,
      link: original.link,
      image: original.image,
      price: original.price,
      description: original.description,
      owner: { id: userId } as any,
    });

    return this.repo.manager.transaction(async (manager) => {
      const saved = await manager.save(copy);
      original.copied = (Number(original.copied) || 0) + 1;
      await manager.save(original);
      return saved;
    });
  }
}
