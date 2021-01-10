import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty()
  readonly email: string;
  @IsEmail()
  @ApiProperty()
  readonly password: string;
}
