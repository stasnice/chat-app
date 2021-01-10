import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { MessageService } from '../message/message.service';
import { AuthService } from '../auth/auth.service';
import { RoomService } from '../room/room.service';
import { createEvalAwarePartialHost } from 'ts-node/dist/repl';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit {
  constructor(
    private readonly messageService: MessageService,
    private readonly roomService: RoomService,
    protected readonly authService: AuthService,
  ) {
  }

  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('ChatGateway');

  afterInit(server: any) {
    this.logger.log('SOCKET SOCKET initialized');
  }

  async handleDisconnect(client: Socket) {
    const roomId = this.getChatRoomId(client.handshake.headers.referer);
    const userId = await this.getUserId(client.handshake.headers.cookie);
    await this.roomService.removeUserFromRoom(roomId, userId);
    this.wss.to(roomId).emit('disconnectUser', userId);

    /*client.leave(roomId);*/
  }

  async getUserId(cookie: string) {
    const separateCookies = cookie.split(';');
    const userPart = separateCookies.filter((i) => i.trim().slice(0, 11) === 'accessToken');
    const token = userPart[0].split('=')[1];
    const tokenPayload = await this.authService.getTokenPayload(token);

    return tokenPayload.uId;
  }

  getChatRoomId(url: string) {
    const splitUrl = url.split('/');
    return splitUrl[splitUrl.length - 2];
  }

  @SubscribeMessage('setUserRoom')
  async setUserRoom(client: Socket, data: { roomId: string, accessToken: string }) {
    const tokenPayload = await this.authService.getTokenPayload(data.accessToken);
    await this.roomService.addUserToRoom(new ObjectId(data.roomId), tokenPayload.uId);
    client.join(data.roomId);

    this.wss.to(data.roomId).emit('addUser', { user: tokenPayload.uEmail, userId: tokenPayload.uId });
  }

  @SubscribeMessage('clientToServer')
  async handleMessage(client: Socket, data: { text: string; accessToken: string; roomId: string }) {
    const tokenPayload = await this.authService.getTokenPayload(data.accessToken)
    await this.messageService.create({
      text: data.text,
      userId: tokenPayload.uId,
      roomId: new ObjectId(data.roomId),
    });
    this.wss.to(data.roomId).emit('serverToClient', {
      text: data.text,
      user: tokenPayload.uEmail,
    });
  }
}
