import { config } from "dotenv";
// Load environment variables from .env.local
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️ Cleaned existing data");

  // Create Admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@roomrental.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
      phone: "+1 (555) 000-0001",
    },
  });
  console.log("👤 Created admin:", admin.email);

  // Create Landlords
  const landlordPassword = await bcrypt.hash("landlord123", 10);
  const landlord1 = await prisma.user.create({
    data: {
      email: "john@landlord.com",
      name: "John Smith",
      password: landlordPassword,
      role: "LANDLORD",
      phone: "+1 (555) 100-0001",
    },
  });

  const landlord2 = await prisma.user.create({
    data: {
      email: "sarah@landlord.com",
      name: "Sarah Johnson",
      password: landlordPassword,
      role: "LANDLORD",
      phone: "+1 (555) 100-0002",
    },
  });
  console.log("🏠 Created landlords");

  // Create Users
  const userPassword = await bcrypt.hash("user123", 10);
  const user1 = await prisma.user.create({
    data: {
      email: "mike@user.com",
      name: "Mike Wilson",
      password: userPassword,
      role: "USER",
      phone: "+1 (555) 200-0001",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "emma@user.com",
      name: "Emma Davis",
      password: userPassword,
      role: "USER",
      phone: "+1 (555) 200-0002",
    },
  });
  console.log("👥 Created users");

  // Create Rooms
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        title: "Luxury Downtown Penthouse with Stunning City Views",
        description: "Experience ultimate luxury in this stunning penthouse apartment featuring floor-to-ceiling windows with panoramic city views. Modern furnishings, a gourmet kitchen, and a private terrace make this the perfect urban retreat. Located in the heart of downtown, steps away from world-class dining, shopping, and entertainment.",
        type: "APARTMENT",
        price: 450,
        location: "Manhattan, New York",
        address: "100 Park Avenue",
        city: "New York",
        state: "NY",
        zipCode: "10017",
        country: "USA",
        size: 180,
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        amenities: ["WiFi", "Air Conditioning", "Kitchen", "Washer", "Dryer", "Gym", "Pool", "Balcony", "Workspace", "TV"],
        images: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        ],
        status: "AVAILABLE",
        featured: true,
        landlordId: landlord1.id,
      },
    }),
    prisma.room.create({
      data: {
        title: "Cozy Studio in Historic District",
        description: "Charming studio apartment in a beautifully restored historic building. Perfect for solo travelers or couples seeking an authentic city experience. Walking distance to museums, cafes, and public transportation.",
        type: "STUDIO",
        price: 89,
        location: "Historic District, Boston",
        address: "45 Heritage Lane",
        city: "Boston",
        state: "MA",
        zipCode: "02108",
        country: "USA",
        size: 35,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        amenities: ["WiFi", "Air Conditioning", "Heating", "TV", "Workspace", "Kitchen"],
        images: [
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
          "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800",
        ],
        status: "AVAILABLE",
        featured: true,
        landlordId: landlord1.id,
      },
    }),
    prisma.room.create({
      data: {
        title: "Modern Beach House with Ocean Views",
        description: "Wake up to the sound of waves in this beautiful beach house. Features include a private deck, outdoor shower, and direct beach access. Fully equipped kitchen and comfortable living spaces for the perfect seaside getaway.",
        type: "APARTMENT",
        price: 275,
        location: "Malibu Beach, California",
        address: "888 Coastal Highway",
        city: "Malibu",
        state: "CA",
        zipCode: "90265",
        country: "USA",
        size: 120,
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        amenities: ["WiFi", "Air Conditioning", "Kitchen", "Parking", "Balcony", "Garden", "BBQ", "Pet Friendly"],
        images: [
          "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
          "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800",
          "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800",
        ],
        status: "AVAILABLE",
        featured: true,
        landlordId: landlord2.id,
      },
    }),
    prisma.room.create({
      data: {
        title: "Elegant Suite in Boutique Hotel",
        description: "Experience luxury accommodation in this elegantly designed suite. Features include premium bedding, marble bathroom, and 24-hour concierge service. Located in the prestigious downtown district.",
        type: "DOUBLE",
        price: 320,
        location: "Downtown, Chicago",
        address: "200 Grand Boulevard",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        country: "USA",
        size: 65,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        amenities: ["WiFi", "Air Conditioning", "Heating", "TV", "Hot Tub", "Gym", "Room Service"],
        images: [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
        ],
        status: "AVAILABLE",
        featured: false,
        landlordId: landlord2.id,
      },
    }),
    prisma.room.create({
      data: {
        title: "Mountain Cabin Retreat",
        description: "Escape to this rustic yet modern cabin nestled in the mountains. Perfect for nature lovers, featuring a stone fireplace, wraparound deck, and hiking trails nearby. Ideal for a peaceful getaway.",
        type: "APARTMENT",
        price: 195,
        location: "Aspen Mountain, Colorado",
        address: "500 Mountain View Road",
        city: "Aspen",
        state: "CO",
        zipCode: "81611",
        country: "USA",
        size: 95,
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 4,
        amenities: ["WiFi", "Heating", "Fireplace", "Kitchen", "Parking", "BBQ", "Garden", "Pet Friendly"],
        images: [
          "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=800",
          "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800",
        ],
        status: "AVAILABLE",
        featured: true,
        landlordId: landlord1.id,
      },
    }),
    prisma.room.create({
      data: {
        title: "Urban Loft in Arts District",
        description: "Stylish loft space in the heart of the arts district. Industrial design meets modern comfort with exposed brick, high ceilings, and contemporary art. Walking distance to galleries, restaurants, and nightlife.",
        type: "STUDIO",
        price: 145,
        location: "Arts District, Los Angeles",
        address: "750 Gallery Street",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90013",
        country: "USA",
        size: 55,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        amenities: ["WiFi", "Air Conditioning", "Kitchen", "Washer", "Dryer", "Workspace", "TV"],
        images: [
          "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800",
          "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800",
        ],
        status: "AVAILABLE",
        featured: false,
        landlordId: landlord2.id,
      },
    }),
  ]);
  console.log("🏡 Created", rooms.length, "rooms");

  // Create Bookings
  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        checkIn: new Date("2024-12-15"),
        checkOut: new Date("2024-12-18"),
        guests: 2,
        totalPrice: 267,
        status: "CONFIRMED",
        userId: user1.id,
        roomId: rooms[1].id,
      },
    }),
    prisma.booking.create({
      data: {
        checkIn: new Date("2024-12-20"),
        checkOut: new Date("2024-12-25"),
        guests: 4,
        totalPrice: 1375,
        status: "CONFIRMED",
        userId: user2.id,
        roomId: rooms[2].id,
      },
    }),
    prisma.booking.create({
      data: {
        checkIn: new Date("2024-11-10"),
        checkOut: new Date("2024-11-12"),
        guests: 2,
        totalPrice: 900,
        status: "COMPLETED",
        userId: user1.id,
        roomId: rooms[0].id,
      },
    }),
    prisma.booking.create({
      data: {
        checkIn: new Date("2025-01-05"),
        checkOut: new Date("2025-01-10"),
        guests: 2,
        totalPrice: 1600,
        status: "PENDING",
        userId: user2.id,
        roomId: rooms[3].id,
      },
    }),
  ]);
  console.log("📅 Created", bookings.length, "bookings");

  // Create Reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Absolutely stunning penthouse! The views were incredible and the amenities were top-notch. John was a wonderful host. Will definitely book again!",
        userId: user1.id,
        roomId: rooms[0].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Great location and cozy space. Perfect for our weekend getaway. The historic charm of the building was a nice touch.",
        userId: user2.id,
        roomId: rooms[1].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "The beach house exceeded our expectations! Waking up to ocean views was magical. Sarah provided excellent recommendations for local restaurants.",
        userId: user1.id,
        roomId: rooms[2].id,
      },
    }),
  ]);
  console.log("⭐ Created", reviews.length, "reviews");

  console.log("✅ Database seeded successfully!");
  console.log("\n📋 Test Accounts:");
  console.log("   Admin: admin@roomrental.com / admin123");
  console.log("   Landlord: john@landlord.com / landlord123");
  console.log("   Landlord: sarah@landlord.com / landlord123");
  console.log("   User: mike@user.com / user123");
  console.log("   User: emma@user.com / user123");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
