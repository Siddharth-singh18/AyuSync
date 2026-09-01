import { Request, Response } from 'express';
import { prisma } from '../../index';

// 10. PATIENT RECORD: creation, search, profile, history, timeline
// 11. ENCOUNTERS: Create explicit encounters

export const createPatient = async (req: Request, res: Response) => {
  try {
    const { name, dob, age, gender, village, phone, abhaId } = req.body;
    
    // 6. PATIENT IDENTITY: Prevent duplicate patients.
    if (abhaId) {
      const existing = await prisma.patientIdentifier.findUnique({
        where: { value: abhaId }
      });
      if (existing) {
        return res.status(409).json({ error: 'Conflict', message: 'Patient with this ABHA ID already exists', candidate: existing.patientId });
      }
    }

    const patient = await prisma.patient.create({
      data: {
        name,
        dob: dob ? new Date(dob) : null,
        age,
        gender,
        village,
        phone,
        identifiers: abhaId ? {
          create: {
            type: 'ABHA',
            value: abhaId
          }
        } : undefined
      }
    });

    res.status(201).json(patient);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const searchPatients = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { name: { contains: String(query), mode: 'insensitive' } },
          { phone: { contains: String(query) } },
          { identifiers: { some: { value: String(query) } } }
        ]
      },
      take: 20
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getPatientTimeline = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Fetch longitudinal record
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        encounters: {
          include: {
            assessments: { include: { symptoms: true, aiRecommendations: true } },
            vitals: true,
            prescriptions: true,
            clinicalObs: true
          },
          orderBy: { start: 'desc' }
        },
        referrals: { orderBy: { createdAt: 'desc' } },
        conditions: { where: { status: 'ACTIVE' } }
      }
    });

    if (!patient) return res.status(404).json({ error: 'Not found' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createEncounter = async (req: Request, res: Response) => {
  try {
    const { patientId, facilityId, type, reason } = req.body;
    
    const encounter = await prisma.encounter.create({
      data: {
        patientId,
        facilityId,
        type,
        reason,
        status: 'IN_PROGRESS'
      }
    });
    
    res.status(201).json(encounter);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
