import { Server, Socket } from 'socket.io';

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Auth could be done in middleware, but for now we accept token on connect
    socket.on('join:doctor', (doctorId: string) => {
      // 30. REALTIME ORCHESTRATION: Subscribe doctors to their specific queue room
      socket.join(`doctor_${doctorId}`);
      console.log(`[Socket] Doctor ${doctorId} joined their room.`);
    });

    socket.on('join:facility', (facilityId: string) => {
      // Allow facility admins to monitor entire facility queue
      socket.join(`facility_${facilityId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Helper for broadcasting triage updates directly
export const broadcastTriageUpdate = (doctorId: string, payload: any) => {
  getIO().to(`doctor_${doctorId}`).emit('queue.updated', payload);
};
