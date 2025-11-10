import {
  IsString,
  IsOptional,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ArrayNotEmpty()
  @ArrayUnique()
  itemsId?: number[];
}
