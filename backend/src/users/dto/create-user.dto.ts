import { IsEmail, IsEnum, IsNotEmpty, Length, Matches, IsOptional } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  @Length(2, 60, { message: 'Name must be between 2 and 60 characters.' })
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Must be a valid email address.' })
  email: string;

  @IsNotEmpty({ message: 'Address is required' })
  @Length(1, 400, { message: 'Address must be between 1 and 400 characters.' })
  address: string;

  @IsNotEmpty({ message: 'Password is required' })
  @Length(8, 16, { message: 'Password must be between 8 and 16 characters.' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_+\-=\[\]{};':"\\|,.<>\/?]).*$/, {
    message: 'Password must contain at least one uppercase letter and one special character.',
  })
  password: string;

  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(UserRole, { message: 'Role must be admin, user, or owner' })
  role: UserRole;

  @IsOptional()
  storeId?: number; // Optional store ID to link Store Owner to an existing store during creation
}
