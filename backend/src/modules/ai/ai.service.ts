import axios from 'axios';
import { prisma } from '../../index';
import { broadcastTriageUpdate } from '../../events/socket';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// 40. EXPLAINABLE AI INTEGRATION (Phase 13 & 14)
export const analyzeAssessment = async (assessmentId: string, doctorId: string) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { symptoms: true }
    });

    if (!assessment) return;

    // Send to Python FastAPI AI service
    /*
    const response = await axios.post(`${AI_SERVICE_URL}/analyze`, {
      symptoms: assessment.symptoms,
      vitals: assessment.vitals
    });
    */
    
    // Mocking response for now until Python service is up
    const aiResponse = {
      urgencyScore: 8,
      recommendedAction: 'URGENT',
      explanation: 'High fever (102F) combined with severe cough over 5 days suggests possible lower respiratory tract infection requiring immediate evaluation.',
      confidence: 92,
      modelName: 'ayusync-triage-v1.2'
    };

    // 41. EXPLAINABLE TRIAGE DB RECORD
    const aiRecommendation = await prisma.aIRecommendation.create({
      data: {
        assessmentId,
        urgencyCategory: aiResponse.recommendedAction,
        reasons: [aiResponse.explanation],
        confidence: aiResponse.confidence
      }
    });

    // 42. REALTIME NOTIFICATION
    broadcastTriageUpdate(doctorId, {
      assessmentId,
      triage: aiRecommendation
    });

    return aiRecommendation;
  } catch (error) {
    console.error('AI Analysis failed:', error);
  }
};
