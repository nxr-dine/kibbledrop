import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.subscriptionItem.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.petProfile.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Premium Dog Food - Chicken & Rice",
        description: "High-quality protein with wholesome grains for adult dogs",
        price: 29.99,
        category: "Food",
        petType: "Dog",
        image: "/placeholder.svg?height=300&width=300&text=Dog+Food",
        featured: true,
      }
    }),
    prisma.product.create({
      data: {
        name: "Grain-Free Cat Food - Salmon",
        description: "Wild-caught salmon with sweet potato for sensitive cats",
        price: 34.99,
        category: "Food",
        petType: "Cat",
        image: "/placeholder.svg?height=300&width=300&text=Cat+Food",
        featured: true,
      }
    }),
    prisma.product.create({
      data: {
        name: "Puppy Formula - Turkey & Vegetables",
        description: "Specially formulated nutrition for growing puppies",
        price: 32.99,
        category: "Food",
        petType: "Dog",
        image: "/placeholder.svg?height=300&width=300&text=Puppy+Food",
        featured: false,
      }
    }),
    prisma.product.create({
      data: {
        name: "Senior Cat Food - Chicken & Pumpkin",
        description: "Easy-to-digest formula for senior cats",
        price: 31.99,
        category: "Food",
        petType: "Cat",
        image: "/placeholder.svg?height=300&width=300&text=Senior+Cat",
        featured: false,
      }
    }),
    prisma.product.create({
      data: {
        name: "Large Breed Dog Food - Beef & Barley",
        description: "Balanced nutrition for large breed dogs",
        price: 39.99,
        category: "Food",
        petType: "Dog",
        image: "/placeholder.svg?height=300&width=300&text=Large+Breed",
        featured: false,
      }
    }),
    prisma.product.create({
      data: {
        name: "Indoor Cat Food - Fish & Rice",
        description: "Lower calorie formula for indoor cats",
        price: 28.99,
        category: "Food",
        petType: "Cat",
        image: "/placeholder.svg?height=300&width=300&text=Indoor+Cat",
        featured: false,
      }
    }),
    prisma.product.create({
      data: {
        name: "Dog Treats - Peanut Butter",
        description: "Natural peanut butter treats for training and rewards",
        price: 12.99,
        category: "Treats",
        petType: "Dog",
        image: "/placeholder.svg?height=300&width=300&text=Dog+Treats",
        featured: false,
      }
    }),
    prisma.product.create({
      data: {
        name: "Cat Treats - Tuna Bites",
        description: "Grain-free tuna treats for cats",
        price: 9.99,
        category: "Treats",
        petType: "Cat",
        image: "/placeholder.svg?height=300&width=300&text=Cat+Treats",
        featured: false,
      }
    })
  ])

  console.log('Database seeded with products:', products.length)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 