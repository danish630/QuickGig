const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// POST — submit a review
router.post('/', async (req, res) => {
  try {
    const existing = await Review.findOne({
      gigId: req.body.gigId,
      reviewerId: req.body.reviewerId
    });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this gig' });
    }

    const newReview = new Review(req.body);
    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET — average rating + review count for a user
router.get('/user/:userId/average', async (req, res) => {
  try {
    const reviews = await Review.find({ revieweeId: req.params.userId });

    if (reviews.length === 0) {
      return res.json({ average: null, count: 0 });
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = total / reviews.length;

    res.json({ average: average.toFixed(1), count: reviews.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET — reviews left BY a user (to check what they've already reviewed)
router.get('/by/:reviewerId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewerId: req.params.reviewerId });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;