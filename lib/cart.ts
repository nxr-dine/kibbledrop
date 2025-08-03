import { create } from 'zustand'
import { useAuth } from '@/contexts/auth-context'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  category: string
  petType: string
}

interface CartStore {
  items: CartItem[]
  total: number
  isLoading: boolean
  addItem: (product: any, quantity?: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getTotal: () => number
  getItemCount: () => number
  getItem: (productId: string) => CartItem | undefined
  fetchCart: () => Promise<void>
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  total: 0,
  isLoading: false,
  
  fetchCart: async () => {
    try {
      set({ isLoading: true })
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        set({ items: data.items, total: data.total })
      } else {
        // If not logged in, cart will be empty
        set({ items: [], total: 0 })
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      set({ items: [], total: 0 })
    } finally {
      set({ isLoading: false })
    }
  },
  
  addItem: async (product, quantity = 1) => {
    try {
      set({ isLoading: true })
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity
        }),
      })

      if (response.ok) {
        const data = await response.json()
        set({ items: data.items, total: data.total })
      } else {
        const errorData = await response.json()
        console.error('Error adding item to cart:', errorData.error)
        // Show error to user (you might want to add a toast notification here)
      }
    } catch (error) {
      console.error('Error adding item to cart:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  removeItem: async (productId) => {
    try {
      set({ isLoading: true })
      const item = get().items.find(item => item.productId === productId)
      if (!item) return

      const response = await fetch(`/api/cart/${item.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        set({ items: data.items, total: data.total })
      } else {
        console.error('Error removing item from cart')
      }
    } catch (error) {
      console.error('Error removing item from cart:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  updateQuantity: async (productId, quantity) => {
    try {
      set({ isLoading: true })
      const item = get().items.find(item => item.productId === productId)
      if (!item) return

      const response = await fetch(`/api/cart/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      })

      if (response.ok) {
        const data = await response.json()
        set({ items: data.items, total: data.total })
      } else {
        console.error('Error updating cart item quantity')
      }
    } catch (error) {
      console.error('Error updating cart item quantity:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  clearCart: async () => {
    try {
      set({ isLoading: true })
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      })

      if (response.ok) {
        set({ items: [], total: 0 })
      } else {
        console.error('Error clearing cart')
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  getTotal: () => {
    return get().total
  },
  
  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0)
  },
  
  getItem: (productId) => {
    return get().items.find(item => item.productId === productId)
  },
})) 