import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';

import { CreateMessageDto } from './dto/create-message.dto';
import { IMessage } from './interfaces/message.interface';
import { ObjectId } from 'mongodb';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('Message') private readonly messageModel: Model<IMessage>,
  ) {}

  async create(createMessageDto: CreateMessageDto) {
    return new this.messageModel(createMessageDto).save();
  }

  async getAllByRoomId(roomId: string) {
    const rId = new ObjectId(roomId);
    return this.messageModel.aggregate([
      {
        $match: {
          roomId: rId,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
    ]);
  }
}
