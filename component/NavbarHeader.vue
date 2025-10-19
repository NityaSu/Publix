<template>
  <div class="w-full">
    <!-- Top Banner -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between h-10 text-xs">
          <div class="flex items-center gap-1">
            <Truck :size="16" />
            <span class="font-semibold">Free Standard Shipping</span>
            <span class="text-gray-600">*Conditions apply</span>
          </div>
          
          <div class="flex items-center gap-1">
            <RotateCcw :size="16" />
            <span class="font-semibold">Free Returns</span>
            <span class="text-gray-600">*Conditions apply</span>
          </div>
          
          <div class="flex items-center gap-1">
            <CreditCard :size="16" />
            <span class="font-semibold">No Hidden Fees</span>
            <span class="text-gray-600">Pricing & Tariff FAQ</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Header -->
    <div class="bg-black text-white">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center gap-6">
            <h1 class="text-4xl font-bold tracking-tight cursor-pointer">
              Publix.
            </h1>
          </div>

          <!-- Search Bar -->
          <div class="flex-1 max-w-2xl mx-8">
            <form @submit.prevent="handleSearch" class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search"
                class="w-full h-10 pl-4 pr-12 rounded-md text-black text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <button 
                type="submit"
                class="absolute right-0 top-0 h-10 w-12 bg-black text-white rounded-r-md flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <Search :size="20" />
              </button>
            </form>
          </div>

          <!-- Right Icons -->
          <div class="flex items-center gap-4">
            <button 
              class="hover:text-gray-300 transition-colors"
              aria-label="User account"
            >
              <User :size="24" />
            </button>
            
            <button 
              class="relative hover:text-gray-300 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart :size="24" />
              <span 
                v-if="cartStore.itemCount > 0" 
                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium"
              >
                {{ cartStore.itemCount }}
              </span>
              <span class="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap">
                {{ cartStore.itemCount }}
              </span>
            </button>
            
            <button 
              class="relative hover:text-gray-300 transition-colors"
              aria-label="Wishlist"
            >
              <Heart :size="24" />
              <span 
                v-if="wishlistCount > 0" 
                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium"
              >
                {{ wishlistCount }}
              </span>
              <span class="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap">
                {{ wishlistCount }}
              </span>
            </button>
            
            <button 
              class="hover:text-gray-300 transition-colors"
              aria-label="Messages"
            >
              <MessageCircle :size="24" />
            </button>
            
            <button 
              class="hover:text-gray-300 transition-colors"
              aria-label="Language"
            >
              <Globe :size="24" />
            </button>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="border-t border-gray-800">
          <div class="flex items-center gap-1 h-12 overflow-x-auto scrollbar-hide">
            <button 
              class="flex items-center gap-1 px-3 py-2 hover:bg-gray-800 rounded transition-colors whitespace-nowrap text-sm font-medium"
            >
              <Menu :size="16" />
              Categories
              <ChevronDown :size="16" />
            </button>
            
            <button
              v-for="(item, index) in navItems"
              :key="index"
              @click="navigateTo(item)"
              class="px-3 py-2 hover:bg-gray-800 rounded transition-colors whitespace-nowrap text-sm font-medium"
            >
              {{ item }}
            </button>
            
            <button 
              class="px-3 py-2 hover:bg-gray-800 rounded transition-colors whitespace-nowrap text-sm font-medium"
              aria-label="More categories"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { 
  Search, 
  User, 
  ShoppingCart, 
  Heart, 
  MessageCircle, 
  Globe,
  ChevronDown,
  Menu,
  Truck,
  RotateCcw,
  CreditCard
} from 'lucide-vue-next'
import { useCartStore } from '../stores/cartStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const cartStore = useCartStore()

const searchQuery = ref('cozy fall & winter styles')
const wishlistCount = ref(0)

const navItems = [
  'New In', 
  'Sale', 
  'Women Clothing', 
  'Kids', 
  'Curve',
  'Men Clothing', 
  'Shoes', 
  'Underwear & Sleepwear',
  'Home & Kitchen', 
  'Jewelry & Accessories',
  'Beauty & Health', 
  'Baby & Maternity', 
  'Bags & Luggage'
]

const handleSearch = () => {
  console.log('Searching for:', searchQuery.value)
  // Add your search logic here
}

const navigateTo = (item) => {
  console.log('Navigating to:', item)
  // router.push(`/category/${item.toLowerCase().replace(/\s+/g, '-')}`)
}
</script>
<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>