import { Schema, model } from 'mongoose';

const chatShema = new Schema({
  users: {
    type: Array,
    required: true,
  },
  messages: {
    type: Array,
    default: [],
  },
}, {
  timestamps: true,
});

const Chat = model('Chat', chatShema);

export default Chat;
