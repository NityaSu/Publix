// types/cartTypes.ts

/**
 * Product variant (size, color, etc.)
 */
export interface ProductVariant {
    id: string
    name: string
    value: string
    price?: number // Additional price for this variant
  }
  
  /**
   * Product image
   */
  export interface ProductImage {
    id: string
    url: string
    alt: string
    isPrimary: boolean
  }
  
  /**
   * Base product information
   */
  export interface Product {
    id: string
    name: string
    description?: string
    slug: string
    price: number
    originalPrice?: number // For showing discounts
    discount?: number // Percentage discount
    currency: string
    category: string
    subcategory?: string
    brand?: string
    sku: string
    stock: number
    images: ProductImage[]
    rating?: number
    reviewCount?: number
    tags?: string[]
    createdAt: string
    updatedAt: string
  }
  
  /**
   * Selected product variants for cart item
   */
  export interface SelectedVariants {
    size?: string
    color?: string
    [key: string]: string | undefined
  }
  
  /**
   * Cart item with selected variants
   */
  export interface CartItem {
    id: string // Unique cart item ID
    productId: string
    product: Product
    quantity: number
    selectedVariants?: SelectedVariants
    addedAt: string
    price: number // Price at the time of adding to cart
  }
  
  /**
   * Cart summary/totals
   */
  export interface CartSummary {
    subtotal: number
    shipping: number
    tax: number
    discount: number
    total: number
    itemCount: number
    currency: string
  }
  export interface ShippingMethod {
    id: string
    name: string
    description: string
    price: number
    estimatedDays: string
    icon?: string
  }
  export interface PromoCode {
    code: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
    minPurchase?: number
    maxDiscount?: number
    expiresAt?: string
    isValid: boolean
  }
  export interface CartState {
    items: CartItem[]
    isOpen: boolean
    isLoading: boolean
    selectedShipping?: ShippingMethod
    promoCode?: PromoCode
    lastUpdated?: string
  }
  export interface AddToCartPayload {
    product: Product
    quantity: number
    selectedVariants?: SelectedVariants
  }
  export interface UpdateCartItemPayload {
    cartItemId: string
    quantity?: number
    selectedVariants?: SelectedVariants
  }
  export interface CartApiResponse {
    success: boolean
    message?: string
    data?: CartState
    errors?: string[]
  }