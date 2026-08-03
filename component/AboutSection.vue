<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import { useNavigationStore } from '~/stores/navigationStore';

interface Stat {
  value: string;
  label: string;
}

type JourneyPart = string | { text: string; href: string };
type JourneyPoint = string | JourneyPart[];

const journeyPoints: JourneyPoint[] = [
  "Born in Cambodia, in a society that didn't put much value on technology. One day, I took a Grab ride and the driver asked what I do for a living. I told him I work in software, but he couldn't understand or picture what that meant—even while using the Grab app right in front of me to run his own business. A little bit sad, but it's ok.",
  'Won a bronze medal at the National Math Olympiad in 2017 — the first real lesson in discipline and deep, sustained focus.',
  'Studied Computer Science at Beijing University of Technology (BJUT), Built foundation in programming, algorithms, AI foundations, NLP, Computer Vision, and Pattern Recognition coursework at the same time, while Chinese students chose only one.',
  [
    'Wrote a thesis on Semi-Supervised Object Detection by chance, because local students had first priority to choose the easy topics and left the difficult ones to international students like me. We only had 3 months to complete it, and during that same period, I had 4 final examinations—so a total of 4 exams on top of one incredibly difficult thesis. There were only around 14 students back then defending their thesis in AI, and under Supervisor ',
    { text: 'Jia Xibin', href: 'https://www.researchgate.net/profile/Xibin-Jia' },
    ', only 3 students (me and two local students). Back then, it felt like a PhD-level topic to me, and I felt I couldn\'t do that well, but I managed to push through and finish it in the end. I really wanted to leave Beijing back then and never come back.',
  ],
  'Spent years reading books on the side to fulfill my curiosity. No summer breaks, no winter breaks, no parties, no fun at all, rarely going out—read around 50,000 pages while completing 62 subjects in Beijing. My Chinese degraded in the process. In the end, I felt it couldn\'t help me much, so I stopped and refocused back on technical engineering.',
  'Returned to Cambodia and faced a hard lesson. I had always overlooked things like Frontend engineering, but ignoring those details eventually caught up to me through embarrassing failures.',
  'Currently expanding stack: building full-stack web applications from the ground up.',
];

function isLinkedPart(part: JourneyPart): part is { text: string; href: string } {
  return typeof part === 'object';
}

const stats: Stat[] = [
  { value: '2017', label: 'Math Olympiad Bronze' },
  { value: 'BJUT', label: 'CS Degree, Beijing' },
  { value: '3', label: 'Years of experience' },
  { value: '3', label: 'AI Specializations Studied' },
];

const GITHUB_USERNAME = 'NityaSu';
const GITHUB_CHART_URL = `https://ghchart.rshah.org/2f6bff/${GITHUB_USERNAME}`;
const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`;

const sectionRef = ref<HTMLElement | null>(null);
const navigationStore = useNavigationStore();

useIntersectionObserver(
  sectionRef,
  ([entry]) => {
    navigationStore.isAboutInView = entry?.isIntersecting ?? false;
  },
  { threshold: 0.35 },
);

onUnmounted(() => {
  navigationStore.isAboutInView = false;
});
</script>

<template>
  <section
    id="about"
    ref="sectionRef"
    class="bg-background py-24 md:py-32 scroll-mt-20 md:scroll-mt-24"
  >
    <div class="w-full px-6 md:px-20 lg:px-[160px] grid grid-cols-1 xl:grid-cols-12 gap-12 xl:gap-16">
      <div class="xl:col-span-7">
        <p class="flex items-center gap-2 text-xs md:text-sm font-display font-semibold uppercase tracking-[0.3em] text-accent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 80 200"
            class="h-5 w-auto shrink-0"
            aria-hidden="true"
          >
            <path
              d="M 10 10 L 70 100 L 10 190"
              fill="none"
              stroke="currentColor"
              stroke-width="16"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          The Journey
        </p>

        <h2 class="mt-4 font-display font-extrabold uppercase text-white text-3xl sm:text-4xl md:text-5xl leading-tight">
          From Bronze Medal to Breakthrough Code
        </h2>

        <div class="mt-10 space-y-5">
          <div
            v-for="(point, pointIndex) in journeyPoints"
            :key="pointIndex"
            class="flex gap-3"
          >
            <img
              src="/supermemory_bullet_split.svg"
              alt=""
              class="mt-1.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <p class="text-muted text-sm md:text-base leading-relaxed">
              <template v-if="typeof point === 'string'">
                {{ point }}
              </template>
              <template v-else>
                <template v-for="(part, partIndex) in point" :key="partIndex">
                  <a
                    v-if="isLinkedPart(part)"
                    :href="part.href"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-accent hover:underline"
                  >{{ part.text }}</a>
                  <template v-else>{{ part }}</template>
                </template>
              </template>
            </p>
          </div>
        </div>
      </div>

      <div class="xl:col-span-5 min-w-0 flex flex-col gap-5 md:gap-6">
        <div class="grid grid-cols-2 gap-5 md:gap-6">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="stat-card"
          >
            <span class="stat-card-label">{{ stat.label }}</span>
            <span class="stat-card-value">{{ stat.value }}</span>
          </div>
        </div>

        <div class="min-w-0">
          <a
            :href="GITHUB_PROFILE_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="github-chart-card group block"
            aria-label="View GitHub contribution graph for NityaSu"
          >
            <div class="github-chart-scroll">
              <img
                :src="GITHUB_CHART_URL"
                alt="GitHub contribution graph for NityaSu"
                width="663"
                height="104"
                class="github-chart-img"
                loading="lazy"
                decoding="async"
              />
            </div>
          </a>
          <p class="mt-3 text-sm text-muted italic">
            (I'm still in the trenches — writing code, researching before I build)
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stat-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: clamp(16px, 4cqi, 22px) clamp(18px, 5cqi, 28px);
  min-height: clamp(120px, 16cqi, 160px);
  overflow: hidden;
  background-color: #1450e8;
  color: #fff;
  border-radius: 8px;
  container-type: inline-size;
  min-width: 0;
}

.stat-card-label {
  font-size: clamp(10px, 2.5cqi, 11.5px);
  font-weight: 500;
  letter-spacing: 0.1em;
  line-height: 1.2;
  color: #ffffffd9;
  text-transform: uppercase;
  position: relative;
  z-index: 2;
}

.stat-card-value {
  font-size: clamp(24px, 12cqi, 48px);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1;
  color: #fff;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  z-index: 2;
}

.stat-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(120% 160% at 0% 0%, #5eb8ff 0%, #3e86f5 22%, transparent 55%),
    linear-gradient(115deg, #1450e8 0%, #0e2fdd 55%, #0a1fd8 100%);
  pointer-events: none;
  z-index: 0;
}

.stat-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.25' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='gamma' amplitude='1' exponent='1.6' offset='0'/></feComponentTransfer></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  background-size: 220px 220px;
  mix-blend-mode: overlay;
  opacity: 0.9;
  -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 30%, black 75%);
  mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 30%, black 75%);
  pointer-events: none;
  z-index: 1;
}

.github-chart-card {
  padding: 0.75rem 0.875rem 0.625rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #f6f8fa;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.github-chart-card:hover {
  border-color: rgba(47, 107, 255, 0.45);
  box-shadow: 0 0 0 1px rgba(47, 107, 255, 0.2);
}

.github-chart-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #c8cdd3 transparent;
}

.github-chart-scroll::-webkit-scrollbar {
  height: 6px;
}

.github-chart-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.github-chart-scroll::-webkit-scrollbar-thumb {
  background: #c8cdd3;
  border-radius: 999px;
}

.github-chart-img {
  display: block;
  width: 663px;
  max-width: none;
  height: auto;
}
</style>
