import { Request, Response } from 'express';
import { prisma } from '../../index';

// 17. FACILITY MODEL: expose operational capabilities
export const getFacilities = async (req: Request, res: Response) => {
  try {
    const facilities = await prisma.facility.findMany({
      include: {
        services: true,
        capacities: true,
        availability: true,
        doctors: {
          include: {
            doctor: {
              include: {
                specialist: true,
                user: { select: { id: true, email: true } }
              }
            }
          }
        }
      }
    });
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateFacilityAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, readinessScore } = req.body;

    const availability = await prisma.facilityAvailability.upsert({
      where: { facilityId: id },
      update: { status, readinessScore },
      create: { facilityId: id, status, readinessScore }
    });

    res.json(availability);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
