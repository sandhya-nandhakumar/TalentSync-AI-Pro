require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./services/db');
const authRoutes = require('./routes/auth.routes');
const jobRoutes = require('./routes/job.routes');
const applicationRoutes = require('./routes/application.routes');
const interviewRoutes = require('./routes/interview.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'TalentSync AI API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Socket.io Setup
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    socket.on('candidate-waiting', ({ roomId, candidateName }) => {
        socket.to(roomId).emit('candidate-joined-waiting-room', { candidateName, socketId: socket.id });
    });

    socket.on('approve-entry', ({ roomId, socketId }) => {
        io.to(socketId).emit('entry-approved');
    });

    socket.on('reject-entry', ({ roomId, socketId }) => {
        io.to(socketId).emit('entry-rejected');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Prevent process from exiting (Keep-alive)
setInterval(() => {
    // Keep event loop active
}, 1000 * 60 * 60);

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
