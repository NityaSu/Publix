import { defineStore } from 'pinia';

interface NavigationState {
  isAboutInView: boolean;
}

/**
 * Tracks which in-page section is currently visible so the navbar
 * (mounted globally, outside NuxtPage) can reflect scroll position
 * rather than just the current route.
 */
export const useNavigationStore = defineStore('navigation', {
  state: (): NavigationState => ({
    isAboutInView: false,
  }),
});
