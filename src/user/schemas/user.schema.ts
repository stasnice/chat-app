import * as mongoose from 'mongoose';
import { statusEnum } from '../enum/status.enum';

export const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(statusEnum),
    default: statusEnum.pending,
  },
});
