import { Request, Response } from 'express';
import { prisma } from '../../index';

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const totalPatients = await prisma.patient.count();
    const activeAssessments = await prisma.assessment.count();
    // Use actual pending referral status if applicable
    const pendingReferrals = await prisma.referral.count({
      where: {
        status: { in: ['CREATED', 'SUBMITTED', 'ACCEPTED'] }
      }
    });
    const patientsInQueue = await prisma.queueEntry.count({
      where: {
        status: 'WAITING'
      }
    });

    res.json({
      totalPatients,
      activeAssessments,
      pendingReferrals,
      patientsInQueue
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
