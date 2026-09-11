<script setup lang="ts">
const paths = [
  'M45 35 C55 30, 65 35, 62 45 C68 50, 65 60, 55 62 C50 70, 40 68, 38 58 C30 55, 32 45, 38 42 C40 38, 42 36, 45 35Z',
  'M48 36 C46 28, 44 18, 46 10 C48 6, 52 6, 54 10 C56 18, 52 28, 50 36Z',
  'M58 40 C65 34, 75 28, 84 26 C88 26, 90 30, 88 34 C82 40, 72 42, 62 44Z',
  'M60 52 C68 56, 78 62, 84 70 C86 74, 82 78, 78 76 C70 72, 64 64, 58 56Z',
  'M50 60 C52 68, 54 78, 52 88 C50 92, 46 92, 44 88 C42 78, 46 68, 48 60Z',
  'M42 56 C36 62, 28 70, 20 74 C16 76, 12 72, 14 68 C20 60, 30 54, 38 50Z',
  'M40 44 C32 40, 22 36, 14 32 C10 30, 10 26, 14 24 C22 22, 32 28, 42 36Z',
];
</script>

<template>
  <article
    class="relative h-[168px] w-full max-w-[420px] overflow-hidden rounded-[10px] border border-[#e7e5e4] bg-[#fafaf8] text-[#1c1917] shadow-[0_12px_28px_rgba(12,10,9,0.28)]"
    aria-label="Supersynapse"
  >
    <header class="flex items-center justify-between border-b border-[#e7e5e4] bg-[#fafaf8]/90 px-3 py-2">
      <div class="flex items-center gap-2">
        <span class="relative inline-flex size-[22px] items-center justify-center text-[#ff6600]">
          <span
            class="pointer-events-none absolute inset-[-3px] rounded-full border-[1.5px] border-[#ff6600]/35 supersynapse-ring"
            aria-hidden="true"
          />
          <svg viewBox="0 0 100 100" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path v-for="d in paths" :key="d" :d="d" />
          </svg>
        </span>
        <span class="font-display text-[11px] font-bold tracking-[-0.3px]">Supersynapse</span>
      </div>
      <span
        class="inline-flex items-center gap-1.5 rounded-md border border-[#e7e5e4] bg-white px-2 py-1 text-[9px] text-[#78716c]"
      >
        Search
        <kbd class="rounded border border-[#e7e5e4] bg-[#fafaf8] px-1 font-mono text-[8px]">⌘K</kbd>
      </span>
    </header>

    <div class="flex h-[calc(100%-37px)] flex-col justify-center gap-1.5 px-2.5 py-2">
      <article class="rounded-[8px] border border-[#e7e5e4] bg-white px-2.5 py-1.5">
        <p class="text-[9px] leading-[14px] text-[#44403c]">
          Save notes by space. Search them. Ask over what you stored.
        </p>
        <div class="mt-1.5 flex items-center justify-between">
          <span class="rounded-full bg-[rgba(59,130,246,0.1)] px-1.5 py-0.5 text-[7px] font-semibold text-[#3B82F6]">
            Work
          </span>
          <span class="text-[7px] text-[#a8a29e]">2h ago</span>
        </div>
      </article>
      <article class="rounded-[8px] border border-[#e7e5e4] bg-white px-2.5 py-1.5">
        <p class="text-[9px] leading-[14px] text-[#44403c]">
          Documents get chunked, embedded, and dreamed into a graph.
        </p>
        <div class="mt-1.5 flex items-center justify-between">
          <span class="rounded-full bg-[rgba(139,92,246,0.1)] px-1.5 py-0.5 text-[7px] font-semibold text-[#8B5CF6]">
            Learning
          </span>
          <span class="flex items-center gap-1 text-[7px] font-semibold text-[#ff6600]">
            <span class="size-1 rounded-full bg-[#ff6600]" />
            92% match
          </span>
        </div>
      </article>
    </div>
  </article>
</template>

<style scoped>
@keyframes supersynapse-breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.04);
    opacity: 1;
  }
}

.supersynapse-ring {
  animation: supersynapse-breathe 5s ease-in-out infinite;
}
</style>
