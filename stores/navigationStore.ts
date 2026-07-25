import { defineStore } from 'pinia';

export type MediaFilter = 'all' | 'video' | 'photo';

interface NavigationState {
  isAboutInView: boolean;
  isMediaInView: boolean;
  mediaFilter: MediaFilter;
}

/**
 * Tracks which in-page section is currently visible, and the active
 * media filter, so the navbar (mounted globally, outside NuxtPage) and
 * the media section (which lives on the home page) can stay in sync
 * without a direct parent/child relationship.
 */
export const useNavigationStore = defineStore('navigation', {
  state: (): NavigationState => ({
    isAboutInView: false,
    isMediaInView: false,
    mediaFilter: 'photo',
  }),
  actions: {
    setMediaFilter(filter: MediaFilter): void {
      this.mediaFilter = filter;
    },
  },
});
