import { Request, Response } from 'express';
import { prisma } from '../../index';

let cachedFacilities: any = null;
let facilitiesCacheTimestamp = 0;
const FACILITIES_CACHE_TTL_MS = 30000; // 30 seconds

// 17. FACILITY MODEL: expose operational capabilities
export const getFacilities = async (req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (cachedFacilities && now - facilitiesCacheTimestamp < FACILITIES_CACHE_TTL_MS) {
      return res.json(cachedFacilities);
    }

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

    cachedFacilities = facilities;
    facilitiesCacheTimestamp = now;

    res.json(facilities);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateFacilityAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, readinessScore } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Bad Request', message: 'Facility ID is required' });
    }

    const facility = await prisma.facility.findUnique({ where: { id } });
    if (!facility) {
      return res.status(404).json({ error: 'Not Found', message: 'Facility not found' });
    }

    const validStatuses = ['OPEN', 'CLOSED', 'OVERCAPACITY'];
    const cleanStatus = status ? String(status).toUpperCase().trim() : 'OPEN';
    if (!validStatuses.includes(cleanStatus)) {
      return res.status(400).json({ error: 'Bad Request', message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    let cleanScore: number | undefined = undefined;
    if (readinessScore !== undefined && readinessScore !== null) {
      const scoreNum = Number(readinessScore);
      if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
        return res.status(400).json({ error: 'Bad Request', message: 'Readiness score must be a number between 0 and 100' });
      }
      cleanScore = scoreNum;
    }

    const availability = await prisma.facilityAvailability.upsert({
      where: { facilityId: id },
      update: { status: cleanStatus, readinessScore: cleanScore },
      create: { facilityId: id, status: cleanStatus, readinessScore: cleanScore ?? 80 }
    });

    cachedFacilities = null;

    res.json(availability);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
