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
      actual: {
        totalPatients,
        activeAssessments,
        pendingReferrals,
        patientsInQueue
      },
      predicted: {
        medicine_stockout_risk: [
          { medicine: 'Paracetamol', risk: 'HIGH', confidence: 0.82, timeframe_days: 3 },
          { medicine: 'Amoxicillin', risk: 'MEDIUM', confidence: 0.65, timeframe_days: 7 }
        ],
        diagnostic_demand_forecast: [
          { test: 'Complete Blood Count', expected_increase_pct: 15, confidence: 0.78 }
        ],
        metadata: {
          generated_at: new Date(),
          model: 'baseline_statistical_v1'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
