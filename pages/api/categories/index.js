import prisma from '../../../lib/prisma';
import { authMiddleware } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const categories = await prisma.category.findMany();
    const categoriesWithBase64Images = categories.map((category) => ({
      ...category,
      image: category.image ? Buffer.from(category.image).toString('base64') : null,
    }));
    return res.status(200).json(categoriesWithBase64Images);
  }

  // Apply authMiddleware for POST
  return authMiddleware(async (req, res) => {
    if (req.method === 'POST') {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      console.log("Is Admin", " Is Post Request")
      const { title, description, image } = req.body;
      const category = await prisma.category.create({
        data: {
          title,
          description,
          image: image ? Buffer.from(image, 'base64') : null,
        },
      });
      return res.status(201).json({
        ...category,
        image: category.image ? Buffer.from(category.image).toString('base64') : null,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  })(req, res);
}