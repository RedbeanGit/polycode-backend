import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  readonly firstname: string;

  @IsNotEmpty()
  readonly lastname: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;

  readonly isAdmin: boolean;
  readonly isVerified: boolean;
  readonly verificationCode: number;
  readonly lastLogin: Date;
}

export class PartialUserDto {
  readonly firstname: string;
  readonly lastname: string;
  readonly email: string;
  readonly password: string;
  readonly isVerified: boolean;
  readonly verificationCode: number;
  readonly isAdmin: boolean;
}
