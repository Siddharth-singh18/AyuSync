import { Request, Response } from 'express';
import { prisma } from '../../index';

// 21. QUEUE ENGINE: Explicit queue states
export const enqueuePatient = async (req: Request, res: Response) => {
  try {
    const { appointmentId, doctorId, priority } = req.body;

    const queueEntry = await prisma.queueEntry.create({
      data: {
        appointmentId,
        doctorId,
        priority: priority || 0,
        status: 'WAITING'
      }
    });

    // We would emit a realtime event here
    // io.emit('queue.updated', queueEntry);

    res.status(201).json(queueEntry);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getQueueForDoctor = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const queue = await prisma.queueEntry.findMany({
      where: { doctorId, status: { notIn: ['COMPLETED', 'CANCELLED'] } },
      orderBy: [
        { priority: 'desc' },
        { arrivalTime: 'asc' }
      ],
      include: {
        appointment: {
          include: { patient: true }
        }
      }
    });
    res.json(queue);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
