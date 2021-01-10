import { Schema, Types } from 'mongoose';

export const TokenSchema = new Schema({
  token: { type: String, required: true },
  uId: { type: Types.ObjectId, required: true, ref: 'User' },
  expireAt: { type: Date, required: true },
});
