import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import moment = require('moment');
import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';

import { TokenService } from '../token/token.service';
import { UserService } from '../user/user.service';
import { ITokenPayload } from './interfaces/token-payload.interface';
import { CreateUserTokenDto } from '../token/dto/create-user-token.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { MailService } from '../mail/mail.service';
import { IUser } from '../user/interfaces/user.interface';
import { statusEnum } from '../user/enum/status.enum';
import { ConfirmAccountDto } from './dto/confirm-account.dto';
import { SignInDto } from './dto/signin.dto';
import { ProtectedFieldsEnum } from '../user/enum/protected-fields.enum';
import { ISafeUser } from '../user/interfaces/safeUser.interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  async forgotPassword({ email }: ForgotPasswordDto): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new BadRequestException('Wrong email');

    const token = await this.signUser(user);
    const changePasswordLink = `${process.env.FE_APP_URL}/changePassword?token=${token}`;

    await this.mailService.sendEmail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Change password link',
      html: `
        <h3>Hello</h3>
        <p>please use <a href="${changePasswordLink}">this link</a> to change your password ${token}</p>
      `,
    });
  }

  async signIn({ email, password }: SignInDto) {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = await this.signUser(user);
      const safeUser = user.toObject() as ISafeUser;
      safeUser.accessToken = token;
      return _.omit(safeUser, Object.values(ProtectedFieldsEnum));
    }
    // TODO throw exception if there is no user
  }

  async confirm(token: string): Promise<IUser> {
    /* const tokenPayload = await this.jwtService.verify(token); */
    const tokenPayload = await this.getTokenPayload(token);
    const user = await this.userService.find(tokenPayload.uId);
    await this.tokenService.delete(tokenPayload.uId, token);
    if (user && user.status === statusEnum.pending) {
      user.status = statusEnum.active;
      return user.save();
    }
    throw new BadRequestException('Incorrect token!');
  }

  async getTokenPayload(token: string) {
    return await this.jwtService.verify(token);
  }

  async signUp(createUserDto: CreateUserDto): Promise<boolean> {
    const user = await this.userService.create(createUserDto);
    await this.sendConfirmation(user);
    return true;
  }

  async sendConfirmation(user: IUser) {
    const token = await this.signUser(user, false);
    const confirmLink = `${process.env.FE_APP_URL}/auth/confirm?token=${token}`;

    await this.mailService.sendEmail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Verify account',
      html: `
        <h3>Hello</h3>
        <p>please use <a href="${confirmLink}">this link</a> to confirm your account</p>
      `,
    });
  }

  /* check user status(optional), generate payload object (use user id, status and email)
   * to create token, save token and return it */
  async signUser(user: IUser, withStatusCheck = true): Promise<string> {
    if (withStatusCheck && user.status !== statusEnum.active) {
      throw new BadRequestException('Wrong user status');
    }

    const tokenPayload: ITokenPayload = {
      uId: user.id,
      uStatus: user.status,
      uEmail: user.email,
    };

    const token = await this.generateToken(tokenPayload);
    const expireAt = moment().add(1, 'day').toISOString();

    await this.saveToken({
      token,
      expireAt,
      uId: user.id,
    });
    return token;
  }

  async generateToken(tokePayload: ITokenPayload): Promise<string> {
    return this.jwtService.sign(tokePayload);
  }

  async saveToken(createUserTokenDto: CreateUserTokenDto) {
    return this.tokenService.create(createUserTokenDto);
  }

  async verifyToken(token: string) {
    try {
      const tokenPayload = this.jwtService.verify(token);
      const tokenExist = await this.tokenService.exist(tokenPayload.uId, token);
      if (tokenExist) {
        return tokenPayload;
      }
      throw new UnauthorizedException();
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }

  async changePassword({ password, token }: ChangePasswordDto) {
    const tokenPayload = await this.verifyToken(token);
    const newPassword = await this.userService.hashPassword(password);

    await this.userService.updatePassword(tokenPayload.uId, newPassword);
    await this.tokenService.deleteAll(tokenPayload.uId);
    return true;
  }

  async logout(token: string) {
    const tokenPayload = await this.getTokenPayload(token);
    return this.tokenService.deleteAll(tokenPayload.uId);
  }
}
