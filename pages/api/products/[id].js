import prisma from '../../../lib/prisma';
import { authMiddleware } from '../../../lib/auth';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // Public access, no authentication required
    const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.status(200).json({
      ...product,
      image: product.image ? Buffer.from(product.image).toString('base64') : null,
    });
  }

  // Apply authMiddleware for PUT and DELETE
  return authMiddleware(async (req, res) => {
    if (req.method === 'PUT') {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const { name, description, price, image, rating, category, isNew } = req.body;
      const product = await prisma.product.update({
        where: { id: parseInt(id) },
        data: {
          name,
          description,
          price,
          image: image ? Buffer.from(image, 'base64') : null,
          rating,
          category,
          isNew,
        },
      });
      return res.status(200).json({
        ...product,
        image: product.image ? Buffer.from(product.image).toString('base64') : null,
      });
    }

    if (req.method === 'DELETE') {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      await prisma.product.delete({ where: { id: parseInt(id) } });
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  })(req, res);
}