import { IsString } from 'class-validator';

export class SearchRoomDto {
  @IsString()
  readonly searchText: string;
}
