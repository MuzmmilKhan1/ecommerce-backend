import prisma from '../../../../lib/prisma';
import { authMiddleware } from '../../../../lib/auth';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const blog = await prisma.blog.findUnique({ where: { id: parseInt(id) } });
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    return res.status(200).json({
      ...blog,
      image: blog.image ? Buffer.from(blog.image).toString('base64') : null,
    });
  }

  return authMiddleware(async (req,res) => {
  if (req.method === 'PUT') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { title, excerpt, image, category, author, date, readTime } = req.body;
    const blog = await prisma.blog.update({
      where: { id: parseInt(id) },
      data: {
        title,
        excerpt,
        image: image ? Buffer.from(image, 'base64') : null,
        category,
        author,
        date,
        readTime,
      },
    });
    return res.status(200).json({
      ...blog,
      image: blog.image ? Buffer.from(blog.image).toString('base64') : null,
    });
  }

  if (req.method === 'DELETE') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma.blog.delete({ where: { id: parseInt(id) } });
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
  })(req,res)
};