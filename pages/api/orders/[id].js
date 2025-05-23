import prisma from '../../../lib/prisma';
import { authMiddleware } from '../../../lib/auth';

export default authMiddleware(async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { user: { select: { email: true } }, items: true },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return res.status(200).json(order);
  }

  if (req.method === 'PUT') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { status } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'returned'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
    });
    return res.status(200).json(order);
  }

  return res.status(405).json({ error: 'Method not allowed' });
});