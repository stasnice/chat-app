import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';

import { IUser } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  private readonly saltRound = 10;
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  async hashPassword(password: string): Promise<string>{
    const salt = await bcrypt.genSalt(this.saltRound);
    return await bcrypt.hash(password, salt);
  }

  async create(createUserDto: CreateUserDto): Promise<IUser> {
    const hash = await this.hashPassword(createUserDto.password);

    const createdUser = new this.userModel(_.assignIn(createUserDto, {password: hash}));
    return createdUser.save();
  }

  async find(id: string): Promise<IUser> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<IUser> {
    return this.userModel.findOne({ email }).exec();
  }

  async updatePassword(uId: string, password: string) {
    const dbUpdateResult = await this.userModel.updateOne({_id: uId}, { password });
    return true;
  }
}
