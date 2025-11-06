import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Offer } from '../offers/offer.entity';

@Entity('wishes')
export class Wish {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 250 })
  name: string;

  @Column({ nullable: true, type: 'text' })
  link?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  price?: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  raised: number;

  @ManyToOne(() => User, (user) => user.wishes, { onDelete: 'SET NULL' })
  owner: User;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => Offer, (offer) => offer.item)
  offers: Offer[];

  @Column({ type: 'int', default: 0 })
  copied: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
