const express = require('express');
const router = express.Router();
const Gig = require('../models/Gig');

// GET all gigs
router.get('/', async (req, res) => {
  try {
    const gigs = await Gig.find();
    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new gig
router.post('/', async (req, res) => {
  try {
    const newGig = new Gig(req.body);
    const savedGig = await newGig.save();
    res.status(201).json(savedGig);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET a single gig by ID
router.get('/:id', async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    res.json(gig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// DELETE — remove a gig (only by the person who posted it)
router.delete('/:id', async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });

    if (gig.postedBy !== req.body.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this gig' });
    }

    await Gig.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gig deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// PATCH — mark a gig as completed (only by the person who posted it)
router.patch('/:id/complete', async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });

    if (gig.postedBy !== req.body.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    gig.status = 'completed';
    await gig.save();

    res.json(gig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;