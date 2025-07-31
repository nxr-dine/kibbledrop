import ClientProductsPage from "./client-page"
import { prisma } from "@/lib/prisma"

interface ProductsPageProps {
  searchParams?: { category?: string; petType?: string }
}

async function getProducts(category?: string, petType?: string) {
  try {
    const where: any = {}
    
    if (category && category !== 'all') {
      where.category = category
    }
    
    if (petType && petType !== 'all') {
      where.petType = petType
    }
    
    const products = await prisma.product.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })
    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const products = await getProducts(searchParams?.category, searchParams?.petType)

  return <ClientProductsPage initialProducts={products} />
}
