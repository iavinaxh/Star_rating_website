import { IsEmail, IsNotEmpty, Length, IsOptional, IsInt } from 'class-validator';

export class CreateStoreDto {
  @IsNotEmpty({ message: 'Store Name is required' })
  @Length(2, 60, { message: 'Store Name must be between 2 and 60 characters.' })
  name: string;

  @IsNotEmpty({ message: 'Store Email is required' })
  @IsEmail({}, { message: 'Must be a valid email address.' })
  email: string;

  @IsNotEmpty({ message: 'Store Address is required' })
  @Length(1, 400, { message: 'Store Address must be between 1 and 400 characters.' })
  address: string;

  @IsOptional()
  @IsInt({ message: 'Owner ID must be an integer' })
  ownerId?: number;
}
