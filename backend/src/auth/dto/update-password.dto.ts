import { IsNotEmpty, Length, Matches } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty({ message: 'Password is required' })
  @Length(8, 16, { message: 'Password must be between 8 and 16 characters.' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_+\-=\[\]{};':"\\|,.<>\/?]).*$/, {
    message: 'Password must contain at least one uppercase letter and one special character.',
  })
  password: string;
}
