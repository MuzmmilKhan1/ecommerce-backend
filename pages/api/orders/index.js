import prisma from '../../../lib/prisma';
import { authMiddleware } from '../../../lib/auth';

export default authMiddleware(async function handler(req, res) {
  if (req.method === 'GET') {
    if (req.user.role === 'admin') {
      const orders = await prisma.order.findMany({
        include: {
          user: { select: { email: true } },
          items: { include: { product: true } },
        },
      });
      return res.status(200).json(orders);
    } else {
      const orders = await prisma.order.findMany({
        where: { userId: req.user.id },
        include: {
          user: { select: { email: true } },
          items: { include: { product: true } },
        },
      });
      return res.status(200).json(orders);
    }
  }

  if (req.method === 'POST') {
    const { items } = req.body;
    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid order items' });
    }
    // Calculate total amount and validate products
    let totalAmount = 0;
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: 'Invalid productId or quantity' });
      }
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.productId}` });
      }
      totalAmount += product.price * item.quantity;
    }
    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalAmount,
        status: 'pending',
        items: {
          create: items.map(async (item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: (await prisma.product.findUnique({ where: { id: item.productId } })).price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });
    return res.status(201).json(order);
  }

  return res.status(405).json({ error: 'Method not allowed' });
});