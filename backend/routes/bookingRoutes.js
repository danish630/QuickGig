const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Gig = require('../models/Gig');

// POST — worker applies to a gig
router.post('/', async (req, res) => {
  try {
    // Check karo — kya yeh professional already isi gig pe apply kar chuka hai?
    const existing = await Booking.findOne({
      gigId: req.body.gigId,
      professionalId: req.body.professionalId
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already applied to this gig' });
    }

    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET — all applicants for a specific gig (client checks this)
router.get('/gig/:gigId', async (req, res) => {
  try {
    const bookings = await Booking.find({ gigId: req.params.gigId });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET — all bookings/applications made by a specific professional
router.get('/professional/:professionalId', async (req, res) => {
  try {
    const bookings = await Booking.find({ professionalId: req.params.professionalId });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH — client approves one applicant, rejects the rest, gig becomes "booked"
router.patch('/:id/approve', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Approve this one
    booking.status = 'accepted';
    await booking.save();

    // Reject all other applicants for the same gig
    await Booking.updateMany(
      { gigId: booking.gigId, _id: { $ne: booking._id } },
      { status: 'rejected' }
    );

    // Mark the gig as booked
    await Gig.findByIdAndUpdate(booking.gigId, { status: 'booked' });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// DELETE — withdraw an application (only within 1 hour, only if still pending)
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Application not found' });

    if (booking.professionalId !== req.body.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot withdraw — application already processed' });
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (booking.createdAt < oneHourAgo) {
      return res.status(400).json({ message: 'Withdrawal window (1 hour) has expired' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application withdrawn' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;