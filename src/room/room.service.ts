import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateRoomDto } from './dto/create-room.dto';
import { IRoom } from './interfaces/room.interface';

@Injectable()
export class RoomService {
  constructor(@InjectModel('Room') private readonly roomModel: Model<IRoom>) {}

  async create(createRoomDto: CreateRoomDto) {
    return new this.roomModel(createRoomDto).save();
  }

  async getRooms(searchText: string = null) {
    if (searchText) {
      return this.roomModel
        .find({
          name: { $regex: searchText },
        })
        .exec();
    } else {
      return this.roomModel.find().exec();
    }
  }

  async addUserToRoom(roomId, userId) {
    await this.roomModel.findByIdAndUpdate(
      { _id: roomId },
      { $push: { connectedUsers: userId } },
    );
  }

  async removeUserFromRoom(roomId, userId): Promise<IRoom> {
    return this.roomModel.findById(roomId)
      .then((room) => {
      room.connectedUsers = room.connectedUsers.filter((i) => i.toHexString() !== userId);
      return room.save();
    });
  }

  async getUsersByRoomId(roomId) {
    const users = await this.roomModel.aggregate([
      {
        $match: {
          _id: roomId,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'connectedUsers',
          foreignField: '_id',
          as: 'users',
        },
      },
    ]);

    return users[0].users;
  }
}
