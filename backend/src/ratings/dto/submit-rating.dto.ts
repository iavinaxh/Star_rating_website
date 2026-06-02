import { IsInt, IsNotEmpty, Max, Min, IsOptional, IsString, Length } from 'class-validator';

export class SubmitRatingDto {
  @IsNotEmpty({ message: 'Store ID is required' })
  @IsInt({ message: 'Store ID must be an integer' })
  storeId: number;

  @IsNotEmpty({ message: 'Rating is required' })
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1.' })
  @Max(5, { message: 'Rating must be at most 5.' })
  rating: number;

  @IsOptional()
  @IsString({ message: 'Comment must be a string' })
  @Length(0, 500, { message: 'Comment must not exceed 500 characters.' })
  comment?: string;
}
