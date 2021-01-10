import { Schema, Types } from 'mongoose';

export const RoomSchema = new Schema({
  name: { type: String, required: true },
  connectedUsers: [
    {
      type: Types.ObjectId,
      ref: 'user',
      required: false,
    },
  ],
});
