import express from 'express';
import Booking from '../models/Booking.js';
import { authenticateToken } from './authRoutes.js';

const router = express.Router();

// Mock array fallback
const mockBookingsDb = [];

// Create Booking
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { address, latitude, longitude, ticketType, price } = req.body;

    if (!address || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Missing booking parameters (address, latitude, longitude).' });
    }

    const bookingPayload = {
      userId: req.user.id,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      ticketType: ticketType || 'VIP Arena Pass',
      price: price ? parseFloat(price) : 450,
      bookingDate: new Date()
    };

    // MOCK DB FALLBACK
    if (process.env.USE_MOCK_DB === 'true') {
      const mockBooking = {
        _id: 'mock-booking-' + Math.random().toString(36).substring(2, 9),
        ...bookingPayload
      };
      mockBookingsDb.push(mockBooking);
      return res.status(201).json({
        message: 'Ticket booked successfully (MOCK DB MODE)',
        booking: mockBooking
      });
    }

    // MONGOOSE DB FLOW
    const newBooking = new Booking(bookingPayload);
    await newBooking.save();

    res.status(201).json({
      message: 'Ticket booked successfully',
      booking: newBooking
    });
  } catch (err) {
    res.status(500).json({ message: 'Error processing ticket booking', error: err.message });
  }
});

// Get User Bookings
router.get('/', authenticateToken, async (req, res) => {
  try {
    // MOCK DB FALLBACK
    if (process.env.USE_MOCK_DB === 'true') {
      const userBookings = mockBookingsDb.filter(b => b.userId === req.user.id);
      return res.status(200).json(userBookings);
    }

    // MONGOOSE DB FLOW
    const bookings = await Booking.find({ userId: req.user.id }).sort({ bookingDate: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving bookings list', error: err.message });
  }
});

export default router;
