require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const Message = require('./models/Message');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('QuickGig API is running');
});

const gigRoutes = require('./routes/gigRoutes');
app.use('/api/gigs', gigRoutes);
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);
const messageRoutes = require('./routes/messageRoutes');
app.use('/api/messages', messageRoutes);

// HTTP server banaya jo Express app ko wrap karta hai
const server = http.createServer(app);

// Socket.io ko isi server se attach kiya
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

// Jab koi naya socket connect ho
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Room join karna — room ka naam gigId+workerId ka combination hoga
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Naya message aaye toh database mein save karo, phir room mein broadcast karo
  socket.on('send_message', async (data) => {
    try {
      const newMessage = new Message({
        roomId: data.roomId,
        gigId: data.gigId,
        senderId: data.senderId,
        senderName: data.senderName,
        text: data.text
      });
      await newMessage.save();
      socket.to(data.roomId).emit('receive_message', newMessage);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});