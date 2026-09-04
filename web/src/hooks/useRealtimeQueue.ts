import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export function useRealtimeQueue(doctorId: string) {
  const [queue, setQueue] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // 26. REALTIME UX: Connect to backend Socket.IO
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('ayusync_token')
      }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      // Join doctor's specific room
      newSocket.emit('join:doctor', doctorId);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for queue updates
    newSocket.on('queue.updated', (payload) => {
      const queueEntry = payload.entry || payload; // fallback just in case
      setQueue(prev => {
        // Upsert logic for realtime queue
        const exists = prev.find(q => q.id === queueEntry.id);
        if (exists) {
          return prev.map(q => q.id === queueEntry.id ? queueEntry : q);
        }
        // Auto-sort could be done here based on priority
        return [...prev, queueEntry].sort((a, b) => b.priority - a.priority);
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [doctorId]);

  return { queue, isConnected, socket };
}
