import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const bookingSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  ticketType: {
    type: String,
    default: 'VIP Arena Pass'
  },
  price: {
    type: Number,
    default: 450
  },
  bookingDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default model('Booking', bookingSchema);
