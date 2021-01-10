import { Body, Controller, Get, Param, Post, Redirect, Render, UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { MessageService } from '../message/message.service';
import { AuthGuard } from '../shared/auth.guard';

@UseGuards(AuthGuard)
@Controller('rooms')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly messageService: MessageService,
  ) {}


  @Get('/')
  @Render('rooms')
  async getAllRooms() {
    const rooms = await this.roomService.getAllRooms();
    return { title: 'chat rooms', rooms };
  }

  @Post('/create')
  @Redirect('/rooms')
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(createRoomDto);
  }

  @Get('/:roomId/chat-room')
  @Render('chat-room')
  async processChatRoom(@Param() roomId) {
    const messages = await this.messageService.getAllByRoomId(roomId.roomId);
    const users = await this.roomService.getUsersByRoomId(
      new ObjectId(roomId.roomId),
    );

    return { title: 'chat room', messages, users };
  }
}
