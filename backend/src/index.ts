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

import { initSocket } from './events/socket';

// Initialize Socket.io
const io = initSocket(httpServer);

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
import referralRoutes from './modules/referrals/referral.routes';
import queueRoutes from './modules/queue/queue.routes';
import appointmentRoutes from './modules/appointments/appointment.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import syncRoutes from './modules/sync/sync.routes';
import { startJobs } from './jobs/caregap.job';

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/analytics', analyticsRoutes);

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

app.use('/api/sync', syncRoutes);

// ---------------------------------------------------------
// Socket.io Handlers (moved to socket.ts)
// ---------------------------------------------------------

// Start the server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`AyuSync Backend is running on http://localhost:${PORT}`);
  startJobs();
});

export { app, prisma, io };
