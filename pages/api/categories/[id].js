import prisma from '../../../lib/prisma';
import { authMiddleware } from '../../../lib/auth';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const category = await prisma.category.findUnique({ where: { id: parseInt(id) } });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    return res.status(200).json({
      ...category,
      image: category.image ? Buffer.from(category.image).toString('base64') : null,
    });
  }

  
  return authMiddleware(async (req,res) => {
  if (req.method === 'PUT') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { title, description, image } = req.body;
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        image: image ? Buffer.from(image, 'base64') : null,
      },
    });
    return res.status(200).json({
      ...category,
      image: category.image ? Buffer.from(category.image).toString('base64') : null,
    });
  }

  if (req.method === 'DELETE') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma.category.delete({ where: { id: parseInt(id) } });
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
  })(req,res)
};