import { Schema, model } from 'mongoose';

const usersSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  contactPhone: {
    type: String,
    default: '',
  },
});

const Users = model('Users', usersSchema);

export default Users;
