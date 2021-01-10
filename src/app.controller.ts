import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('login')
  loginPage() {
    return { title: 'logIn' };
  }

  @Get('/signup')
  @Render('sign-up')
  signUP() {
    return { title: 'signUp' };
  }

  @Get('/forgotPass')
  @Render('forgot-password')
  forgotPassword() {
    return { title: 'forgot Password' };
  }

  @Get('/changePassword')
  @Render('change-password')
  changePassword() {
    return { title: 'change Password' };
  }
}
