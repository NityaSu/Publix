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
    class="note-views whitespace-nowrap tabular-nums"
    :class="{ 'is-pending': !ready }"
    :title="ready ? `${viewsFormatted} views` : undefined"
    :aria-label="ready ? `${views} views` : 'Loading view count'"
    :aria-busy="!ready"
  >
    <template v-if="ready">{{ label }}</template>
    <template v-else>&nbsp;</template>
  </span>
</template>

<style scoped>
.note-views.is-pending {
  opacity: 0;
  min-width: 4ch;
}
</style>
