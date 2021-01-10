import { Types } from 'mongoose';
import { IsDateString, IsString } from 'class-validator';

export class CreateUserTokenDto {
  @IsString()
  token: string;
  @IsString()
  uId: Types.ObjectId;
  @IsDateString()
  expireAt: string;
}
