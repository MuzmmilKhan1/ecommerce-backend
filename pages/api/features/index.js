import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const features = await prisma.feature.findMany();
    return res.status(200).json(features);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};