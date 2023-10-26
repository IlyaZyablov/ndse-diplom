import mongoose, { Schema, model } from 'mongoose';

const adsSchema = new Schema({
  shortText: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  images: {
    type: Array,
    default: [],
  },
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  tags: {
    type: Array,
    default: [],
  },
  isDeleted: {
    type: Boolean,
    required: true,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

const Advertisements = model('Advertisements', adsSchema);

export default Advertisements;
