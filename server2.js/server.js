const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store room data
const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a room
  socket.on('join-room', (roomId, userId, userRole) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.userId = userId;
    socket.userRole = userRole;

    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        participants: new Map(),
        messages: []
      });
    }

    const room = rooms.get(roomId);
    room.participants.set(userId, { socketId: socket.id, userRole });

    // Notify others in the room
    socket.to(roomId).emit('user-connected', userId);

    // Send existing messages to the new user
    socket.emit('existing-messages', room.messages);

    console.log(`User ${userId} joined room ${roomId} as ${userRole}`);
  });

  // Handle chat messages
  socket.on('send-message', (message) => {
    const room = rooms.get(socket.roomId);
    if (room) {
      const newMessage = {
        id: uuidv4(),
        userId: socket.userId,
        userRole: socket.userRole,
        text: message,
        timestamp: new Date().toISOString()
      };
      room.messages.push(newMessage);
      io.to(socket.roomId).emit('receive-message', newMessage);
    }
  });

  // WebRTC signaling
  socket.on('offer', (offer, targetUserId) => {
    const room = rooms.get(socket.roomId);
    if (room && room.participants.has(targetUserId)) {
      const targetSocketId = room.participants.get(targetUserId).socketId;
      socket.to(targetSocketId).emit('offer', offer, socket.userId);
    }
  });

  socket.on('answer', (answer, targetUserId) => {
    const room = rooms.get(socket.roomId);
    if (room && room.participants.has(targetUserId)) {
      const targetSocketId = room.participants.get(targetUserId).socketId;
      socket.to(targetSocketId).emit('answer', answer, socket.userId);
    }
  });

  socket.on('ice-candidate', (candidate, targetUserId) => {
    const room = rooms.get(socket.roomId);
    if (room && room.participants.has(targetUserId)) {
      const targetSocketId = room.participants.get(targetUserId).socketId;
      socket.to(targetSocketId).emit('ice-candidate', candidate, socket.userId);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.roomId) {
      const room = rooms.get(socket.roomId);
      if (room) {
        room.participants.delete(socket.userId);
        socket.to(socket.roomId).emit('user-disconnected', socket.userId);
        
        // Clean up empty rooms
        if (room.participants.size === 0) {
          rooms.delete(socket.roomId);
        }
      }
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});