import prisma from '../../../lib/prisma';
import { authMiddleware } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const products = await prisma.product.findMany();
    const productsWithBase64Images = products.map((product) => ({
      ...product,
      image: product.image ? Buffer.from(product.image).toString('base64') : null,
    }));
    return res.status(200).json(productsWithBase64Images);
  } else if (req.method === 'POST') {
    return authMiddleware(async (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const { name, description, price, image, rating, category, isNew } = req.body;
      const product = await prisma.product.create({
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
      return res.status(201).json({
        ...product,
        image: product.image ? Buffer.from(product.image).toString('base64') : null,
      });
    })(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}