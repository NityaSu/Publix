<script setup lang="ts">
import { ChevronUp } from 'lucide-vue-next';
import KimiLogo from '~/component/KimiLogo.vue';

interface SocialLink {
  label: string;
  href: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  { label: 'X', href: 'https://x.com/NityaSuon' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/nityasuon/' },
  { label: 'Instagram', href: 'https://www.instagram.com/nitya_suon/' },
  { label: 'GitHub', href: 'https://github.com/NityaSu' },
];

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<template>
  <footer class="relative">
    <div class="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2">
      <KimiLogo />
    </div>

    <div class="relative overflow-hidden bg-[#2a4c9c] text-white">
      <svg
        class="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] w-full"
        viewBox="0 0 1440 420"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <polygon points="0,420 220,210 480,420" fill="#1a3a7a" opacity="0.45" />
        <polygon points="180,420 520,90 860,420" fill="#163570" opacity="0.5" />
        <polygon points="560,420 880,150 1220,420" fill="#1c3f82" opacity="0.38" />
        <polygon points="820,420 1120,70 1440,420" fill="#142e68" opacity="0.55" />
        <polygon points="0,420 720,250 1440,420" fill="#1a3878" opacity="0.22" />
        <polygon points="300,420 720,180 1140,420" fill="#0f285c" opacity="0.28" />
      </svg>

      <div
        class="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pb-16 pt-20 text-center md:pb-20 md:pt-28"
      >
        <h2 class="font-display text-4xl font-bold leading-tight text-white md:text-5xl">
          Start From Zero
        </h2>
        <p class="mt-4 max-w-md text-sm leading-relaxed text-white/80 md:text-base">
          Building systems that solve real problems.
        </p>

        <nav class="mt-8 flex items-center justify-center gap-6" aria-label="Social links">
          <a
            v-for="social in SOCIAL_LINKS"
            :key="social.label"
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="social.label"
            class="text-white transition-opacity duration-200 hover:opacity-70"
          >
            <svg
              v-if="social.label === 'X'"
              class="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              />
            </svg>
            <svg
              v-else-if="social.label === 'GitHub'"
              class="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <svg
              v-else-if="social.label === 'LinkedIn'"
              class="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
              />
            </svg>
            <svg
              v-else-if="social.label === 'Instagram'"
              class="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
              />
            </svg>
          </a>
        </nav>

        <p class="mt-8 text-[11px] tracking-[0.16em] text-white/90 uppercase">
          © 2026 · NITYA SUON · ALL RIGHTS RESERVED
        </p>
      </div>
    </div>

    <div class="bg-[#F5F5F5] text-[#4a4a4a]">
      <div
        class="flex flex-wrap items-center justify-between gap-4 px-6 py-4 md:px-20 lg:px-[160px]"
      >
        <nav class="flex flex-wrap items-center gap-x-10 gap-y-2 text-sm" aria-label="Footer">
          <NuxtLink to="/legal" class="transition-colors hover:text-black">Legal</NuxtLink>
          <NuxtLink to="/privacy" class="transition-colors hover:text-black">Privacy Policy</NuxtLink>
          <NuxtLink to="/sitemap" class="transition-colors hover:text-black">Sitemap</NuxtLink>
        </nav>

        <button
          type="button"
          class="inline-flex items-center gap-2 text-sm transition-colors hover:text-black"
          @click="scrollToTop"
        >
          Back to Top
          <span
            class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#e0e0e0] text-[#4a4a4a]"
            aria-hidden="true"
          >
            <ChevronUp :size="14" :stroke-width="2.5" />
          </span>
        </button>
      </div>
    </div>
  </footer>
</template>
