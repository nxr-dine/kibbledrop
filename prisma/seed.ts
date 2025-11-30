import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data
  await prisma.subscriptionItem.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.petProfile.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Cleared existing data");

  // Create sample users
  const hashedPassword = await bcrypt.hash("Password123", 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "John Smith",
        email: "john@example.com",
        password: hashedPassword,
        role: "customer",
      },
    }),
    prisma.user.create({
      data: {
        name: "Sarah Johnson",
        email: "sarah@example.com",
        password: hashedPassword,
        role: "customer",
      },
    }),
    prisma.user.create({
      data: {
        name: "Mike Wilson",
        email: "mike@example.com",
        password: hashedPassword,
        role: "customer",
      },
    }),
    prisma.user.create({
      data: {
        name: "Emily Davis",
        email: "emily@example.com",
        password: hashedPassword,
        role: "customer",
      },
    }),
    prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@kibbledrop.com",
        password: hashedPassword,
        role: "admin",
      },
    }),
  ]);

  console.log("👥 Created users:", users.length);

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Premium Dog Food - Chicken & Rice",
        description:
          "High-quality protein with wholesome grains for adult dogs. Made with real chicken as the first ingredient and fortified with essential vitamins and minerals.",
        price: 29.99,
        category: "Food",
        petType: "Dog",
        image: "/premium-dog-food.jpg",
        featured: true,
        brand: "Royal Canin",
        weight: "2kg",
        species: "Dog",
        lifeStage: "adult",
        productType: "Dry Dog Food",
        foodType: "dry",
      },
    }),
    prisma.product.create({
      data: {
        name: "Grain-Free Cat Food - Salmon",
        description:
          "Wild-caught salmon with sweet potato for sensitive cats. Limited ingredient formula perfect for cats with food sensitivities.",
        price: 34.99,
        category: "Food",
        petType: "Cat",
        image: "/pet-food-packaging.jpg",
        featured: true,
        brand: "Blue Buffalo",
        weight: "1.5kg",
        species: "Cat",
        lifeStage: "adult",
        productType: "Dry Cat Food",
        foodType: "dry",
      },
    }),
    prisma.product.create({
      data: {
        name: "Puppy Formula - Turkey & Vegetables",
        description:
          "Specially formulated nutrition for growing puppies. Contains DHA for brain development and calcium for strong bones.",
        price: 32.99,
        category: "Food",
        petType: "Dog",
        image: "/stand-up-pouches.jpg",
        featured: false,
        brand: "Hill's",
        weight: "1kg",
        species: "Dog",
        lifeStage: "puppy",
        productType: "Dry Dog Food",
        foodType: "dry",
      },
    }),
    prisma.product.create({
      data: {
        name: "Senior Cat Food - Chicken & Pumpkin",
        description:
          "Easy-to-digest formula for senior cats. Lower calorie content with added glucosamine for joint health.",
        price: 31.99,
        category: "Food",
        petType: "Cat",
        image: "/dog-food-packaging-1.jpg",
        featured: false,
        brand: "Purina",
        weight: "2kg",
        species: "Cat",
        lifeStage: "senior",
        productType: "Dry Cat Food",
        foodType: "dry",
      },
    }),
    prisma.product.create({
      data: {
        name: "Large Breed Dog Food - Beef & Barley",
        description:
          "Balanced nutrition for large breed dogs. Controlled calcium and phosphorus levels for healthy bone development.",
        price: 39.99,
        category: "Food",
        petType: "Dog",
        image: "/dog-food-packaging-2.jpg",
        featured: false,
        brand: "Orijen",
        weight: "5kg",
        species: "Dog",
        lifeStage: "adult",
        productType: "Dry Dog Food",
        foodType: "dry",
      },
    }),
    prisma.product.create({
      data: {
        name: "Indoor Cat Food - Fish & Rice",
        description:
          "Lower calorie formula for indoor cats. High fiber content to help with hairball control.",
        price: 28.99,
        category: "Food",
        petType: "Cat",
        image: "/indoor-cat-food.jpg",
        featured: false,
        brand: "Acana",
        weight: "1kg",
        species: "Cat",
        lifeStage: "adult",
        productType: "Dry Cat Food",
        foodType: "dry",
      },
    }),
    prisma.product.create({
      data: {
        name: "Dog Treats - Peanut Butter",
        description:
          "Natural peanut butter treats for training and rewards. Made with real peanut butter and no artificial preservatives.",
        price: 12.99,
        category: "Treats",
        petType: "Dog",
        image: "/dog-treats-peanut-butter.jpg",
        featured: false,
        brand: "Blue Buffalo",
        weight: "500g",
        species: "Dog",
        lifeStage: "adult",
        productType: "Dog Treat",
        foodType: "dry",
      },
    }),
    prisma.product.create({
      data: {
        name: "Cat Treats - Tuna Bites",
        description:
          "Grain-free tuna treats for cats. High in protein and perfect for training or as a special reward.",
        price: 9.99,
        category: "Treats",
        petType: "Cat",
        image: "/pet-food-packaging.jpg",
        featured: false,
        brand: "Hill's",
        weight: "300g",
        species: "Cat",
        lifeStage: "adult",
        productType: "Cat Treat",
        foodType: "dry",
      },
    }),
    prisma.product.create({
      data: {
        name: "Dog Collar - Adjustable Nylon",
        description:
          "Comfortable and durable nylon collar with quick-release buckle. Available in multiple sizes and colors.",
        price: 19.99,
        category: "Accessories",
        petType: "Dog",
        image: "/dog-pet-supplies.jpg",
        featured: false,
        brand: "Royal Canin",
        weight: "200g",
        species: "Dog",
        lifeStage: "adult",
        productType: "Hygiene",
        foodType: null,
      },
    }),
    prisma.product.create({
      data: {
        name: "Cat Scratching Post",
        description:
          "Multi-level cat tree with sisal scratching posts and comfortable perches. Perfect for indoor cats.",
        price: 89.99,
        category: "Accessories",
        petType: "Cat",
        image: "/macart-petquitte.jpg",
        featured: false,
        brand: "Blue Buffalo",
        weight: "5kg",
        species: "Cat",
        lifeStage: "adult",
        productType: "Hygiene",
        foodType: null,
      },
    }),
    prisma.product.create({
      data: {
        name: "Dog Leash - Retractable",
        description:
          "15-foot retractable leash with ergonomic handle and safety lock. Perfect for walks and training.",
        price: 24.99,
        category: "Accessories",
        petType: "Dog",
        image: "/best-adult-dog-food-small-breeds.jpg",
        featured: false,
        brand: "Orijen",
        weight: "300g",
        species: "Dog",
        lifeStage: "adult",
        productType: "Hygiene",
        foodType: null,
      },
    }),
    prisma.product.create({
      data: {
        name: "Cat Litter Box - Self-Cleaning",
        description:
          "Automatic self-cleaning litter box with odor control. Reduces maintenance and keeps your home fresh.",
        price: 199.99,
        category: "Accessories",
        petType: "Cat",
        image: "/mondou-vetdiet-dental-care.jpg",
        featured: false,
        brand: "Acana",
        weight: "3kg",
        species: "Cat",
        lifeStage: "adult",
        productType: "Litter",
        foodType: null,
      },
    }),
  ]);

  console.log("🛍️  Created products:", products.length);

  // Create pet profiles
  const petProfiles = await Promise.all([
    prisma.petProfile.create({
      data: {
        userId: users[0].id,
        name: "Buddy",
        type: "Dog",
        breed: "Golden Retriever",
        birthday: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000), // 3 years ago
        weight: 65.5,
        healthTags: ["active", "healthy"],
      },
    }),
    prisma.petProfile.create({
      data: {
        userId: users[0].id,
        name: "Luna",
        type: "Cat",
        breed: "Siamese",
        birthday: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000), // 2 years ago
        weight: 8.2,
        healthTags: ["indoor", "allergies"],
      },
    }),
    prisma.petProfile.create({
      data: {
        userId: users[1].id,
        name: "Max",
        type: "Dog",
        breed: "German Shepherd",
        birthday: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000), // 5 years ago
        weight: 75.0,
        healthTags: ["working dog", "high energy"],
      },
    }),
    prisma.petProfile.create({
      data: {
        userId: users[2].id,
        name: "Whiskers",
        type: "Cat",
        breed: "Persian",
        birthday: new Date(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000), // 7 years ago
        weight: 12.5,
        healthTags: ["senior", "special diet"],
      },
    }),
    prisma.petProfile.create({
      data: {
        userId: users[3].id,
        name: "Rocky",
        type: "Dog",
        breed: "Labrador Retriever",
        birthday: new Date(Date.now() - 1 * 365 * 24 * 60 * 60 * 1000), // 1 year ago
        weight: 45.0,
        healthTags: ["puppy", "growing"],
      },
    }),
  ]);

  console.log("🐾 Created pet profiles:", petProfiles.length);

  // Create sample orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        userId: users[0].id,
        status: "delivered",
        subtotal: 89.97,
        shipping: 0,
        total: 89.97,
        deliveryName: "John Smith",
        deliveryPhone: "+1-555-0123",
        deliveryAddress: "123 Main St",
        city: "New York",
        postalCode: "10001",
        instructions: "Leave at front door",
        deliveryMethod: "standard",
        trackingNumber: "TRK123456789",
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    }),
    prisma.order.create({
      data: {
        userId: users[1].id,
        status: "shipped",
        subtotal: 124.97,
        shipping: 0,
        total: 124.97,
        deliveryName: "Sarah Johnson",
        deliveryPhone: "+1-555-0456",
        deliveryAddress: "456 Oak Ave",
        city: "Los Angeles",
        postalCode: "90210",
        instructions: "Ring doorbell twice",
        deliveryMethod: "express",
        trackingNumber: "TRK987654321",
        estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    }),
    prisma.order.create({
      data: {
        userId: users[2].id,
        status: "processing",
        subtotal: 67.98,
        shipping: 0,
        total: 67.98,
        deliveryName: "Mike Wilson",
        deliveryPhone: "+1-555-0789",
        deliveryAddress: "789 Pine St",
        city: "Chicago",
        postalCode: "60601",
        instructions: "Call before delivery",
        deliveryMethod: "standard",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    }),
    prisma.order.create({
      data: {
        userId: users[3].id,
        status: "pending",
        subtotal: 45.98,
        shipping: 0,
        total: 45.98,
        deliveryName: "Emily Davis",
        deliveryPhone: "+1-555-0321",
        deliveryAddress: "321 Elm St",
        city: "Miami",
        postalCode: "33101",
        instructions: "Gate code: 1234",
        deliveryMethod: "standard",
        createdAt: new Date(),
      },
    }),
  ]);

  console.log("📦 Created orders:", orders.length);

  // Create order items
  const orderItems = await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[0].id, // Premium Dog Food
        quantity: 2,
        price: 29.99,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[6].id, // Dog Treats
        quantity: 1,
        price: 12.99,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[8].id, // Dog Collar
        quantity: 1,
        price: 19.99,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[1].id,
        productId: products[1].id, // Cat Food
        quantity: 2,
        price: 34.99,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[1].id,
        productId: products[9].id, // Cat Scratching Post
        quantity: 1,
        price: 89.99,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[2].id,
        productId: products[2].id, // Puppy Food
        quantity: 1,
        price: 32.99,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[2].id,
        productId: products[7].id, // Cat Treats
        quantity: 1,
        price: 9.99,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[2].id,
        productId: products[10].id, // Dog Leash
        quantity: 1,
        price: 24.99,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[3].id,
        productId: products[3].id, // Senior Cat Food
        quantity: 1,
        price: 31.99,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[3].id,
        productId: products[7].id, // Cat Treats
        quantity: 1,
        price: 9.99,
      },
    }),
  ]);

  console.log("📋 Created order items:", orderItems.length);

  // Create subscriptions
  const subscriptions = await Promise.all([
    prisma.subscription.create({
      data: {
        userId: users[0].id,
        frequency: "monthly",
        status: "active",
        deliveryName: "John Smith",
        deliveryPhone: "+1-555-0123",
        deliveryAddress: "123 Main St",
        city: "New York",
        postalCode: "10001",
        instructions: "Leave at front door",
        nextDelivery: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      },
    }),
    prisma.subscription.create({
      data: {
        userId: users[1].id,
        frequency: "bi-weekly",
        status: "active",
        deliveryName: "Sarah Johnson",
        deliveryPhone: "+1-555-0456",
        deliveryAddress: "456 Oak Ave",
        city: "Los Angeles",
        postalCode: "90210",
        instructions: "Ring doorbell twice",
        nextDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      },
    }),
    prisma.subscription.create({
      data: {
        userId: users[2].id,
        frequency: "weekly",
        status: "paused",
        deliveryName: "Mike Wilson",
        deliveryPhone: "+1-555-0789",
        deliveryAddress: "789 Pine St",
        city: "Chicago",
        postalCode: "60601",
        instructions: "Call before delivery",
        nextDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
      },
    }),
    prisma.subscription.create({
      data: {
        userId: users[3].id,
        frequency: "monthly",
        status: "cancelled",
        deliveryName: "Emily Davis",
        deliveryPhone: "+1-555-0321",
        deliveryAddress: "321 Elm St",
        city: "Miami",
        postalCode: "33101",
        instructions: "Gate code: 1234",
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Cancelled 7 days ago
      },
    }),
  ]);

  console.log("📅 Created subscriptions:", subscriptions.length);

  // Create subscription items
  const subscriptionItems = await Promise.all([
    prisma.subscriptionItem.create({
      data: {
        subscriptionId: subscriptions[0].id,
        productId: products[0].id, // Premium Dog Food
        quantity: 2,
      },
    }),
    prisma.subscriptionItem.create({
      data: {
        subscriptionId: subscriptions[0].id,
        productId: products[6].id, // Dog Treats
        quantity: 1,
      },
    }),
    prisma.subscriptionItem.create({
      data: {
        subscriptionId: subscriptions[1].id,
        productId: products[1].id, // Cat Food
        quantity: 1,
      },
    }),
    prisma.subscriptionItem.create({
      data: {
        subscriptionId: subscriptions[1].id,
        productId: products[7].id, // Cat Treats
        quantity: 2,
      },
    }),
    prisma.subscriptionItem.create({
      data: {
        subscriptionId: subscriptions[2].id,
        productId: products[2].id, // Puppy Food
        quantity: 1,
      },
    }),
    prisma.subscriptionItem.create({
      data: {
        subscriptionId: subscriptions[3].id,
        productId: products[3].id, // Senior Cat Food
        quantity: 1,
      },
    }),
  ]);

  console.log("📋 Created subscription items:", subscriptionItems.length);

  console.log("✅ Database seeding completed successfully!");
  console.log("📊 Summary:");
  console.log(`   👥 Users: ${users.length}`);
  console.log(`   🛍️  Products: ${products.length}`);
  console.log(`   🐾 Pet Profiles: ${petProfiles.length}`);
  console.log(`   📦 Orders: ${orders.length}`);
  console.log(`   📋 Order Items: ${orderItems.length}`);
  console.log(`   📅 Subscriptions: ${subscriptions.length}`);
  console.log(`   📋 Subscription Items: ${subscriptionItems.length}`);
  console.log("");
  console.log("🔑 Test Accounts:");
  console.log("   Customer: john@example.com / Password123");
  console.log("   Admin: admin@kibbledrop.com / Password123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
