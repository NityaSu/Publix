<script setup lang="ts">
defineProps<{
  dragging?: boolean;
  /** Current left panel % — for aria valuetext. */
  value?: number;
  min?: number;
  max?: number;
}>();

const emit = defineEmits<{
  pointerdown: [event: PointerEvent];
  keydown: [event: KeyboardEvent];
}>();
</script>

<template>
  <div
    class="mf-split"
    :class="{ 'is-dragging': dragging }"
    role="separator"
    aria-orientation="vertical"
    aria-label="Resize panels"
    :aria-valuenow="value != null ? Math.round(value) : undefined"
    :aria-valuemin="min"
    :aria-valuemax="max"
    tabindex="0"
    @pointerdown="emit('pointerdown', $event)"
    @keydown="emit('keydown', $event)"
  >
    <span class="mf-split-grip" aria-hidden="true" />
  </div>
</template>

<style scoped>
.mf-split {
  position: relative;
  flex: 0 0 10px;
  width: 10px;
  margin: 0 -5px;
  z-index: 20;
  cursor: col-resize;
  touch-action: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.mf-split::before {
  content: '';
  position: absolute;
  inset: 0 4px;
  background: var(--mf-line, #eaeaea);
  transition: background-color 0.15s, inset 0.15s;
}

.mf-split:hover::before,
.mf-split:focus-visible::before,
.mf-split.is-dragging::before {
  inset: 0 3px;
  background: #4a9eff;
}

.mf-split:focus-visible {
  outline: none;
}

.mf-split-grip {
  position: relative;
  z-index: 1;
  width: 4px;
  height: 28px;
  border-radius: 2px;
  background: color-mix(in srgb, var(--mf-muted, #787774) 55%, transparent);
  opacity: 0;
  transition: opacity 0.15s;
}

.mf-split:hover .mf-split-grip,
.mf-split:focus-visible .mf-split-grip,
.mf-split.is-dragging .mf-split-grip {
  opacity: 1;
  background: #4a9eff;
}

@media (max-width: 860px) {
  .mf-split {
    display: none;
  }
}
</style>
