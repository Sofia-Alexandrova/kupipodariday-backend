import { IsNumber, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateOfferDto {
  @IsNumber()
  wishId: number;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsBoolean()
  anonymous?: boolean;

  @IsOptional()
  @IsString()
  message?: string;
}
