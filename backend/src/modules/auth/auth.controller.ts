import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../index';

export const login = async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { phone },
      include: { roles: true }
    });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const primaryRole = user.roles.length > 0 ? user.roles[0].name : 'USER';

    const token = jwt.sign(
      { id: user.id, role: primaryRole, phone: user.phone },
      process.env.JWT_SECRET || 'ayusync_super_secret',
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, phone: user.phone, role: primaryRole } });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
