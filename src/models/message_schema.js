import mongoose, { Schema, model } from 'mongoose';

const messageShema = new Schema({
  author: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  readAt: {
    type: String,
    default: '',
  },
}, {
  timestamps: {
    createdAt: 'sentAt',
  },
});

const Message = model('Message', messageShema);

export default Message;
