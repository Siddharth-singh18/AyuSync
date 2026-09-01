import { Request, Response } from 'express';
import { prisma } from '../../index';

export const resolveSyncConflict = async (req: Request, res: Response) => {
  try {
    const { operationId, resolutionStrategy, resolvedPayload } = req.body;
    // resolutionStrategy: 'KEEP_SERVER', 'OVERWRITE_SERVER', 'MERGE'

    // 37. CONFLICT RESOLUTION: Handle logical collisions
    const operation = await prisma.syncOperation.findUnique({
      where: { id: operationId }
    });

    if (!operation) {
      return res.status(404).json({ error: 'Operation not found' });
    }

    await prisma.$transaction(async (tx) => {
      if (resolutionStrategy === 'OVERWRITE_SERVER' || resolutionStrategy === 'MERGE') {
        // Apply the resolved payload
        if (operation.entity === 'PATIENT' && operation.action === 'UPDATE') {
          const payloadObj = typeof resolvedPayload === 'string' ? JSON.parse(resolvedPayload) : resolvedPayload;
          await tx.patient.update({
            where: { id: payloadObj.id },
            data: payloadObj.data
          });
        }
      }

      // Mark the conflict as resolved
      await tx.syncOperation.update({
        where: { id: operationId },
        data: { status: 'RESOLVED' }
      });
    });

    res.json({ message: 'Conflict resolved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
