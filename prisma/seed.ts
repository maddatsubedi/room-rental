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
      phone: "+977 9800000001",
    },
  });
  console.log("👤 Created admin:", admin.email);

  // Create Landlords
  const landlordPassword = await bcrypt.hash("landlord123", 10);
  const landlord1 = await prisma.user.create({
    data: {
      email: "rajesh@landlord.com",
      name: "Rajesh Sharma",
      password: landlordPassword,
      role: "LANDLORD",
      phone: "+977 9841000001",
    },
  });

  const landlord2 = await prisma.user.create({
    data: {
      email: "sunita@landlord.com",
      name: "Sunita Thapa",
      password: landlordPassword,
      role: "LANDLORD",
      phone: "+977 9841000002",
    },
  });
  console.log("🏠 Created landlords");

  // Create Users
  const userPassword = await bcrypt.hash("user123", 10);
  const user1 = await prisma.user.create({
    data: {
      email: "anil@user.com",
      name: "Anil Gurung",
      password: userPassword,
      role: "USER",
      phone: "+977 9860000001",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "priya@user.com",
      name: "Priya Maharjan",
      password: userPassword,
      role: "USER",
      phone: "+977 9860000002",
    },
  });
  console.log("👥 Created users");

  // Create Rooms (Monthly rental properties)
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        title: "Spacious 3BHK Apartment in Lazimpat",
        description: "Well-maintained apartment ideal for families or sharing. Features three bedrooms, modern kitchen, and balcony with mountain views. Located in the prestigious Lazimpat area, close to schools, hospitals, and shopping centers. 24-hour water supply and backup electricity included.",
        type: "APARTMENT",
        price: 35000,
        location: "Lazimpat, Kathmandu",
        address: "House No. 123, Lazimpat Marg",
        city: "Kathmandu",
        state: "Bagmati",
        zipCode: "44600",
        country: "Nepal",
        size: 180,
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        amenities: ["WiFi", "Hot Water", "Kitchen", "Washer", "Parking", "Balcony", "Workspace", "TV", "24hr Water", "Backup Power"],
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
        title: "Affordable Single Room near Thamel",
        description: "Clean and comfortable single room perfect for students or working professionals. Shared kitchen and bathroom facilities. Just 10 minutes walk from Thamel. Quiet neighborhood with friendly landlord. Utilities included in rent.",
        type: "SINGLE",
        price: 6000,
        location: "Paknajol, Kathmandu",
        address: "Paknajol Chowk",
        city: "Kathmandu",
        state: "Bagmati",
        zipCode: "44600",
        country: "Nepal",
        size: 15,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 1,
        amenities: ["WiFi", "Hot Water", "Shared Kitchen", "TV", "Rooftop Access"],
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
        title: "2BHK Flat with Phewa Lake View",
        description: "Beautiful 2-bedroom flat in Lakeside with stunning views of Phewa Lake and the mountains. Ideal for small families or couples. Fully furnished with modern amenities. Walking distance to restaurants, cafes, and the lake. Perfect for those seeking peaceful living in Pokhara.",
        type: "APARTMENT",
        price: 18000,
        location: "Lakeside, Pokhara",
        address: "Lakeside Marg, Street 3",
        city: "Pokhara",
        state: "Gandaki",
        zipCode: "33700",
        country: "Nepal",
        size: 120,
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        amenities: ["WiFi", "Hot Water", "Kitchen", "Parking", "Balcony", "Garden", "Lake View", "Furnished"],
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
        title: "Double Room in Durbar Marg",
        description: "Well-furnished double room in prime Durbar Marg location. Suitable for working professionals or couples. Attached bathroom, 24-hour security, and easy access to public transport. Close to offices, banks, and restaurants.",
        type: "DOUBLE",
        price: 12000,
        location: "Durbar Marg, Kathmandu",
        address: "Durbar Marg Road",
        city: "Kathmandu",
        state: "Bagmati",
        zipCode: "44600",
        country: "Nepal",
        size: 25,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        amenities: ["WiFi", "Hot Water", "Attached Bath", "TV", "Security", "Furnished"],
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
        title: "Peaceful 2BHK House in Nagarkot",
        description: "Escape the city noise in this peaceful house in Nagarkot. Two bedrooms with attached bathrooms, kitchen, and garden. Amazing sunrise views over the Himalayas. Ideal for remote workers or those seeking a quiet lifestyle. 30 minutes from Bhaktapur.",
        type: "APARTMENT",
        price: 15000,
        location: "Nagarkot, Bhaktapur",
        address: "Nagarkot Hill Station",
        city: "Nagarkot",
        state: "Bagmati",
        zipCode: "44800",
        country: "Nepal",
        size: 95,
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        amenities: ["WiFi", "Hot Water", "Kitchen", "Parking", "Garden", "Mountain View", "Pet Friendly", "Quiet Area"],
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
        title: "Modern Studio in Jhamsikhel",
        description: "Trendy studio apartment in the heart of Jhamsikhel. Perfect for students or young professionals. Open-plan design with kitchenette and modern bathroom. Walking distance to colleges, cafes, and Patan Durbar Square. Good public transport connectivity.",
        type: "STUDIO",
        price: 10000,
        location: "Jhamsikhel, Lalitpur",
        address: "Jhamsikhel Road",
        city: "Lalitpur",
        state: "Bagmati",
        zipCode: "44700",
        country: "Nepal",
        size: 30,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        amenities: ["WiFi", "Hot Water", "Kitchenette", "Washer", "Workspace", "TV", "Near College"],
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

  // Create Bookings (Long-term rentals - monthly)
  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        checkIn: new Date("2024-09-01"),
        checkOut: new Date("2025-02-28"),
        guests: 1,
        totalPrice: 36000, // 6 months at Rs 6000
        status: "CONFIRMED",
        userId: user1.id,
        roomId: rooms[1].id, // Affordable Single Room near Thamel
      },
    }),
    prisma.booking.create({
      data: {
        checkIn: new Date("2024-10-01"),
        checkOut: new Date("2025-03-31"),
        guests: 3,
        totalPrice: 108000, // 6 months at Rs 18000
        status: "CONFIRMED",
        userId: user2.id,
        roomId: rooms[2].id, // 2BHK Flat with Phewa Lake View
      },
    }),
    prisma.booking.create({
      data: {
        checkIn: new Date("2024-06-01"),
        checkOut: new Date("2024-11-30"),
        guests: 4,
        totalPrice: 210000, // 6 months at Rs 35000
        status: "COMPLETED",
        userId: user1.id,
        roomId: rooms[0].id, // Spacious 3BHK Apartment
      },
    }),
    prisma.booking.create({
      data: {
        checkIn: new Date("2025-01-15"),
        checkOut: new Date("2025-07-15"),
        guests: 2,
        totalPrice: 72000, // 6 months at Rs 12000
        status: "PENDING",
        userId: user2.id,
        roomId: rooms[3].id, // Double Room in Durbar Marg
      },
    }),
  ]);
  console.log("📅 Created", bookings.length, "bookings");

  // Create Reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        comment: "I've been renting this apartment for 6 months now and it's been great! The location is perfect - close to my office and all amenities. Rajesh ji is very responsive and helpful. Highly recommend for families!",
        userId: user1.id,
        roomId: rooms[0].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Perfect room for a student like me. Very affordable rent and the location near Thamel is convenient. Shared facilities are clean and well-maintained. The landlord is understanding about student schedules.",
        userId: user2.id,
        roomId: rooms[1].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Best decision moving to this flat in Pokhara! The lake view never gets old and Sunita didi is an amazing landlord. Been here for 4 months and planning to extend. Great for remote work!",
        userId: user1.id,
        roomId: rooms[2].id,
      },
    }),
  ]);
  console.log("⭐ Created", reviews.length, "reviews");

  console.log("✅ Database seeded successfully!");
  console.log("\n📋 Test Accounts:");
  console.log("   Admin: admin@roomrental.com / admin123");
  console.log("   Landlord: rajesh@landlord.com / landlord123");
  console.log("   Landlord: sunita@landlord.com / landlord123");
  console.log("   User: anil@user.com / user123");
  console.log("   User: priya@user.com / user123");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
