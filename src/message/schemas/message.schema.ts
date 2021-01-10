import { Types, Schema } from 'mongoose';

export const MessageSchema = new Schema({
  text: { type: String, required: true },
  userId: { type: Types.ObjectId, required: true, ref: 'user' },
  roomId: { type: Types.ObjectId, required: true, ref: 'room' },
});
