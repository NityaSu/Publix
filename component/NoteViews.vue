<script setup lang="ts">
import { useNoteViews } from '~/composables/useNoteViews';

const props = withDefaults(
  defineProps<{
    slug: string;
    /** List rows show the number only, like rauchg.com. */
    compact?: boolean;
  }>(),
  { compact: false },
);

const { views, viewsFormatted, ready } = useNoteViews(props.slug);

const label = computed(() =>
  props.compact ? viewsFormatted.value : `${viewsFormatted.value} views`,
);
</script>

<template>
  <span
    v-if="ready"
    class="note-views whitespace-nowrap tabular-nums"
    :title="`${viewsFormatted} views`"
    :aria-label="`${views} views`"
  >
    {{ label }}
  </span>
</template>
