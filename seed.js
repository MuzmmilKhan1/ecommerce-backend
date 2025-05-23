const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function seed() {
  // Existing seed data (products, categories, blogs, features, admin user)
  await prisma.product.createMany({
    data: [
      {
        id: 1,
        name: 'Sourdough Bread',
        description: 'Traditional sourdough bread made with our 100-year-old starter',
        price: 6.99,
        image: await fs.readFile(path.join(__dirname, 'images/products/sourdough.jpg')).catch(() => null),
        rating: 4.8,
        category: 'Bread',
        isNew: true,
      },
      // ... other products
    ],
  });

  await prisma.category.createMany({
    data: [
      {
        id: 1,
        title: 'Artisan Breads',
        description: 'Handcrafted sourdough, baguettes, and specialty breads',
        image: await fs.readFile(path.join(__dirname, 'images/categories/artisan-breads.jpg')).catch(() => null),
      },
      // ... other categories
    ],
  });

  await prisma.blog.createMany({
    data: [
      {
        id: 1,
        title: 'The Art of Sourdough: A Baker\'s Guide',
        excerpt: 'Discover the secrets of making perfect sourdough bread at home with our comprehensive guide.',
        image: await fs.readFile(path.join(__dirname, 'images/blog/sourdough-guide.jpg')).catch(() => null),
        category: 'Baking Tips',
        author: 'Sarah Johnson',
        date: 'Dec 15, 2023',
        readTime: '5 min read',
      },
      // ... other blogs
    ],
  });

  await prisma.feature.createMany({
    data: [
      {
        id: 1,
        title: 'Free Delivery',
        description: 'Enjoy free delivery on all orders over $30. We ensure your treats arrive fresh and on time.',
        icon: 'LocalShippingOutlinedIcon',
      },
      // ... other features
    ],
  });

  const hashedPassword = await bcrypt.hash('sarmad123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@theredwoodfarms.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  // Add a regular user for testing orders
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: userPassword,
      role: 'user',
    },
  });

  // Seed sample order
  await prisma.order.create({
    data: {
      userId: user.id,
      totalAmount: 13.98,
      status: 'pending',
      items: {
        create: [
          {
            productId: 1, // Sourdough Bread
            quantity: 2,
            price: 6.99,
          },
        ],
      },
    },
  });

  console.log('Database seeded');
}

seed().then(() => prisma.$disconnect());