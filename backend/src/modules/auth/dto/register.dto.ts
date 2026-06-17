import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z\d])/, {
    message:
      'Password must contain at least one letter, one number, and one special character',
  })
  password: string;
}
