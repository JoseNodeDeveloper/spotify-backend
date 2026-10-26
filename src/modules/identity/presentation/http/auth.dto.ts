import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MaxLength } from 'class-validator';

/*
 * DTOs validate the SHAPE of the request (types, lengths).
 * BUSINESS rules (strong password, unique email) live in the domain.
 */
export class RegisterUserDto {
  @ApiProperty({ example: 'jose' })
  @IsString()
  @Length(2, 20)
  username!: string;

  @ApiProperty({ example: 'jose@example.com' })
  @IsEmail()
  @MaxLength(100)
  email!: string;

  @ApiProperty({ example: 'secure-password-2026' })
  @IsString()
  @Length(10, 72)
  password!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'jose@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(72)
  password!: string;
}
