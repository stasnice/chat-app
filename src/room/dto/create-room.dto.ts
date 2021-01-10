import { IsString } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  private readonly name: string;
}
