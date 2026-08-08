<script setup lang="ts">
import { ref, nextTick, type Component } from 'vue';
import { useRoute } from 'vue-router';
import {
  Menu,
  X,
  ChevronDown,
  Film,
  Image as ImageIcon,
  Lightbulb,
  NotebookPen,
} from 'lucide-vue-next';
import { useNavigationStore, type MediaFilter } from '~/stores/navigationStore';
import KimiLogo from '~/component/KimiLogo.vue';
import IntroDialog from '~/component/IntroDialog.vue';

interface DropdownChild {
  label: string;
  icon?: Component;
  filter?: MediaFilter;
  scrollTo?: string;
  to?: string;
}

interface NavLink {
  label: string;
  type: 'route' | 'anchor' | 'dropdown';
  to?: string;
  children?: DropdownChild[];
}

const navLinks: NavLink[] = [
  { label: 'About', type: 'anchor', to: '/#about' },
  {
    label: 'Media',
    type: 'dropdown',
    children: [
      { label: 'Watch Reel', filter: 'video', icon: Film },
      { label: 'Photo', filter: 'photo', icon: ImageIcon },
    ],
  },
  {
    label: 'Insights',
    type: 'dropdown',
    children: [
      { label: 'My Thoughts', to: '/insights', icon: Lightbulb },
      { label: 'Build notes', to: '/insights/notes', icon: NotebookPen },
    ],
  },
  { label: 'Projects', type: 'route', to: '/projects' },
  { label: 'Thesis', type: 'route', to: '/thesis' },
  { label: 'Contact', type: 'route', to: '/contact' },
];

const route = useRoute();
const navigationStore = useNavigationStore();

const isMobileMenuOpen = ref(false);
const mobileOpenDropdown = ref<string | null>(null);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  if (!isMobileMenuOpen.value) {
    mobileOpenDropdown.value = null;
  }
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
  mobileOpenDropdown.value = null;
};

const toggleMobileDropdown = (label: string) => {
  mobileOpenDropdown.value = mobileOpenDropdown.value === label ? null : label;
};

const NAV_LINK_BASE =
  "relative pb-1 text-base lg:text-lg xl:text-[22px] font-semibold tracking-wide transition-colors after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 after:content-['']";

const isDropdownActive = (link: NavLink): boolean => {
  if (link.label === 'Media') return navigationStore.isMediaInView;
  if (link.label === 'Insights') {
    return route.path === '/insights' || route.path.startsWith('/insights/');
  }
  return false;
};

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

const dropdownLinkClass = (link: NavLink): string => {
  const base = `${NAV_LINK_BASE} flex items-center gap-1`;
  if (isDropdownActive(link)) {
    return `${base} text-accent after:w-full`;
  }
  return `${base} text-white group-hover:text-accent after:w-0 group-hover:after:w-full`;
};

const scrollToId = async (id: string) => {
  if (route.path !== '/') {
    await navigateTo('/');
    await nextTick();
  }
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const onDropdownParentClick = async (link: NavLink) => {
  if (link.label === 'Media') {
    navigationStore.setMediaFilter('all');
    closeMobileMenu();
    await scrollToId('media');
    return;
  }
  if (link.label === 'Insights') {
    closeMobileMenu();
    await navigateTo('/insights');
  }
};

const selectDropdownChild = async (child: DropdownChild) => {
  closeMobileMenu();
  if (child.filter) {
    navigationStore.setMediaFilter(child.filter);
    await scrollToId('media');
    return;
  }
  if (child.to) {
    await navigateTo(child.to);
    return;
  }
  if (child.scrollTo) {
    await scrollToId(child.scrollTo);
  }
};

const goHomeTop = async () => {
  closeMobileMenu();
  if (route.path !== '/') {
    await navigateTo('/');
    await nextTick();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<template>
  <header class="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-white/10">
    <nav class="w-full px-5 sm:px-6 md:px-10 lg:px-16 xl:px-[120px]">
      <div class="flex items-center justify-between gap-4 h-14 sm:h-16 md:h-20">
        <div class="relative inline-flex items-center gap-2.5 sm:gap-3 min-w-0">
          <KimiLogo small />
          <IntroDialog position="header-bot" />
          <NuxtLink
            to="/"
            class="font-brand font-extrabold tracking-tight text-white hover:text-accent transition-colors whitespace-nowrap text-[clamp(1.15rem,3.5vw,2.625rem)]"
            @click="goHomeTop"
          >
            NITYA SUON
          </NuxtLink>
        </div>

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
                :class="dropdownLinkClass(link)"
                @click="onDropdownParentClick(link)"
              >
                {{ link.label }}
                <ChevronDown :size="18" class="transition-transform duration-200 group-hover:rotate-180" />
              </button>

              <div
                class="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all duration-200 absolute left-0 top-full pt-2 min-w-[160px]"
              >
                <div class="rounded-lg border border-white/10 bg-surface py-2 shadow-glow-sm">
                  <button
                    v-for="child in link.children"
                    :key="child.label"
                    type="button"
                    class="flex w-full items-center gap-2 px-4 py-2 font-dm font-medium text-sm text-muted hover:text-accent hover:bg-white/5 transition-colors"
                    @click="selectDropdownChild(child)"
                  >
                    <component :is="child.icon" v-if="child.icon" :size="14" />
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
            class="text-sm font-semibold tracking-wide transition-colors"
            :class="isLinkActive(link) ? 'text-accent' : 'text-white hover:text-accent'"
            @click="closeMobileMenu"
          >
            {{ link.label }}
          </NuxtLink>

          <div v-else>
            <button
              type="button"
              class="flex items-center justify-between w-full text-sm font-semibold tracking-wide transition-colors"
              :class="isDropdownActive(link) ? 'text-accent' : 'text-white hover:text-accent'"
              @click="toggleMobileDropdown(link.label)"
            >
              <span>{{ link.label }}</span>
              <ChevronDown
                :size="14"
                class="transition-transform duration-200"
                :class="mobileOpenDropdown === link.label ? 'rotate-180' : ''"
              />
            </button>

            <div v-show="mobileOpenDropdown === link.label" class="mt-3 ml-4 flex flex-col gap-3">
              <button
                v-for="child in link.children"
                :key="child.label"
                type="button"
                class="flex items-center gap-2 font-dm font-medium text-sm text-muted hover:text-accent transition-colors"
                @click="selectDropdownChild(child)"
              >
                <component :is="child.icon" v-if="child.icon" :size="14" />
                {{ child.label }}
              </button>
            </div>
          </div>
        </template>
      </div>
    </nav>
  </header>
</template>
