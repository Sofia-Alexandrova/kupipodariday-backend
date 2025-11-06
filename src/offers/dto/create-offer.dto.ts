import { IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateOfferDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  itemId: number;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsBoolean()
  hidden?: boolean;
}
