import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistsService } from './wishlists.service';
import { WishlistsController } from './wishlists.controller';
import { Wishlist } from './wishlist.entity';
import { Wish } from '../wishes/wish.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist, Wish, User])],
  providers: [WishlistsService],
  controllers: [WishlistsController],
})
export class WishlistsModule {}
