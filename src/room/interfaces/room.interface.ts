import { Document, Types } from 'mongoose';

export class IRoom extends Document {
  readonly name: string;
  connectedUsers: Types.ObjectId[];
}
