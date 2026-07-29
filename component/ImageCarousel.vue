<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-vue-next';
import { useSwipe } from '@vueuse/core';

export interface CarouselImage {
  src: string;
  alt?: string;
}

interface Props {
  images: Array<CarouselImage | string>;
  /** Controlled slide index (optional — defaults to internal state). */
  modelValue?: number;
  ariaLabel?: string;
  /** How images fill the frame. */
  fit?: 'cover' | 'contain';
  /** Extra classes on the outer frame. */
  frameClass?: string;
  /** Extra classes on each <img>. */
  imageClass?: string;
  /** Chevron control size. */
  arrowSize?: 'sm' | 'md' | 'lg';
  /** Keep chevrons visible on desktop (default: hide until hover on md+). */
  arrowsAlwaysVisible?: boolean;
  /** Prefetch all slide sources on mount. */
  preload?: boolean;
  /** Emit `select` on click when the gesture wasn't a swipe. */
  clickable?: boolean;
  /** Show a placeholder icon when an image fails to load. */
  showErrorFallback?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  fit: 'contain',
  arrowSize: 'md',
  arrowsAlwaysVisible: false,
  preload: true,
  clickable: false,
  showErrorFallback: false,
});

const emit = defineEmits<{
  'update:modelValue': [index: number];
  select: [index: number];
}>();

const slides = computed(() =>
  props.images.map((item) =>
    typeof item === 'string' ? { src: item, alt: '' } : { src: item.src, alt: item.alt ?? '' },
  ),
);

const internalIndex = ref(props.modelValue ?? 0);
const activeIndex = computed({
  get: () => props.modelValue ?? internalIndex.value,
  set: (value: number) => {
    internalIndex.value = value;
    emit('update:modelValue', value);
  },
});

watch(
  () => props.modelValue,
  (value) => {
    if (typeof value === 'number') internalIndex.value = value;
  },
);

watch(
  slides,
  (next) => {
    if (next.length === 0) {
      activeIndex.value = 0;
      return;
    }
    if (activeIndex.value >= next.length) {
      activeIndex.value = next.length - 1;
    }
  },
);

const currentSlide = computed(() => slides.value[activeIndex.value]);
const failed = ref<Record<string, boolean>>({});
const rootRef = ref<HTMLElement | null>(null);
const didSwipe = ref(false);

const count = computed(() => slides.value.length);
const hasMultiple = computed(() => count.value > 1);

const next = () => {
  if (!hasMultiple.value) return;
  activeIndex.value = (activeIndex.value + 1) % count.value;
};

const prev = () => {
  if (!hasMultiple.value) return;
  activeIndex.value = (activeIndex.value - 1 + count.value) % count.value;
};

const goTo = (index: number) => {
  if (index === activeIndex.value || index < 0 || index >= count.value) return;
  activeIndex.value = index;
};

const markFailed = (src: string) => {
  failed.value = { ...failed.value, [src]: true };
};

useSwipe(rootRef, {
  threshold: 40,
  onSwipeEnd(_e, direction) {
    if (!hasMultiple.value) return;
    didSwipe.value = true;
    if (direction === 'left') next();
    if (direction === 'right') prev();
  },
});

const onFrameClick = () => {
  if (!props.clickable || count.value === 0) return;
  if (didSwipe.value) {
    didSwipe.value = false;
    return;
  }
  emit('select', activeIndex.value);
};

onMounted(() => {
  if (!props.preload) return;
  for (const slide of slides.value) {
    const img = new Image();
    img.src = slide.src;
  }
});

const arrowBtnClass = computed(() => {
  const size =
    props.arrowSize === 'lg'
      ? 'h-11 w-11 sm:h-12 sm:w-12'
      : props.arrowSize === 'sm'
        ? 'h-8 w-8'
        : 'h-9 w-9';
  const visibility = props.arrowsAlwaysVisible
    ? 'opacity-100'
    : 'opacity-100 md:opacity-0 md:group-hover:opacity-100';
  const inset = props.arrowSize === 'lg' ? 'left-2 sm:left-3' : 'left-2';
  const insetRight = props.arrowSize === 'lg' ? 'right-2 sm:right-3' : 'right-2';
  return {
    size,
    visibility,
    inset,
    insetRight,
    icon: props.arrowSize === 'lg' ? 24 : props.arrowSize === 'sm' ? 16 : 18,
  };
});

defineExpose({
  next,
  prev,
  goTo,
  activeIndex,
});
</script>

<template>
  <div
    v-if="count > 0"
    ref="rootRef"
    class="group relative overflow-hidden touch-pan-y select-none"
    :class="[
      frameClass,
      clickable ? 'cursor-pointer' : '',
    ]"
    role="region"
    aria-roledescription="carousel"
    :aria-label="ariaLabel || currentSlide?.alt || 'Image carousel'"
    @click="onFrameClick"
  >
    <div
      class="relative w-full"
      :class="fit === 'cover' ? 'h-full' : 'min-h-[200px] bg-surface'"
    >
      <img
        v-for="(slide, index) in slides"
        :key="slide.src"
        :src="slide.src"
        alt=""
        class="transition-opacity duration-300"
        :class="[
          fit === 'cover'
            ? 'h-full w-full object-cover'
            : 'w-full h-auto object-contain',
          imageClass,
          index === activeIndex
            ? 'relative z-[1] opacity-100'
            : 'absolute inset-0 z-0 opacity-0 pointer-events-none',
        ]"
        draggable="false"
        @error="markFailed(slide.src)"
      />

      <div
        v-if="showErrorFallback && currentSlide && failed[currentSlide.src]"
        class="absolute inset-0 z-[2] flex items-center justify-center bg-gradient-to-br from-accent/20 via-surface to-background"
        aria-hidden="true"
      >
        <ImageIcon :size="32" class="text-accent/60" />
      </div>
    </div>

    <button
      v-if="hasMultiple"
      type="button"
      aria-label="Previous image"
      class="absolute top-1/2 -translate-y-1/2 z-10 rounded-full border border-white/20 bg-black/50 text-white flex items-center justify-center transition-opacity duration-300 hover:bg-black/70 hover:border-accent/50"
      :class="[arrowBtnClass.size, arrowBtnClass.visibility, arrowBtnClass.inset]"
      @click.stop="prev"
    >
      <ChevronLeft :size="arrowBtnClass.icon" />
    </button>
    <button
      v-if="hasMultiple"
      type="button"
      aria-label="Next image"
      class="absolute top-1/2 -translate-y-1/2 z-10 rounded-full border border-white/20 bg-black/50 text-white flex items-center justify-center transition-opacity duration-300 hover:bg-black/70 hover:border-accent/50"
      :class="[arrowBtnClass.size, arrowBtnClass.visibility, arrowBtnClass.insetRight]"
      @click.stop="next"
    >
      <ChevronRight :size="arrowBtnClass.icon" />
    </button>

    <div
      v-if="hasMultiple"
      class="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2"
    >
      <button
        v-for="(slide, index) in slides"
        :key="slide.src"
        type="button"
        class="h-1.5 rounded-full transition-all duration-300"
        :class="index === activeIndex ? 'w-5 bg-accent' : 'w-1.5 bg-white/40 hover:bg-white/70'"
        :aria-label="`Go to image ${index + 1}`"
        :aria-current="index === activeIndex ? 'true' : undefined"
        @click.stop="goTo(index)"
      />
    </div>
  </div>

  <div v-else>
    <slot name="empty" />
  </div>
</template>
