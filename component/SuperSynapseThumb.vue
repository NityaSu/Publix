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

const chips = ['All', 'Default', 'Learning', 'Personal', 'Work', 'Recent', 'Favorites'];
</script>

<template>
  <article
    class="relative flex h-full w-full flex-col justify-center overflow-hidden bg-[#fafaf8] px-3 py-2 text-[#1c1917]"
    aria-label="Supersynapse"
  >
    <div class="flex shrink-0 flex-col items-center text-center">
      <span class="relative mb-1.5 inline-flex size-[28px] items-center justify-center text-[#ff6600]">
        <span
          class="pointer-events-none absolute inset-[-4px] rounded-full border-[1.5px] border-[#ff6600]/35 supersynapse-ring"
          aria-hidden="true"
        />
        <svg viewBox="0 0 100 100" width="22" height="22" fill="currentColor" aria-hidden="true">
          <path v-for="d in paths" :key="d" :d="d" />
        </svg>
      </span>
      <h2 class="font-display text-[13px] font-bold leading-none tracking-[-0.4px]">
        What is on your mind?
      </h2>
      <p class="mt-1 max-w-[92%] text-[7.5px] leading-[1.4] text-[#78716c]">
        Drop a thought. Supersynapse will bring it back when it matters most —
        so you stress less, forget less.
      </p>
    </div>

    <div class="relative mt-2 flex h-6 shrink-0 items-center">
      <svg
        class="absolute left-2 top-1/2 size-[10px] -translate-y-1/2 text-[#a8a29e]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3-3" />
      </svg>
      <div
        class="flex h-full w-full items-center rounded-[8px] border border-[#e7e5e4] bg-white pl-7 pr-1.5 shadow-[0_1px_2px_rgb(0_0_0/0.04)]"
      >
        <span class="truncate text-[8px] text-[#a8a29e]">Search your memories...</span>
        <span
          class="ml-auto inline-flex shrink-0 items-center gap-0.5 rounded border border-[#e7e5e4] bg-[#fafaf8] px-1 py-px text-[7px] font-semibold text-[#78716c]"
        >
          <svg viewBox="0 0 12 12" width="7" height="7" fill="currentColor" aria-hidden="true">
            <path d="M6 1.2l.7 2.1H9L7.15 4.6 7.85 6.8 6 5.45 4.15 6.8l.7-2.2L3 3.3h2.3z" />
          </svg>
          Keyword
        </span>
      </div>
    </div>

    <div class="mt-1.5 flex shrink-0 gap-1 overflow-hidden">
      <span
        v-for="chip in chips"
        :key="chip"
        class="shrink-0 rounded-full border px-1.5 py-px text-[7px] font-medium"
        :class="
          chip === 'All'
            ? 'border-[#1c1917] bg-[#1c1917] text-[#fafaf8]'
            : 'border-[#e7e5e4] bg-white text-[#78716c]'
        "
      >
        {{ chip }}
      </span>
    </div>

    <div class="mt-1.5 flex shrink-0 items-center gap-1">
      <span class="size-1 rounded-full bg-[#ff6600] supersynapse-dot" aria-hidden="true" />
      <p class="font-display text-[7px] font-bold uppercase tracking-[0.1em] text-[#ff6600]">
        Resurfacing now
      </p>
      <span class="ml-auto font-mono text-[7px] text-[#a8a29e]">1 / 2</span>
    </div>

    <article
      class="relative mt-1 overflow-hidden rounded-[10px] border border-[#e7e5e4] bg-white px-2 py-1.5 text-left shadow-[0_2px_8px_rgb(0_0_0/0.05)] before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-[linear-gradient(90deg,#ff6600,#ff944d,#ff6600)] before:opacity-60"
    >
        <p class="mb-0.5 flex items-center gap-1 text-[6.5px] font-bold uppercase tracking-[0.08em] text-[#ff6600]">
          <svg viewBox="0 0 12 12" width="8" height="8" fill="currentColor" aria-hidden="true">
            <path d="M6 1.1l.65 2H8.8L7.2 4.35l.6 2L6 5.15 4.2 6.35l.6-2L3.2 3.1h2.15z" />
          </svg>
          Relevant to what you are building
        </p>
        <p class="line-clamp-2 text-[8px] leading-[1.4] text-[#44403c]">
          Learned about CRDTs (Conflict-free Replicated Data Types) today. They’re perfect for
          offline-first collaborative features.
        </p>
        <div class="mt-1 flex items-center gap-1.5">
          <span class="rounded-full bg-[rgba(139,92,246,0.1)] px-1.5 py-px text-[6.5px] font-semibold uppercase tracking-wide text-[#8B5CF6]">
            Learning
          </span>
          <span class="text-[7px] text-[#78716c]">Saved 19 hours ago</span>
        </div>
        <p class="mt-1 flex items-center gap-1 truncate border-t border-[#e7e5e4] pt-1 text-[7px] text-[#78716c]">
          <svg
            viewBox="0 0 16 16"
            width="8"
            height="8"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            class="shrink-0 text-[#a8a29e]"
            aria-hidden="true"
          >
            <path d="M6.2 9.8l3.6-3.6M7 5.2H5.4A2.4 2.4 0 003 7.6v0A2.4 2.4 0 005.4 10H7M9 10.8h1.6A2.4 2.4 0 0013 8.4v0A2.4 2.4 0 0010.6 6H9" />
          </svg>
          <span class="truncate">
            Connected to
            <span class="font-semibold text-[#ff6600]">Reading 'Designing Data-Intensive Applicat…</span>
          </span>
        </p>
      </article>
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

@keyframes supersynapse-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}

.supersynapse-ring {
  animation: supersynapse-breathe 5s ease-in-out infinite;
}

.supersynapse-dot {
  animation: supersynapse-pulse 1.8s ease-in-out infinite;
}
</style>
