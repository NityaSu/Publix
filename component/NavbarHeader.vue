<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { Menu, X, ChevronDown, Film, Image as ImageIcon } from 'lucide-vue-next';
import { useNavigationStore, type MediaFilter } from '~/stores/navigationStore';

interface DropdownChild {
  label: string;
  filter: MediaFilter;
  icon: typeof Film;
}

interface NavLink {
  label: string;
  type: 'route' | 'anchor' | 'dropdown';
  to?: string;
  children?: DropdownChild[];
}

const navLinks: NavLink[] = [
  { label: 'about', type: 'anchor', to: '/#about' },
  {
    label: 'media',
    type: 'dropdown',
    children: [
      { label: 'Watch Reel', filter: 'video', icon: Film },
      { label: 'Photo', filter: 'photo', icon: ImageIcon },
    ],
  },
  { label: 'projects', type: 'route', to: '/projects' },
  { label: 'thesis', type: 'route', to: '/thesis' },
  { label: 'contact', type: 'route', to: '/contact' },
];

const route = useRoute();
const navigationStore = useNavigationStore();

const isMobileMenuOpen = ref(false);
const isMobileMediaOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
  isMobileMediaOpen.value = false;
};

const NAV_LINK_BASE =
  "relative pb-1 text-base lg:text-lg xl:text-[22px] lowercase tracking-wide transition-colors after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 after:content-['']";

const isLinkActive = (link: NavLink): boolean => {
  if (link.type === 'anchor') return navigationStore.isAboutInView;
  if (link.type === 'route') return route.path === link.to;
  return false;
};

const navLinkClass = (link: NavLink): string => {
  if (isLinkActive(link)) {
    return `${NAV_LINK_BASE} text-accent after:w-full`;
  }
  return `${NAV_LINK_BASE} text-white hover:text-accent after:w-0 hover:after:w-full`;
};

const mediaLinkClass = (): string => {
  const base = `${NAV_LINK_BASE} flex items-center gap-1`;
  if (navigationStore.isMediaInView) {
    return `${base} text-accent after:w-full`;
  }
  return `${base} text-white group-hover:text-accent after:w-0 group-hover:after:w-full`;
};

const scrollToMedia = async () => {
  if (route.path !== '/') {
    await navigateTo('/');
    await nextTick();
  }
  document.getElementById('media')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const selectMediaFilter = (filter: MediaFilter) => {
  navigationStore.setMediaFilter(filter);
  closeMobileMenu();
  scrollToMedia();
};
</script>

<template>
  <header class="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-white/10">
    <nav class="w-full px-5 sm:px-6 md:px-10 lg:px-16 xl:px-[120px]">
      <div class="flex items-center justify-between gap-4 h-14 sm:h-16 md:h-20">
        <NuxtLink
          to="/"
          class="font-display font-extrabold tracking-tight text-white hover:text-accent transition-colors whitespace-nowrap text-[clamp(1.15rem,3.5vw,2.625rem)] min-w-0"
          @click="closeMobileMenu"
        >
          NITYA SUON
        </NuxtLink>

        <div class="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8 shrink-0">
          <template v-for="link in navLinks" :key="link.label">
            <NuxtLink
              v-if="link.type !== 'dropdown'"
              :to="link.to!"
              :class="navLinkClass(link)"
            >
              {{ link.label }}
            </NuxtLink>

            <div v-else class="relative group">
              <button
                type="button"
                :class="mediaLinkClass()"
                @click="selectMediaFilter('all')"
              >
                {{ link.label }}
                <ChevronDown :size="18" class="transition-transform duration-200 group-hover:rotate-180" />
              </button>

              <div
                class="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all duration-200 absolute left-0 top-full pt-2 min-w-[140px]"
              >
                <div class="rounded-lg border border-white/10 bg-surface py-2 shadow-glow-sm">
                  <button
                    v-for="child in link.children"
                    :key="child.filter"
                    type="button"
                    class="flex w-full items-center gap-2 px-4 py-2 text-sm lowercase text-muted hover:text-accent hover:bg-white/5 transition-colors"
                    @click="selectMediaFilter(child.filter)"
                  >
                    <component :is="child.icon" :size="14" />
                    {{ child.label }}
                  </button>
                </div>
              </div>
            </div>
          </template>
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
        <template v-for="link in navLinks" :key="link.label">
          <NuxtLink
            v-if="link.type !== 'dropdown'"
            :to="link.to!"
            class="text-sm lowercase tracking-wide transition-colors"
            :class="isLinkActive(link) ? 'text-accent' : 'text-white hover:text-accent'"
            @click="closeMobileMenu"
          >
            {{ link.label }}
          </NuxtLink>

          <div v-else>
            <button
              type="button"
              class="flex items-center justify-between w-full text-sm lowercase tracking-wide transition-colors"
              :class="navigationStore.isMediaInView ? 'text-accent' : 'text-white hover:text-accent'"
              @click="isMobileMediaOpen = !isMobileMediaOpen"
            >
              <span>{{ link.label }}</span>
              <ChevronDown
                :size="14"
                class="transition-transform duration-200"
                :class="isMobileMediaOpen ? 'rotate-180' : ''"
              />
            </button>

            <div v-show="isMobileMediaOpen" class="mt-3 ml-4 flex flex-col gap-3">
              <button
                v-for="child in link.children"
                :key="child.filter"
                type="button"
                class="flex items-center gap-2 text-sm lowercase text-muted hover:text-accent transition-colors"
                @click="selectMediaFilter(child.filter)"
              >
                <component :is="child.icon" :size="14" />
                {{ child.label }}
              </button>
            </div>
          </div>
        </template>
      </div>
    </nav>
  </header>
</template>
