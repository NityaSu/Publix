import { computed } from 'vue';

/**
 * Individual Build Notes hide the site nav (NITYA SUON … Contact)
 * so the note can fill the window. The notes index keeps the nav.
 */
export function useInsightsImmersive() {
  const route = useRoute();

  const immersive = computed(() => {
    const path = route.path.replace(/\/+$/, '') || '/';
    return path.startsWith('/insights/notes/');
  });

  return { immersive };
}
