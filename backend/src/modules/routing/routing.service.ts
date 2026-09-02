import { prisma } from '../../index';

// 43. INTELLIGENT ROUTING ENGINE
export const getOptimalFacilities = async (patientLat: number, patientLon: number, requiredSpecialty?: string) => {
  try {
    // 1. Fetch available facilities
    const facilities = await prisma.facility.findMany({
      include: {
        services: true,
        availability: true
      }
    });

    // 2. Score them based on: Load (Queue length), Readiness, Distance (Mocked here), Specialty
    const scored = facilities.map(f => {
      let score = 100;
      
      // Load penalty
      const queueLength = 0; // Mocked for now since queue is not on Facility
      score -= (queueLength * 5); // Reduce score for high load

      // Readiness factor
      if (f.availability?.readinessScore) {
        score += (f.availability.readinessScore - 50); // Boost or penalize based on ops readiness
      }

      // Hard filter for specialty
      let hasSpecialty = true;
      if (requiredSpecialty) {
        hasSpecialty = f.services.some((s: any) => s.service.toLowerCase().includes(requiredSpecialty.toLowerCase()));
      }

      return {
        facilityId: f.id,
        name: f.name,
        type: f.type,
        score,
        queueLength,
        isEligible: hasSpecialty && (f.availability?.status === 'ACTIVE' || !f.availability)
      };
    });

    // Sort descending by score
    return scored.filter(s => s.isEligible).sort((a, b) => b.score - a.score);

  } catch (error) {
    console.error('Routing Engine Error:', error);
    return [];
  }
};
