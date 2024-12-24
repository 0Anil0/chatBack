require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "https://chatbot123fdsfvscvsfdfafdf.netlify.app"
        ],
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Failed:', err));

// Message Schema
const messageSchema = new mongoose.Schema({
    sender: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Routes
app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
// Routes
app.get('/anil', async (req, res) => {
    try {
        console.log("checking")
        const messages = await Message.find().sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Socket.IO Real-time Events
io.on('connection', (socket) => {
  console.log('⚡ New client connected');

  socket.on('sendMessage', async ({ sender, message }) => {
    const newMessage = new Message({ sender, message });
    await newMessage.save();
    io.emit('receiveMessage', newMessage); // Broadcast message to all clients
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected');
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
