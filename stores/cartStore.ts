// stores/cart.ts
import { defineStore } from 'pinia'
import type { 
  CartState, 
  CartItem, 
  AddToCartPayload, 
  UpdateCartItemPayload,
  CartSummary,
  ShippingMethod,
  PromoCode
} from '../common/types/cartType'

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    isOpen: false,
    isLoading: false,
    selectedShipping: undefined,
    promoCode: undefined,
    lastUpdated: undefined
  }),
  
  getters: {
    // Total number of items (quantity-based)
    itemCount(state): number {
      return state.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    
    // Total number of unique products
    uniqueItemCount(state): number {
      return state.items.length
    },
    
    // Subtotal before tax and shipping
    subtotal(state): number {
      return state.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity)
      }, 0)
    },
    
    // Calculate shipping cost
    shippingCost(state): number {
      return state.selectedShipping?.price || 0
    },
    
    // Calculate tax (example: 10%)
    tax(): number {
      return this.subtotal * 0.1
    },
    
    // Calculate discount from promo code
    discount(state): number {
      if (!state.promoCode || !state.promoCode.isValid) return 0
      
      if (state.promoCode.discountType === 'percentage') {
        const discount = this.subtotal * (state.promoCode.discountValue / 100)
        return state.promoCode.maxDiscount 
          ? Math.min(discount, state.promoCode.maxDiscount)
          : discount
      }
      
      return state.promoCode.discountValue
    },
    
    // Final total
    total(): number {
      return Math.max(0, this.subtotal + this.shippingCost + this.tax - this.discount)
    },
    
    // Get cart summary
    summary(state): CartSummary {
      return {
        subtotal: this.subtotal,
        shipping: this.shippingCost,
        tax: this.tax,
        discount: this.discount,
        total: this.total,
        itemCount: this.itemCount,
        currency: state.items[0]?.product.currency || 'USD'
      }
    },
    
    // Check if cart is empty
    isEmpty(state): boolean {
      return state.items.length === 0
    },
    
    // Find item by product ID and variants
    findItem(state) {
      return (productId: string, variants?: Record<string, string>): CartItem | undefined => {
        return state.items.find(item => {
          if (item.productId !== productId) return false
          
          if (!variants) return !item.selectedVariants
          
          return JSON.stringify(item.selectedVariants) === JSON.stringify(variants)
        })
      }
    }
  },
  
  actions: {
    // Add item to cart
    addItem(payload: AddToCartPayload): void {
      const { product, quantity, selectedVariants } = payload
      
      // Check if item already exists with same variants
      const existingItem = this.findItem(product.id, selectedVariants)
      
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        const newItem: CartItem = {
          id: `${product.id}-${Date.now()}`,
          productId: product.id,
          product,
          quantity,
          selectedVariants,
          addedAt: new Date().toISOString(),
          price: product.price
        }
        this.items.push(newItem)
      }
      
      this.lastUpdated = new Date().toISOString()
    },
    
    // Remove item from cart
    removeItem(cartItemId: string): void {
      this.items = this.items.filter(item => item.id !== cartItemId)
      this.lastUpdated = new Date().toISOString()
    },
    
    // Update item quantity
    updateQuantity(cartItemId: string, quantity: number): void {
      const item = this.items.find(item => item.id === cartItemId)
      if (item) {
        if (quantity <= 0) {
          this.removeItem(cartItemId)
        } else {
          item.quantity = quantity
          this.lastUpdated = new Date().toISOString()
        }
      }
    },
    
    // Update item
    updateItem(payload: UpdateCartItemPayload): void {
      const item = this.items.find(item => item.id === payload.cartItemId)
      if (item) {
        if (payload.quantity !== undefined) {
          item.quantity = payload.quantity
        }
        if (payload.selectedVariants !== undefined) {
          item.selectedVariants = payload.selectedVariants
        }
        this.lastUpdated = new Date().toISOString()
      }
    },
    
    // Clear entire cart
    clearCart(): void {
      this.items = []
      this.promoCode = undefined
      this.selectedShipping = undefined
      this.lastUpdated = new Date().toISOString()
    },
    
    // Toggle cart drawer
    toggleCart(): void {
      this.isOpen = !this.isOpen
    },
    
    // Open cart drawer
    openCart(): void {
      this.isOpen = true
    },
    
    // Close cart drawer
    closeCart(): void {
      this.isOpen = false
    },
    
    // Set shipping method
    setShipping(method: ShippingMethod): void {
      this.selectedShipping = method
    },
    
    // Apply promo code
    applyPromoCode(code: PromoCode): void {
      // Validate minimum purchase
      if (code.minPurchase && this.subtotal < code.minPurchase) {
        code.isValid = false
        return
      }
      
      this.promoCode = code
    },
    
    // Remove promo code
    removePromoCode(): void {
      this.promoCode = undefined
    },
    
    // Load cart from localStorage
    loadFromStorage(): void {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart)
          this.items = parsed.items || []
          this.selectedShipping = parsed.selectedShipping
          this.promoCode = parsed.promoCode
        } catch (error) {
          console.error('Failed to load cart from storage:', error)
        }
      }
    },
    
    // Save cart to localStorage
    saveToStorage(): void {
      try {
        localStorage.setItem('cart', JSON.stringify({
          items: this.items,
          selectedShipping: this.selectedShipping,
          promoCode: this.promoCode,
          lastUpdated: this.lastUpdated
        }))
      } catch (error) {
        console.error('Failed to save cart to storage:', error)
      }
    }
  }
})