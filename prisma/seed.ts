// Load environment variables first
import 'dotenv/config';

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set in .env file');
  console.error('Please ensure your .env file contains:');
  console.error('DATABASE_URL="postgresql://..."');
  process.exit(1);
}

import { PrismaClient } from '../lib/prisma-generated/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const adapterFactory = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({
  adapter: adapterFactory,
});
import { UserRole } from '../lib/prisma-types';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@enchipai.com' },
    update: {},
    create: {
      email: 'admin@enchipai.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create sample guest user
  const guestPassword = await bcrypt.hash('guest123', 12);
  const guest = await prisma.user.upsert({
    where: { email: 'guest@example.com' },
    update: {},
    create: {
      email: 'guest@example.com',
      name: 'Sample Guest',
      password: guestPassword,
      role: UserRole.GUEST,
      emailVerified: new Date(),
    },
  });
  console.log('✅ Created guest user:', guest.email);

  // Create tents - Named after African wildlife (real Enchipai tents)
  const tents = [
    {
      name: 'Ndovu Tent',
      slug: 'ndovu-tent',
      tagline: 'The Elephant — Expansive & Luxurious',
      description: 'Named after the mighty elephant, the Ndovu Tent is expansive and luxurious. Enjoy sweeping views of the Mara from your private viewing deck, with king-size beds dressed in fine linen and an en-suite bathroom.',
      image: '/images/luxury-tent.jpg',
      price: 396,
      size: '55 sqm',
      bed: 'King Bed',
      guests: 2,
      rating: 4.9,
      reviews: 48,
      amenities: ['En-suite Bathroom', 'Private Viewing Deck', 'King-size Bed', 'Fine Linen', 'Solar Power', 'Mini Bar'],
      featured: true,
      displayOrder: 1,
    },
    {
      name: 'Chui Tent',
      slug: 'chui-tent',
      tagline: 'The Leopard — Secluded & Tranquil',
      description: 'Named after the elusive leopard, the Chui Tent offers seclusion and tranquility with panoramic views of the savannah. Nestled under the indigenous canopy, this tent is perfect for those seeking peace and stunning vistas.',
      image: '/images/tent-escarpment.jpg',
      price: 396,
      size: '55 sqm',
      bed: 'King Bed',
      guests: 2,
      rating: 4.8,
      reviews: 36,
      amenities: ['En-suite Bathroom', 'Panoramic Views', 'Private Viewing Deck', 'King-size Bed', 'Fine Linen', 'Binoculars'],
      featured: true,
      displayOrder: 2,
    },
    {
      name: 'Kifaru Tent',
      slug: 'kifaru-tent',
      tagline: 'The Rhino — Intimate & Comfortable',
      description: 'Named after the rhinoceros, the Kifaru Tent offers intimate comfort with views of roaming wildlife. Thoughtfully designed with both contemporary and local rustic touches for the perfect balance of luxury and authenticity.',
      image: '/images/tent-honeymoon.jpg',
      price: 396,
      size: '55 sqm',
      bed: 'King Bed',
      guests: 2,
      rating: 4.9,
      reviews: 29,
      amenities: ['En-suite Bathroom', 'Private Viewing Deck', 'King-size Bed', 'Fine Linen', 'Writing Desk', 'Turndown Service'],
      featured: true,
      displayOrder: 3,
    },
    {
      name: 'Simba Tent',
      slug: 'simba-tent',
      tagline: 'The Lion — Spacious & Romantic',
      description: 'Named after the king of the jungle, the Simba Tent is spacious, romantic, and perfect for couples. With a private deck overlooking the Mara plains, it offers a regal safari experience under the African stars.',
      image: '/images/tent-sunset.jpg',
      price: 396,
      size: '55 sqm',
      bed: 'King Bed',
      guests: 2,
      rating: 5.0,
      reviews: 41,
      amenities: ['En-suite Bathroom', 'Private Viewing Deck', 'King-size Bed', 'Fine Linen', 'Champagne Service', 'Sundowner Kit'],
      featured: true,
      displayOrder: 4,
    },
    {
      name: 'Twiga Tent',
      slug: 'twiga-tent',
      tagline: 'The Giraffe — Family Suite',
      description: 'Named after the graceful giraffe, the Twiga Tent is a light-filled family tent with a generous layout perfect for groups. Spacious enough to accommodate the whole family with interconnecting areas and flexible bedding.',
      image: '/images/tent-mara.jpg',
      price: 1426,
      size: '85 sqm',
      bed: 'King + Twin Beds',
      guests: 4,
      rating: 4.8,
      reviews: 22,
      amenities: ['En-suite Bathroom', 'Private Viewing Deck', 'Family Layout', 'Interconnecting Rooms', 'Junior Ranger Kit', 'Board Games'],
      featured: true,
      displayOrder: 5,
    },
    {
      name: 'Kiboko Tent',
      slug: 'kiboko-tent',
      tagline: 'The Hippo — Family Retreat',
      description: 'Named after the hippopotamus, the Kiboko Tent sleeps 4+ guests and features a large deck ideal for families. The most spacious tent at Enchipai, offering generous living space and premium comfort for the whole family.',
      image: '/images/tent-mara.jpg',
      price: 1584,
      size: '95 sqm',
      bed: 'King + Twin Beds',
      guests: 5,
      rating: 4.9,
      reviews: 18,
      amenities: ['En-suite Bathroom', 'Large Private Deck', 'Family Layout', 'Interconnecting Rooms', 'Junior Ranger Kit', 'Butler Service'],
      featured: true,
      displayOrder: 6,
    },
    {
      name: 'Nyati Tent',
      slug: 'nyati-tent',
      tagline: 'The Buffalo — Sturdy & Stylish',
      description: 'Named after the buffalo, the Nyati Tent is sturdy, stylish, and ideal for adventure seekers. A fantastic option that delivers the full Enchipai experience with all the essential comforts at an accessible rate.',
      image: '/images/luxury-tent.jpg',
      price: 356,
      size: '50 sqm',
      bed: 'King Bed',
      guests: 2,
      rating: 4.7,
      reviews: 32,
      amenities: ['En-suite Bathroom', 'Private Viewing Deck', 'King-size Bed', 'Fine Linen', 'Solar Power', 'Writing Desk'],
      featured: true,
      displayOrder: 7,
    },
  ];

  for (const tentData of tents) {
    const tent = await prisma.tent.upsert({
      where: { slug: tentData.slug },
      update: {},
      create: tentData,
    });
    console.log(`✅ Created tent: ${tent.name}`);
  }

  // Create sample blog posts
  const blogPosts = [
    {
      slug: 'witnessing-the-great-migration',
      title: 'Witnessing the Great Migration: A Once-in-a-Lifetime Experience',
      excerpt: 'Every year, over two million wildebeest, zebras, and gazelles traverse the Serengeti-Mara ecosystem in search of greener pastures.',
      content: '## The Greatest Show on Earth\n\nEvery year, between July and October, the Masai Mara becomes the stage for one of nature\'s most spectacular events - the Great Migration.',
      image: '/images/blog-migration.jpg',
      category: 'wildlife',
      readTime: '5 min read',
      featured: true,
      status: 'PUBLISHED' as const,
      authorName: 'Enchipai Team',
      authorRole: 'Camp Staff',
      tags: ['Migration', 'Wildlife', 'Safari'],
      publishedAt: new Date(),
    },
    {
      slug: 'the-big-five-safari',
      title: 'The Big Five: Tracking Africa\'s Most Iconic Animals',
      excerpt: 'Discover the stories behind the Big Five and where to find them in the Masai Mara.',
      content: '## The Big Five\n\nThe term "Big Five" originally referred to the five most difficult animals to hunt on foot.',
      image: '/images/blog-bigfive.jpg',
      category: 'wildlife',
      readTime: '7 min read',
      featured: true,
      status: 'PUBLISHED' as const,
      authorName: 'Enchipai Team',
      authorRole: 'Camp Staff',
      tags: ['Big Five', 'Wildlife', 'Conservation'],
      publishedAt: new Date(),
    },
  ];

  for (const postData of blogPosts) {
    const post = await prisma.blogPost.upsert({
      where: { slug: postData.slug },
      update: {},
      create: postData,
    });
    console.log(`✅ Created blog post: ${post.title}`);
  }

  // Create experiences
  const experiences = [
    {
      name: 'Morning Game Drive',
      slug: 'morning-game-drive',
      description: 'Early morning safari to spot predators and witness the savannah come alive',
      image: '/images/wildlife.jpg',
      price: 150,
      duration: '3-4 hours',
      capacity: 6,
      available: true,
    },
    {
      name: 'Sunset Game Drive',
      slug: 'sunset-game-drive',
      description: 'Evening safari with stunning sunset views over the Mara',
      image: '/images/blog-sunrise.jpg',
      price: 150,
      duration: '3 hours',
      capacity: 6,
      available: true,
    },
    {
      name: 'Bush Dinner Experience',
      slug: 'bush-dinner-experience',
      description: 'Romantic candlelit dinner under the African stars',
      image: '/images/dining.jpg',
      price: 200,
      duration: '3 hours',
      capacity: 12,
      available: true,
    },
    {
      name: 'Night Game Drive',
      slug: 'night-game-drive',
      description: 'Spotlight safari to discover nocturnal wildlife',
      image: '/images/blog-leopard.jpg',
      price: 120,
      duration: '2 hours',
      capacity: 6,
      available: true,
    },
    {
      name: 'Maasai Village Visit',
      slug: 'maasai-village-visit',
      description: 'Cultural immersion with local Maasai community',
      image: '/images/blog-maasai.jpg',
      price: 80,
      duration: '2-3 hours',
      capacity: 10,
      available: true,
    },
    {
      name: 'Photography Safari',
      slug: 'photography-safari',
      description: 'Specialized game drive with photography guide and equipment',
      image: '/images/blog-migration.jpg',
      price: 250,
      duration: '4-5 hours',
      capacity: 4,
      available: true,
    },
  ];

  for (const experienceData of experiences) {
    const experience = await prisma.experience.upsert({
      where: { slug: experienceData.slug },
      update: {},
      create: experienceData,
    });
    console.log(`✅ Created experience: ${experience.name}`);
  }

  // Create wildlife sightings
  const wildlifeSightings = [
    {
      species: 'Lion',
      location: 'Olare Orok Conservancy',
      description: 'Pride of 8 lions spotted near the camp, including 2 cubs',
      image: '/images/wildlife.jpg',
      date: new Date(),
      guideName: 'Joseph Mutua',
    },
    {
      species: 'Elephant',
      location: 'Mara River',
      description: 'Large herd of elephants crossing the river',
      image: '/images/blog-migration.jpg',
      date: new Date(Date.now() - 86400000), // Yesterday
      guideName: 'Sarah Wanjiku',
    },
    {
      species: 'Leopard',
      location: 'Masai Mara Reserve',
      description: 'Male leopard spotted in a tree with recent kill',
      image: '/images/blog-leopard.jpg',
      date: new Date(Date.now() - 172800000), // 2 days ago
      guideName: 'David Kipchoge',
    },
    {
      species: 'Cheetah',
      location: 'Olare Orok Conservancy',
      description: 'Cheetah mother with 3 cubs hunting',
      image: '/images/wildlife.jpg',
      date: new Date(Date.now() - 259200000), // 3 days ago
      guideName: 'Joseph Mutua',
    },
  ];

  for (const sightingData of wildlifeSightings) {
    const sighting = await prisma.wildlifeSighting.create({
      data: sightingData,
    });
    console.log(`✅ Created wildlife sighting: ${sighting.species}`);
  }

  // Create transfers
  const transfers = [
    {
      type: 'AIRPORT_PICKUP',
      from: 'Jomo Kenyatta International Airport',
      to: 'Enchipai Mara Camp',
      date: new Date(Date.now() + 86400000), // Tomorrow
      time: '10:00',
      vehicle: 'Land Cruiser #1',
      driver: 'Joseph Mutua',
      guests: 'John Doe, Jane Doe',
      status: 'SCHEDULED',
      notes: 'Flight EK 721 arriving at 9:30 AM',
    },
    {
      type: 'AIRPORT_DROPOFF',
      from: 'Enchipai Mara Camp',
      to: 'Jomo Kenyatta International Airport',
      date: new Date(Date.now() + 172800000), // 2 days from now
      time: '14:00',
      vehicle: 'Land Cruiser #2',
      driver: 'David Kipchoge',
      guests: 'Alice Smith, Bob Smith',
      status: 'SCHEDULED',
      notes: 'Flight EK 722 departing at 16:30 PM',
    },
    {
      type: 'GAME_DRIVE',
      from: 'Enchipai Mara Camp',
      to: 'Masai Mara Reserve',
      date: new Date(),
      time: '06:00',
      vehicle: 'Land Cruiser #3',
      driver: 'Sarah Wanjiku',
      guests: 'Current guests',
      status: 'IN_PROGRESS',
      notes: 'Morning game drive - Big Five focus',
    },
  ];

  for (const transferData of transfers) {
    const transfer = await prisma.transfer.create({
      data: transferData,
    });
    console.log(`✅ Created transfer: ${transfer.type}`);
  }

  // Create channels
  const channels = [
    {
      name: 'Booking.com',
      type: 'BOOKING_COM',
      syncEnabled: true,
      settings: {
        propertyId: '12345',
        currency: 'USD',
      },
    },
    {
      name: 'Airbnb',
      type: 'AIRBNB',
      syncEnabled: false,
      settings: {
        listingId: '67890',
        currency: 'USD',
      },
    },
    {
      name: 'Direct Bookings',
      type: 'CUSTOM',
      syncEnabled: true,
      settings: {},
    },
  ];

  for (const channelData of channels) {
    const channel = await prisma.channel.create({
      data: channelData,
    });
    console.log(`✅ Created channel: ${channel.name}`);
  }

  // Create email templates
  const emailTemplates = [
    {
      name: 'Welcome Email',
      subject: 'Welcome to Enchipai Mara Camp!',
      html: '<h1>Welcome {{guestName}}!</h1><p>We are excited to host you at Enchipai Mara Camp.</p>',
      variables: ['guestName', 'checkIn', 'tentName'],
      category: 'welcome',
    },
    {
      name: 'Booking Confirmation',
      subject: 'Your Booking Confirmation - Enchipai Mara Camp',
      html: '<h1>Booking Confirmed</h1><p>Your booking for {{tentName}} from {{checkIn}} to {{checkOut}} is confirmed.</p>',
      variables: ['guestName', 'bookingNumber', 'tentName', 'checkIn', 'checkOut', 'totalAmount'],
      category: 'booking',
    },
    {
      name: 'Payment Reminder',
      subject: 'Payment Reminder - Enchipai Mara Camp',
      html: '<h1>Payment Reminder</h1><p>This is a reminder that payment for booking {{bookingNumber}} is due.</p>',
      variables: ['guestName', 'bookingNumber', 'amount', 'dueDate'],
      category: 'payment',
    },
  ];

  for (const templateData of emailTemplates) {
    const template = await prisma.emailTemplate.create({
      data: templateData,
    });
    console.log(`✅ Created email template: ${template.name}`);
  }

  // Create notifications
  const notifications = [
    {
      userId: guest.id,
      type: 'BOOKING',
      title: 'Booking Confirmed',
      message: 'Your booking for Ndovu Tent has been confirmed.',
      read: false,
    },
    {
      userId: guest.id,
      type: 'PAYMENT',
      title: 'Payment Received',
      message: 'Your payment of $850 has been received.',
      read: false,
    },
    {
      type: 'SYSTEM',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 2-4 AM.',
      read: false,
    },
  ];

  for (const notificationData of notifications) {
    const notification = await prisma.notification.create({
      data: notificationData,
    });
    console.log(`✅ Created notification: ${notification.title}`);
  }

  // Add tent images for image gallery
  const ndovuTent = await prisma.tent.findUnique({
    where: { slug: 'ndovu-tent' },
  });

  if (ndovuTent) {
    const tentImages = [
      {
        tentId: ndovuTent.id,
        url: '/images/luxury-tent.jpg',
        alt: 'Ndovu Tent exterior',
        order: 0,
      },
      {
        tentId: ndovuTent.id,
        url: '/images/tent-escarpment.jpg',
        alt: 'Ndovu Tent interior',
        order: 1,
      },
      {
        tentId: ndovuTent.id,
        url: '/images/tent-honeymoon.jpg',
        alt: 'Ndovu Tent deck view',
        order: 2,
      },
    ];

    for (const imageData of tentImages) {
      await prisma.tentImage.create({
        data: imageData,
      });
    }
    console.log(`✅ Created ${tentImages.length} images for Ndovu Tent`);
  }

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

