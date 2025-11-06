import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Wish } from '../wishes/wish.entity';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.offers, { onDelete: 'SET NULL' })
  user: User;

  @ManyToOne(() => Wish, (w) => w.offers, { onDelete: 'CASCADE' })
  item: Wish;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ default: false })
  hidden: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
