import { Body, Controller, Get, Patch, Post, Query, Redirect, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ConfirmAccountDto } from './dto/confirm-account.dto';
import { SignInDto } from './dto/signin.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ITokenPayload } from './interfaces/token-payload.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signIn')
  @Redirect(`/rooms`)
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response) {
    const { accessToken } = await this.authService.signIn(signInDto);
    res.cookie('accessToken', accessToken);
    return true;
  }

  @Redirect('../')
  @Post('/signUp')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Redirect('../')
  @Get('/confirm')
  async confirm(@Query() query: ConfirmAccountDto) {
    return this.authService.confirm(query.token);
  }

  @Post('/forgotPassword')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Redirect('../')
  @Patch('/changePassword')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(changePasswordDto);
  }

  @Redirect('../')
  @Get('/logout')
  async logout(@Req() req: Request) {
    return this.authService.logout(req.cookies.accessToken);
  }
}
