import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from './models/Room.js';
import Booking from './models/Booking.js';
import Restaurant from './models/Restaurant.js';
import Review from './models/Review.js';
import Reclamation from './models/Reclamation.js';
import Event from './models/Event.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/royal-talassa';

const sampleRooms = [
  {
    name: "Suite with Jacuzzi",
    type: "Suite",
    description: "Our premier signature suite, featuring a private indoor/outdoor heated jacuzzi tub, spacious living area, and premium 24/7 butler service.",
    price: 650,
    rating: 4.9,
    image: "/images/room_royal_suite.jpg",
    maxGuests: 4,
    features: ["Private Jacuzzi", "Sea View", "24/7 Butler", "King Bed"],
    available: true
  },
  {
    name: "Luxurious Suite without Jacuzzi",
    type: "Suite",
    description: "An exceptionally spacious and luxurious suite decorated with bespoke furniture, featuring a separate living salon and panoramic views.",
    price: 450,
    rating: 4.8,
    image: "/images/room_presidential_suite.jpg",
    maxGuests: 4,
    features: ["Ocean View", "Spacious Salon", "VIP Access", "King Bed"],
    available: true
  },
  {
    name: "Standard Garden View",
    type: "Room",
    description: "Charming standard guest room offering peaceful views of our lush landscaped hotel gardens, complete with a private terrace or balcony.",
    price: 180,
    rating: 4.5,
    image: "/images/room_skanes_garden.jpg",
    maxGuests: 2,
    features: ["Garden View", "Terrace/Balcony", "Free Wi-Fi", "King Bed"],
    available: true
  },
  {
    name: "Standard Pool View",
    type: "Room",
    description: "Elegant standard guest room featuring a private balcony with direct, scenic views of the central swimming pool.",
    price: 220,
    rating: 4.6,
    image: "/images/room_executive_sea.jpg",
    maxGuests: 2,
    features: ["Pool View", "Private Balcony", "Free Wi-Fi", "Double Bed"],
    available: true
  },
  {
    name: "Standard Garden View Piscine",
    type: "Room",
    description: "Comfortable guest room perfectly positioned to offer views of both our serene gardens and the central swimming pool.",
    price: 250,
    rating: 4.7,
    image: "/images/room_royal_suite.jpg",
    maxGuests: 2,
    features: ["Garden & Pool View", "Private Balcony", "Hammam Shower", "King Bed"],
    available: true
  }
];

const sampleDining = [
  {
    name: "La Voile",
    cuisine: "Mediterranean & Seafood A La Carte",
    description: "Direct beachfront dining offering freshly caught Mediterranean fish, grilled specialties, and premium wines right by the surf.",
    image: "/images/restaurant_la_voile.jpg",
    tables: [
      {
        id: 101,
        label: "VIP Sea Window (2 Guest Limit)",
        size: 2,
        bookedSlots: [
          { date: "2026-05-29", time: "19:00", guestName: "Sophia Loren", partySize: 2 },
          { date: "2026-05-30", time: "20:00", guestName: "Elena Rostova", partySize: 2 }
        ]
      },
      {
        id: 102,
        label: "Sea Terrace Alcove (4 Guest Limit)",
        size: 4,
        bookedSlots: [
          { date: "2026-05-29", time: "21:00", guestName: "Jean-Pierre Blanc", partySize: 3 }
        ]
      },
      { id: 103, label: "Romantic Garden Table (2 Guest Limit)", size: 2, bookedSlots: [] },
      { id: 104, label: "Grand Family Board Table (6 Guest Limit)", size: 6, bookedSlots: [] }
    ]
  },
  {
    name: "Restaurant Mona",
    cuisine: "Fine Dining Mediterranean & Asian Fusion",
    description: "Elegant gourmet dinner setting serving refined à la carte dishes, combining authentic local Tunisian spices with international fusion techniques.",
    image: "/images/restaurant_mona.jpg",
    tables: [
      {
        id: 201,
        label: "Hammam Patio Circle (4 Guest Limit)",
        size: 4,
        bookedSlots: [
          { date: "2026-05-29", time: "19:30", guestName: "Nadia Ben Ali", partySize: 4 }
        ]
      },
      { id: 202, label: "Hammam Patio Corner (2 Guest Limit)", size: 2, bookedSlots: [] },
      { id: 203, label: "Chef's Claypot Bar Seat A (1 Guest)", size: 1, bookedSlots: [] }
    ]
  }
];

const sampleEventsAndActivities = [
  {
    name: "Royal Elyssa Thalasso & Spa",
    type: "Activity",
    category: "Thalassotherapy & Wellness",
    description: "Rejuvenating thalassotherapy treatments, marine hydrotherapy seawater pools, and luxury multi-sensory hammams in our world-renowned wellness center.",
    date: "Daily",
    time: "09:00 - 20:00",
    price: 75,
    capacity: 15,
    registered: ["Sophia Loren"],
    image: "/images/activity_spa.jpg"
  },
  {
    name: "Catamaran Sea Sailing & Dolphin Watch",
    type: "Activity",
    category: "Marine Excursions",
    description: "Charter our private catamaran from the Monastir marina to explore the Skanes coast, watch dolphins, and enjoy champagne and fresh oysters.",
    date: "Mon/Wed/Fri",
    time: "17:30 - 19:30",
    price: 120,
    capacity: 20,
    registered: [],
    image: "/images/activity_sailing.jpg"
  },
  {
    name: "Hatha Yoga on Skanes Beach",
    type: "Activity",
    category: "Fitness & Soul",
    description: "Start your morning with a calming sunrise yoga session, deep-breath meditation, and stretching on the private white sands of Skanes Beach.",
    date: "Tue/Thu",
    time: "06:30 - 07:30",
    price: 25,
    capacity: 30,
    registered: ["Sophia Loren"],
    image: "/images/activity_yoga.jpg"
  },
  {
    name: "Mediterranean Summer Gala",
    type: "Event",
    category: "Galas & Dining",
    description: "An exclusive beachfront gala evening under the stars featuring world-class live musicians, gourmet Tunisian seafood pairings, and a grand fireworks show.",
     date: "2027-06-15",
    time: "20:00 - Midnight",
    price: 150,
    capacity: 150,
    registered: ["Sophia Loren"],
    image: "/images/event_gala.jpg"
  },
  {
    name: "Thalasso Wellness Summit",
    type: "Event",
    category: "Wellness Conferences",
    description: "A comprehensive weekend seminar gathering world experts in marine therapy, holistic health, and mindfulness workshops.",
     date: "2027-07-02",
    time: "09:00 - 18:00",
    price: 90,
    capacity: 80,
    registered: [],
    image: "/images/event_summit.jpg"
  }
];

const sampleReviews = [
  {
    guestName: "Elena Rostova",
    rating: 5,
    category: "Service",
    comment: "The butler service in the Royal Ocean Suite was absolutely flawless. They anticipated every single need we had during our anniversary stay!",
    approved: true
  },
  {
    guestName: "Jean-Pierre Blanc",
    rating: 4,
    category: "Dining",
    comment: "The seafood carpaccio at L'Agape Signature is to die for. Incredible sunset view, though the table service was slightly relaxed.",
    approved: true
  },
  {
    guestName: "Nadia Ben Ali",
    rating: 5,
    category: "Rooms",
    comment: "Simply spectacular! Skanes beach access was quiet and clean. The Royal Elysa Spa thalasso pools are therapeutic.",
    approved: true
  }
];

const sampleReclamations = [
  {
    guestName: "Sophia Loren",
    roomNumber: "Suite 304",
    category: "Maintenance",
    urgency: "Medium",
    description: "The private balcony hot tub heater is not reaching the requested 38°C temperature. It stays around room temp.",
    status: "In Progress",
    response: "Maintenance team dispatched. Heating element being replaced."
  },
  {
    guestName: "Sarah Jenkins",
    roomNumber: "Room 102",
    category: "Housekeeping",
    urgency: "Low",
    description: "Requested two extra hypoallergenic feather-free pillows at check-in but haven't received them yet.",
    status: "Resolved",
    response: "Delivered to Room 102. Guest confirmed receipt."
  },
  {
    guestName: "Karim Mansour",
    roomNumber: "Bungalow 12",
    category: "Rooms",
    urgency: "High",
    description: "The air conditioning unit is rattling extremely loudly making it impossible to sleep.",
    status: "Pending",
    response: ""
  }
];

async function seedDatabase() {
  let retries = 5;
  while (retries > 0) {
    try {
      console.log(`Connecting to MongoDB (attempts left: ${retries}): `, mongoURI);
      await mongoose.connect(mongoURI);
      console.log('Connected successfully!');
      break;
    } catch (err) {
      console.error(`Database connection failed: ${err.message}`);
      retries -= 1;
      if (retries === 0) {
        console.error('Failed to connect to MongoDB after multiple attempts. Exiting.');
        process.exit(1);
      }
      console.log('Waiting 3 seconds before next connection attempt...');
      await new Promise(res => setTimeout(res, 3000));
    }
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
        throw new Error('ADMIN_EMAIL must be a valid email address.');
      }
      if (adminPassword.length < 10 || Buffer.byteLength(adminPassword, 'utf8') > 72 || adminPassword.startsWith('replace-')) {
        throw new Error('Set a unique ADMIN_PASSWORD containing 10 to 72 characters.');
      }
      const existingAdmin = await User.findOne({ email: adminEmail });
      if (!existingAdmin) {
        await User.create({
          name: process.env.ADMIN_NAME || 'Hotel Administrator',
          email: adminEmail,
          passwordHash: await bcrypt.hash(adminPassword, 12),
          role: 'admin'
        });
        console.log(`Administrator account provisioned for ${adminEmail}.`);
      }
    } else {
      console.warn('ADMIN_EMAIL/ADMIN_PASSWORD are not configured; no administrator account was provisioned.');
    }

    const force = process.argv.includes('--force');
    if (!force) {
      const roomCount = await Room.countDocuments({});
      if (roomCount > 0) {
        console.log('🏛️ Database already seeded. Skipping seed execution. Use "npm run seed -- --force" to reset database.');
        return;
      }
    }

    // Clear existing collections
    console.log('Clearing old collections...');
    await Room.deleteMany({});
    await Restaurant.deleteMany({});
    await Event.deleteMany({});
    await Review.deleteMany({});
    await Reclamation.deleteMany({});
    await Booking.deleteMany({});

    // Seed Rooms
    console.log('Seeding luxury rooms...');
    const insertedRooms = await Room.insertMany(sampleRooms);
    console.log(`Seeded ${insertedRooms.length} rooms.`);

    // Seed Bookings
    console.log('Seeding room bookings...');
    const sampleBookings = [
      {
        roomId: insertedRooms[0]._id, // Suite with Jacuzzi
        guestName: "Sophia Loren",
        checkIn: new Date("2026-06-01"),
        checkOut: new Date("2026-06-05"),
        guestsCount: 2,
        addons: ["Private Pool Heating", "Butler Airport Transfer"],
        totalAmount: 3400
      },
      {
        roomId: insertedRooms[1]._id, // Luxurious Suite without Jacuzzi
        guestName: "Elena Rostova",
        checkIn: new Date("2026-06-10"),
        checkOut: new Date("2026-06-12"),
        guestsCount: 2,
        addons: ["Breakfast in Bed"],
        totalAmount: 840
      },
      {
        roomId: insertedRooms[3]._id, // Standard Pool View
        guestName: "Karim Mansour",
        checkIn: new Date("2026-06-15"),
        checkOut: new Date("2026-06-20"),
        guestsCount: 1,
        addons: [],
        totalAmount: 1450
      }
    ];
    const insertedBookings = await Booking.insertMany(sampleBookings);
    console.log(`Seeded ${insertedBookings.length} bookings.`);

    // Seed Restaurants
    console.log('Seeding gastronomy restaurants...');
    const insertedRest = await Restaurant.insertMany(sampleDining);
    console.log(`Seeded ${insertedRest.length} restaurants.`);

    // Seed Events/Activities
    console.log('Seeding special events & activities...');
    const insertedEvents = await Event.insertMany(sampleEventsAndActivities);
    console.log(`Seeded ${insertedEvents.length} events/activities.`);

    // Seed Reviews
    console.log('Seeding guest reviews...');
    const insertedReviews = await Review.insertMany(sampleReviews);
    console.log(`Seeded ${insertedReviews.length} reviews.`);

    // Seed Reclamations
    console.log('Seeding complaints database...');
    const insertedRec = await Reclamation.insertMany(sampleReclamations);
    console.log(`Seeded ${insertedRec.length} reclamation tickets.`);

    console.log('--- DATABASE SEEDING COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

seedDatabase();
