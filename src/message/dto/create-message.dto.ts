import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateMessageDto {
  text: string;

  userId: Types.ObjectId;

  roomId: Types.ObjectId;
}
