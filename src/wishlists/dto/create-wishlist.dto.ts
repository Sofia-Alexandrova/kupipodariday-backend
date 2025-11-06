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
  items?: number[]; // IDs of wishes
}
