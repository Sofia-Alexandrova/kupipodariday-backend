import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  private sanitize(user: User | null): Partial<User> | null {
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
  }

  private sanitizeMany(users: User[]): Partial<User>[] {
    return users.map((u) => this.sanitize(u) as Partial<User>);
  }

  async create(dto: CreateUserDto): Promise<Partial<User>> {
    const existing = await this.repo.findOne({
      where: [{ username: dto.username }, { email: dto.email }],
    });
    if (existing) {
      throw new ConflictException(
        'User with given username or email already exists',
      );
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(dto.password, salt);
    const user = this.repo.create({ ...dto, password: hash });
    const saved = await this.repo.save(user);
    return this.sanitize(saved) as Partial<User>;
  }

  async findAll(): Promise<Partial<User>[]> {
    const users = await this.repo.find();
    return this.sanitizeMany(users);
  }

  async findOne(
    id: number,
    withPassword = false,
  ): Promise<User | Partial<User> | null> {
    if (withPassword) {
      const qb = this.repo
        .createQueryBuilder('user')
        .addSelect('user.password');
      qb.where('user.id = :id', { id });
      const user = await qb.getOne();
      return user || null;
    }

    const user = await this.repo.findOne({ where: { id } });
    return this.sanitize(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<Partial<User>> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.password) {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      user.password = await bcrypt.hash(dto.password, salt);
    }

    const { password, ...restDto } = dto;
    Object.assign(user, restDto);

    const updated = await this.repo.save(user);
    return this.sanitize(updated) as Partial<User>;
  }

  async remove(id: number): Promise<void> {
    const res = await this.repo.delete(id);
    if (res.affected === 0) throw new NotFoundException('User not found');
  }

  async findByUsername(
    username: string,
    withPassword = false,
  ): Promise<User | Partial<User> | null> {
    if (withPassword) {
      const qb = this.repo
        .createQueryBuilder('user')
        .addSelect('user.password');
      qb.where('user.username = :username', { username });
      const user = await qb.getOne();
      return user || null;
    }

    const user = await this.repo.findOne({ where: { username } });
    return this.sanitize(user);
  }

  async search(query: string, limit = 10): Promise<Partial<User>[]> {
    if (!query || query.trim().length < 1) return [];
    const q = `%${query.trim()}%`;

    const connectionType = (this.repo.manager.connection.options as any).type;
    const ilikeSupported =
      connectionType === 'postgres' || connectionType === 'postgresql';

    const where = ilikeSupported
      ? [{ username: ILike(q) }, { about: ILike(q) }, { email: ILike(q) }]
      : [{ username: Like(q) }, { about: Like(q) }, { email: Like(q) }];

    const res = await this.repo.find({
      where,
      take: limit,
    });

    return this.sanitizeMany(res);
  }
}
