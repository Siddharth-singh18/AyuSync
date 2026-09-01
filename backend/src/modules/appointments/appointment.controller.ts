import { Request, Response } from 'express';
import { prisma } from '../../index';

export const bookAppointment = async (req: Request, res: Response) => {
  try {
    const { patientId, facilityId, doctorId, scheduledAt } = req.body;

    // 20. APPOINTMENT ENGINE: booking, prevent double booking
    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId,
        scheduledAt: new Date(scheduledAt),
        status: { not: 'CANCELLED' }
      }
    });

    if (existing) {
      return res.status(409).json({ error: 'Conflict', message: 'Slot already booked' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        facilityId,
        doctorId,
        scheduledAt: new Date(scheduledAt),
        status: 'BOOKED'
      }
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
