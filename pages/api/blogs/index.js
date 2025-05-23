import prisma from '../../../lib/prisma';
import { authMiddleware } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const blogs = await prisma.blog.findMany();
    const blogsWithBase64Images = blogs.map((blog) => ({
      ...blog,
      image: blog.image ? Buffer.from(blog.image).toString('base64') : null,
    }));
    return res.status(200).json(blogsWithBase64Images);
  }
  
  return authMiddleware(async (req,res) => {
  if (req.method === 'POST') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { title, excerpt, image, category, author, date, readTime } = req.body;
    const blog = await prisma.blog.create({
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
    return res.status(201).json({
      ...blog,
      image: blog.image ? Buffer.from(blog.image).toString('base64') : null,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
  })(req,res)
};