import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../index';

export const login = async (req: Request, res: Response) => {
  try {
    let { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Bad Request', message: 'Phone and password are required' });
    }

    const cleanPhone = String(phone).trim().replace(/[\s-]/g, '');
    const phoneVariants = [cleanPhone];
    if (cleanPhone.length === 10 && !cleanPhone.startsWith('+')) {
      phoneVariants.push('+91' + cleanPhone);
    } else if (cleanPhone.startsWith('+91')) {
      phoneVariants.push(cleanPhone.slice(3));
    } else if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
      phoneVariants.push('+' + cleanPhone);
      phoneVariants.push(cleanPhone.slice(2));
    }

    const user = await prisma.user.findFirst({
      where: { phone: { in: phoneVariants } },
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

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: { select: { id: true, phone: true } }
      }
    });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
