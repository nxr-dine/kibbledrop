export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: "dog" | "cat"
  image: string
  featured?: boolean
}

export interface Order {
  id: string
  date: string
  status: "active" | "delivered" | "cancelled"
  total: number
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  nextDelivery?: string
}

export interface PetProfile {
  id: string
  name: string
  type: "dog" | "cat"
  breed: string
  age: number
  weight: number
  healthNotes?: string
}

export const products: Product[] = [
  {
    id: "1",
    name: "Premium Dog Food - Chicken & Rice",
    description: "High-quality protein with wholesome grains for adult dogs",
    price: 29.99,
    category: "dog",
    image: "/placeholder.svg?height=300&width=300&text=Dog+Food",
    featured: true,
  },
  {
    id: "2",
    name: "Grain-Free Cat Food - Salmon",
    description: "Wild-caught salmon with sweet potato for sensitive cats",
    price: 34.99,
    category: "cat",
    image: "/placeholder.svg?height=300&width=300&text=Cat+Food",
    featured: true,
  },
  {
    id: "3",
    name: "Puppy Formula - Turkey & Vegetables",
    description: "Specially formulated nutrition for growing puppies",
    price: 32.99,
    category: "dog",
    image: "/placeholder.svg?height=300&width=300&text=Puppy+Food",
  },
  {
    id: "4",
    name: "Senior Cat Food - Chicken & Pumpkin",
    description: "Easy-to-digest formula for senior cats",
    price: 31.99,
    category: "cat",
    image: "/placeholder.svg?height=300&width=300&text=Senior+Cat",
  },
  {
    id: "5",
    name: "Large Breed Dog Food - Beef & Barley",
    description: "Balanced nutrition for large breed dogs",
    price: 39.99,
    category: "dog",
    image: "/placeholder.svg?height=300&width=300&text=Large+Breed",
  },
  {
    id: "6",
    name: "Indoor Cat Food - Fish & Rice",
    description: "Lower calorie formula for indoor cats",
    price: 28.99,
    category: "cat",
    image: "/placeholder.svg?height=300&width=300&text=Indoor+Cat",
  },
]

export const orders: Order[] = [
  {
    id: "SUB-001",
    date: "2024-01-15",
    status: "active",
    total: 64.98,
    nextDelivery: "2024-02-15",
    items: [
      { name: "Premium Dog Food - Chicken & Rice", quantity: 1, price: 29.99 },
      { name: "Grain-Free Cat Food - Salmon", quantity: 1, price: 34.99 },
    ],
  },
  {
    id: "SUB-002",
    date: "2023-12-15",
    status: "delivered",
    total: 29.99,
    items: [{ name: "Premium Dog Food - Chicken & Rice", quantity: 1, price: 29.99 }],
  },
  {
    id: "SUB-003",
    date: "2023-11-15",
    status: "cancelled",
    total: 62.98,
    items: [
      { name: "Puppy Formula - Turkey & Vegetables", quantity: 1, price: 32.99 },
      { name: "Senior Cat Food - Chicken & Pumpkin", quantity: 1, price: 31.99 },
    ],
  },
]

export const petProfiles: PetProfile[] = [
  {
    id: "pet_1",
    name: "Buddy",
    type: "dog",
    breed: "Golden Retriever",
    age: 3,
    weight: 65,
    healthNotes: "No known allergies",
  },
  {
    id: "pet_2",
    name: "Whiskers",
    type: "cat",
    breed: "Siamese",
    age: 5,
    weight: 10,
    healthNotes: "Sensitive stomach",
  },
]
