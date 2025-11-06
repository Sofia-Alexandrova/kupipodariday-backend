import {
  IsString,
  IsOptional,
  IsNumber,
  IsUrl,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateWishDto {
  @IsString()
  @MaxLength(250)
  name: string;

  @IsOptional()
  @IsUrl()
  link?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
