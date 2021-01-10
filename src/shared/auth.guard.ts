import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TokenService } from '../token/token.service';
import { UserService } from '../user/user.service';
import { MessageService } from '../message/message.service';
import { MailService } from '../mail/mail.service';
import { AuthService } from '../auth/auth.service';
import { RoomService } from '../room/room.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    //private readonly messageService: MessageService,
    private readonly tokenService: TokenService,
    //private readonly mailService: MailService,
    //private readonly authService: AuthService,
    //private readonly userService: UserService,
    //private readonly roomService: RoomService,

  ) {
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateUser(request);
  }

  async validateUser(request) {
    const { headers, method, url } = request;
    const separateCookies = headers.cookie.split(';');
    const userPart = separateCookies.filter((i) => i.trim().slice(0, 11) === 'accessToken');
    const token = userPart[0].split('=')[1];

    return await this.tokenService.existByToken(token);
  }
}
