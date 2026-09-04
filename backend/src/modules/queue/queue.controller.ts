import { Request, Response } from 'express';
import { prisma } from '../../index';
import { broadcastQueueUpdate } from '../../events/socket';

// 21. QUEUE ENGINE: Explicit queue states
export const enqueuePatient = async (req: Request, res: Response) => {
  try {
    const { appointmentId, patientId, facilityId, doctorId, priority } = req.body;

    let finalApptId = appointmentId;

    // Create a walk-in appointment if only patientId is provided
    if (!finalApptId && patientId && facilityId) {
      const walkIn = await prisma.appointment.create({
        data: {
          patientId,
          facilityId,
          doctorId,
          scheduledAt: new Date(),
          status: 'BOOKED'
        }
      });
      finalApptId = walkIn.id;
    }

    if (!finalApptId) {
      return res.status(400).json({ error: 'Bad Request', message: 'appointmentId or patientId+facilityId is required' });
    }

    const queueEntry = await prisma.queueEntry.create({
      data: {
        appointmentId: finalApptId,
        doctorId,
        priority: priority ? parseInt(priority) : 0,
        status: 'WAITING'
      },
      include: {
        appointment: true
      }
    });

    if (queueEntry.appointment?.facilityId) {
      broadcastQueueUpdate(queueEntry.appointment.facilityId, doctorId, {
        action: 'ENQUEUE',
        entry: queueEntry
      });
    }

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

export const updateQueueStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const queueEntry = await prisma.queueEntry.findUnique({ where: { id } });
    if (!queueEntry) {
      return res.status(404).json({ error: 'Not Found', message: 'Queue entry not found' });
    }

    const currentStatus = queueEntry.status;

    // Define allowed transitions
    const VALID_QUEUE_TRANSITIONS: Record<string, string[]> = {
      'WAITING': ['IN_CONSULTATION', 'CANCELLED'],
      'PRIORITY': ['IN_CONSULTATION', 'CANCELLED'],
      'IN_CONSULTATION': ['COMPLETED']
    };

    const allowed = VALID_QUEUE_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid Transition', message: `Cannot transition from ${currentStatus} to ${status}` });
    }

    const updated = await prisma.queueEntry.update({
      where: { id },
      data: { status },
      include: { appointment: true }
    });

    if (updated.appointment?.facilityId) {
      broadcastQueueUpdate(updated.appointment.facilityId, updated.doctorId, {
        action: 'UPDATE_STATUS',
        entry: updated
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllQueue = async (req: Request, res: Response) => {
  try {
    const queue = await prisma.queueEntry.findMany({
      where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
      orderBy: [
        { priority: 'desc' },
        { arrivalTime: 'asc' }
      ],
      include: {
        appointment: {
          include: { patient: true }
        },
        doctor: {
          include: { user: true }
        }
      }
    });
    res.json(queue);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
