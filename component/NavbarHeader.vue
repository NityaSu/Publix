<script setup lang="ts">
import { ref } from 'vue';
import { Menu, X } from 'lucide-vue-next';

interface NavLink {
  label: string;
  to: string;
}

const navLinks: NavLink[] = [
  { label: 'about', to: '/about' },
  { label: 'projects', to: '/projects' },
  { label: 'thesis', to: '/thesis' },
  { label: 'contact', to: '/contact' },
];

const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};
</script>

<template>
  <header class="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-white/10">
    <nav class="max-w-7xl mx-auto px-6 md:px-10">
      <div class="flex items-center justify-between h-16 md:h-20">
        <NuxtLink
          to="/"
          class="font-display font-extrabold tracking-tight text-lg md:text-xl text-white hover:text-accent transition-colors"
          @click="closeMobileMenu"
        >
          SUONNITYA
        </NuxtLink>

        <div class="hidden md:flex items-center gap-8">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="text-sm lowercase tracking-wide text-muted hover:text-accent transition-colors"
            active-class="text-accent"
          >
            {{ link.label }}
          </NuxtLink>
        </div>

        <button
          type="button"
          class="md:hidden text-white hover:text-accent transition-colors"
          aria-label="Toggle navigation menu"
          @click="toggleMobileMenu"
        >
          <X v-if="isMobileMenuOpen" :size="24" />
          <Menu v-else :size="24" />
        </button>
      </div>

      <div
        v-if="isMobileMenuOpen"
        class="md:hidden flex flex-col gap-4 pb-6 border-t border-white/10 pt-4"
      >
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="text-sm lowercase tracking-wide text-muted hover:text-accent transition-colors"
          active-class="text-accent"
          @click="closeMobileMenu"
        >
          {{ link.label }}
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>
