<script setup lang="ts">
import { computed, ref } from 'vue';
import { Image as ImageIcon, Film } from 'lucide-vue-next';

interface Props {
  kind: 'image' | 'video';
  src: string;
  alt?: string;
  caption?: string;
  /** Aspect hint for empty state sizing */
  aspect?: 'video' | 'wide' | 'square';
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  caption: '',
  aspect: 'wide',
});

const loaded = ref(false);
const failed = ref(false);

const showEmpty = computed(() => failed.value || !props.src);

const aspectClass = computed(() => {
  if (props.aspect === 'video') return 'aspect-video';
  if (props.aspect === 'square') return 'aspect-square';
  return 'aspect-[16/10]';
});

function onLoad() {
  loaded.value = true;
  failed.value = false;
}

function onError() {
  failed.value = true;
  loaded.value = false;
}
</script>

<template>
  <figure class="blog-demo w-full min-w-0">
    <div
      class="relative overflow-hidden rounded-xl border border-white/10 bg-surface"
      :class="showEmpty || (kind === 'image' && !loaded) ? aspectClass : ''"
    >
      <!-- Empty / missing asset -->
      <div
        v-if="showEmpty"
        class="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"
        role="status"
      >
        <component
          :is="kind === 'video' ? Film : ImageIcon"
          :size="28"
          class="text-accent/60"
          aria-hidden="true"
        />
        <p class="font-dm text-xs uppercase tracking-[0.14em] text-muted">
          {{ kind === 'video' ? 'Demo video coming soon' : 'Demo screenshot coming soon' }}
        </p>
        <p v-if="src" class="max-w-md break-all text-[11px] text-white/30 font-mono">
          Drop file at {{ src }}
        </p>
      </div>

      <img
        v-if="kind === 'image'"
        :src="src"
        :alt="alt"
        class="block w-full h-auto"
        :class="failed ? 'invisible absolute' : ''"
        loading="lazy"
        decoding="async"
        @load="onLoad"
        @error="onError"
      />

      <video
        v-else
        :src="src"
        class="block w-full h-auto"
        :class="failed ? 'invisible absolute' : ''"
        controls
        playsinline
        preload="metadata"
        @loadeddata="onLoad"
        @error="onError"
      >
        <track kind="captions" />
      </video>
    </div>

    <figcaption
      v-if="caption"
      class="mt-3 text-xs md:text-sm text-muted leading-relaxed"
    >
      {{ caption }}
    </figcaption>
  </figure>
</template>
