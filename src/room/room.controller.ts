import { Body, Controller, Get, Param, Post, Query, Redirect, Render, UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import * as _ from 'lodash';

import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { MessageService } from '../message/message.service';
import { AuthGuard } from '../shared/auth.guard';
import { SearchRoomDto } from './dto/search-room.dto';
import { ApiTags } from '@nestjs/swagger';

// @UseGuards(AuthGuard)
@ApiTags('Rooms')
@Controller('rooms')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly messageService: MessageService,
  ) {}

  @Get('/')
  @Render('rooms')
  async getAllRooms(@Query() searchRoomDto: SearchRoomDto) {
    if (!_.isEmpty(searchRoomDto)) {
      const rooms = await this.roomService.getRooms(searchRoomDto.searchText);
      return { title: 'chat rooms', rooms };
    } else {
      const rooms = await this.roomService.getRooms();
      return { title: 'chat rooms', rooms };
    }
  }

  @Post('/create')
  @Redirect('/rooms')
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(createRoomDto);
  }

  @Get('/:roomId/chat-room')
  @Render('chat-room')
  async processChatRoom(@Param() roomId) {
    const [messages, users] = await Promise.all([
      this.messageService.getAllByRoomId(roomId.roomId),
      this.roomService.getUsersByRoomId(new ObjectId(roomId.roomId)),
    ]);

    return { title: 'chat room', messages, users };
  }
}
