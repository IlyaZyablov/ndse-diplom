import { Schema, model } from 'mongoose';

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
  user: {
    type: Object,
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
  timestamps: true,
});

const Advertisements = model('Advertisements', adsSchema);

export default Advertisements;
