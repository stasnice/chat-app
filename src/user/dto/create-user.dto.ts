import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty()
  readonly email: string;
  @ApiProperty()
  @IsNotEmpty()
  readonly password: string;
}
