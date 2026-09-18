const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// GET — saare messages ek specific room ke liye
router.get('/:roomId', async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;