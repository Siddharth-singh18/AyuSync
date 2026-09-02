import { Request, Response } from 'express';
import { prisma } from '../../index';

const VALID_TRANSITIONS: Record<string, string[]> = {
  'CREATED': ['SUBMITTED', 'CANCELLED'],
  'SUBMITTED': ['ACCEPTED', 'REJECTED'],
  'ACCEPTED': ['SCHEDULED'],
  'SCHEDULED': ['PATIENT_ARRIVED', 'CANCELLED'],
  'PATIENT_ARRIVED': ['IN_CONSULTATION'],
  'IN_CONSULTATION': ['DIAGNOSTICS_PENDING', 'TREATMENT', 'COUNTER_REFERRED'],
  'DIAGNOSTICS_PENDING': ['TREATMENT', 'COUNTER_REFERRED'],
  'TREATMENT': ['COUNTER_REFERRED'],
  'COUNTER_REFERRED': ['FOLLOW_UP_REQUIRED', 'COMPLETED'],
  'FOLLOW_UP_REQUIRED': ['COMPLETED']
};

export const updateReferralStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newStatus, notes } = req.body;

    const referral = await prisma.referral.findUnique({ where: { id } });
    if (!referral) return res.status(404).json({ error: 'Referral not found' });

    const currentStatus = referral.status;
    
    // 24. REFERRAL STATE MACHINE: Reject invalid transitions
    if (!VALID_TRANSITIONS[currentStatus]?.includes(newStatus)) {
      return res.status(400).json({ error: 'Invalid Transition', message: `Cannot transition from ${currentStatus} to ${newStatus}` });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 24. Record every transition in ReferralEvent
      await tx.referralEvent.create({
        data: {
          referralId: id,
          statusFrom: currentStatus,
          statusTo: newStatus,
          notes
        }
      });

      const updatedRef = await tx.referral.update({
        where: { id },
        data: { status: newStatus },
        include: {
          patient: true,
          origin: true,
          destination: true,
          events: { orderBy: { createdAt: 'desc' } }
        }
      });

      return updatedRef;
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
