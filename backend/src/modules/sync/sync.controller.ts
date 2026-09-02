import { Request, Response } from 'express';
import { prisma } from '../../index';

export const processSyncBatch = async (req: Request, res: Response) => {
  try {
    const { workerId, mutations } = req.body;
    const results = [];

    // 34. OFFLINE SYNC IDEMPOTENCY: Ensure operationIds are not processed twice
    for (const mutation of mutations) {
      const { operationId, entity, action, payload } = mutation;

      const existingOp = await prisma.syncOperation.findUnique({
        where: { id: operationId }
      });

      if (existingOp) {
        // Idempotent: already processed
        results.push({ operationId, status: 'ALREADY_SYNCED' });
        continue;
      }

      try {
        await prisma.$transaction(async (tx) => {
          // Dynamic handling based on entity (Assessment, Patient, etc)
          if (entity === 'ASSESSMENT' && action === 'CREATE') {
            await tx.assessment.create({ data: payload });
          }
          // ... handle other entity actions

          await tx.syncOperation.create({
            data: {
              id: operationId,
              userId: workerId,
              deviceId: mutation.deviceId || 'unknown',
              entity,
              entityId: payload.id || 'unknown',
              operation: action,
              payload,
              clientTimestamp: mutation.timestamp ? new Date(mutation.timestamp) : new Date(),
              status: 'SUCCESS'
            }
          });
        });
        results.push({ operationId, status: 'SUCCESS' });
      } catch (err: any) {
        // Handle conflicts or invalid data (e.g., patient doesn't exist)
        results.push({ operationId, status: 'CONFLICT', error: err.message });
      }
    }

    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
