import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { Offer } from './offer.entity';
import { Wish } from '../wishes/wish.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Offer, Wish, User])],
  providers: [OffersService],
  controllers: [OffersController],
})
export class OffersModule {}
