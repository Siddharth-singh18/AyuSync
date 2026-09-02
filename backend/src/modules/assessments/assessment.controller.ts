import { Request, Response } from 'express';
import { prisma } from '../../index';
import { analyzeAssessment } from '../ai/ai.service';



export const createAssessment = async (req: Request, res: Response) => {
  try {
    const { patientId, encounterId, symptoms, vitals, provenance } = req.body;

    // 12. ASSESSMENT: Capture symptoms, duration, severity, vitals, history. Store provenance.
    const assessment = await prisma.assessment.create({
      data: {
        patientId,
        encounterId,
        provenance: provenance || 'WORKER_RECORDED',
        symptoms: {
          create: symptoms.map((s: any) => ({
            name: s.name,
            duration: s.duration,
            severity: s.severity
          }))
        }
      },
      include: { symptoms: true }
    });

    // 13. VITALS: structured vitals
    if (vitals && vitals.length > 0 && encounterId) {
      await prisma.vital.createMany({
        data: vitals.map((v: any) => ({
          encounterId,
          type: v.type, // BP, HR, TEMP, SPO2
          value: v.value,
          unit: v.unit
        }))
      });
    }

    // Trigger Triage Fallback/AI Generation asynchronously (or await it)
    if (assessment.id) {
      // In a real production system, this could be sent to a queue
      await analyzeAssessment(assessment.id, 'doc-1'); // Currently hardcoding doctorId to ensure broadcast runs if needed, or pass from req
    }

    // Refetch the assessment to include the AI Recommendations before returning
    const finalAssessment = await prisma.assessment.findUnique({
      where: { id: assessment.id },
      include: { symptoms: true, aiRecommendations: true }
    });

    res.status(201).json(finalAssessment);
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAssessmentsByPatient = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const assessments = await prisma.assessment.findMany({
      where: { patientId },
      include: { 
        symptoms: true,
        aiRecommendations: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
