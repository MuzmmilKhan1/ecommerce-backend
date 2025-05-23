import prisma from '../../../lib/prisma';
import bcrypt from 'bcrypt';
import { generateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    return res.status(200).json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}
