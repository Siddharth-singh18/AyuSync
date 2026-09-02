import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

const JWT_SECRET = process.env.JWT_SECRET || 'ayusync_super_secret';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    roles: string[];
    permissions: string[];
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        roles: {
          include: {
            permissions: true
          }
        }
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Unauthorized', message: 'User inactive or not found' });
    }

    const roles = user.roles.map((r: any) => r.name);
    const permissions = Array.from(new Set(user.roles.flatMap((r: any) => r.permissions.map((p: any) => p.action)))) as string[];

    req.user = {
      id: user.id,
      roles,
      permissions
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }
};
