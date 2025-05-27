const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seed() {
  // Seed Products
  await prisma.product.createMany({
    data: [
      {
        id: 1,
        name: 'Sourdough Bread',
        description: 'Traditional sourdough bread made with our 100-year-old starter',
        price: 6.99,
        image: null, // Use null for ByteA? if no binary data
        rating: 4.8,
        category: 'Bread',
        isNew: true,
      },
      // ... other products
    ],
  });

  // Seed Categories
  await prisma.category.createMany({
    data: [
      {
        id: 1,
        title: 'Artisan Breads',
        description: 'Handcrafted sourdough, baguettes, and specialty breads',
        image: null, // Use null for ByteA?
      },
      // ... other categories
    ],
  });

  // Seed Blogs
  await prisma.blog.createMany({
    data: [
      {
        id: 1,
        title: 'The Art of Sourdough: A Baker\'s Guide',
        excerpt: 'Discover the secrets of making perfect sourdough bread at home.',
        image: null, // Use null for ByteA?
        category: 'Baking Tips',
        author: 'Sarah Johnson',
        date: 'Dec 15, 2023',
        readTime: '5 min read',
      },
      // ... other blogs
    ],
  });

  // Seed Features
  await prisma.feature.createMany({
    data: [
      {
        id: 1,
        title: 'Free Delivery',
        description: 'Enjoy free delivery on all orders over $30.',
        icon: 'LocalShippingOutlinedIcon',
      },
      // ... other features
    ],
  });

  // Seed Admin User
  const hashedPassword = await bcrypt.hash('sarmad123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@theredwoodfarms.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('Database seeded');
}

seed().then(() => prisma.$disconnect()).catch((error) => {
  console.error('Seed error:', error);
  prisma.$disconnect();
});