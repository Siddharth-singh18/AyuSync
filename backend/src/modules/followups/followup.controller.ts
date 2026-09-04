import { Request, Response } from 'express';
import { prisma } from '../../index';
import { createNotification } from '../notifications/notification.service';

export const createCounterReferral = async (req: Request, res: Response) => {
  try {
    const { referralId, outcome, treatment, instructions, requiresFollowUp, followUpDate, assignedWorkerId } = req.body;

    // 26. COUNTER-REFERRAL: Create structured workflow, and 27. FOLLOW-UP ENGINE
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create counter-referral
      const counter = await tx.counterReferral.create({
        data: {
          referralId,
          outcome,
          treatment,
          instructions,
          requiresFollowUp
        }
      });

      // 2. Mark referral as COUNTER_REFERRED
      await tx.referral.update({
        where: { id: referralId },
        data: { status: 'COUNTER_REFERRED' }
      });

      // 3. If follow-up required, create follow-up task for the ASHA worker
      if (requiresFollowUp && followUpDate) {
        const referral = await tx.referral.findUnique({ where: { id: referralId }});
        if (referral) {
          await tx.followUp.create({
            data: {
              patientId: referral.patientId,
              workerId: assignedWorkerId,
              dueDate: new Date(followUpDate),
              reason: `Follow-up required after counter-referral: ${outcome}`,
              status: 'PENDING'
            }
          });
          // Try to get userId for the worker to send a notification
          if (assignedWorkerId) {
            const worker = await tx.worker.findUnique({ where: { id: assignedWorkerId }});
            if (worker) {
              await createNotification(worker.userId, 'FOLLOW_UP', `You have been assigned a new follow-up for patient ${referral.patientId}`);
            }
          }
        }
      }

      return counter;
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
