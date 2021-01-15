import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { configModule } from './configure.root';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { MailModule } from './mail/mail.module';
import { MessageModule } from './message/message.module';
import { RoomModule } from './room/room.module';
import { ChatGateway } from './chat/chat.gateway';
import { AuthGuard } from './shared/auth.guard';

const environment = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    UserModule,
    AuthModule,
    configModule,
    MongooseModule.forRoot(
      'mongodb+srv://stas:moka11MOKA@cluster0.vi2se.mongodb.net/chat-app-bd',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    ),
    TokenModule,
    MailModule,
    MessageModule,
    RoomModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
