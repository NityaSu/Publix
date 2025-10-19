<template>
    <div class="p-10">
      <h1 class="text-2xl font-bold">{{ cartStore.message }}</h1>
      <p>Count: {{ cartStore.count }}</p>
      <button @click="cartStore.increment" class="bg-blue-500 text-white px-4 py-2 rounded">Increment</button>
      <button @click="cartStore.reset" class="bg-gray-400 text-white px-4 py-2 rounded ml-2">Reset</button>
    </div>
  </template>
  
  <script setup lang="ts">
import { useCartStore } from '../../stores/cartStore'
  
  const cartStore = useCartStore()
  </script>
  