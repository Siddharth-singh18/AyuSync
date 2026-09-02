import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

// Load environment variables (from .env file)
dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient();

// Initialize Express App
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    // Placeholder for your frontend URL to restrict Socket.io connections
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors({ origin: ['http://localhost:5175', 'http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

// ---------------------------------------------------------
// REST Endpoints
// ---------------------------------------------------------

import authRoutes from './modules/auth/auth.routes';
import patientRoutes from './modules/patients/patient.routes';
import assessmentRoutes from './modules/assessments/assessment.routes';
import facilityRoutes from './modules/facilities/facility.routes';

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/facilities', facilityRoutes);

// Health check and DB connection verification
app.get('/health', async (req, res) => {
  try {
    // Test the DB connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Sync endpoint placeholder (App -> Backend)
app.post('/api/sync', async (req, res) => {
  // Logic to process offline data from the Flutter app
  res.status(200).json({ message: 'Sync endpoint not implemented yet.' });
});

// ---------------------------------------------------------
// Socket.io Handlers
// ---------------------------------------------------------
io.on('connection', (socket) => {
  console.log(`New Doctor Dashboard client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Doctor Dashboard client disconnected: ${socket.id}`);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`AyuSync Backend is running on http://localhost:${PORT}`);
});

export { app, prisma, io };
