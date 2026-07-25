<script setup lang="ts">
import { ref } from 'vue';
import { Linkedin, Instagram, Twitter } from 'lucide-vue-next';

useHead({
  title: 'Contact',
});

const CONTACT_EMAIL = 'Suonnitya7@gmail.com';

const SOCIAL_LINKS = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/nityasuon/',
    icon: Linkedin,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/nitya_suon/',
    icon: Instagram,
  },
  {
    label: 'X',
    href: 'https://x.com/NityaSuon',
    icon: Twitter,
  },
] as const;

const POLICY_LINKS = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Cookie Policy', href: '#' },
  { label: 'Cookie Settings', href: '#' },
] as const;

const name = ref('');
const phone = ref('');
const email = ref('');
const message = ref('');

const fieldClass =
  'w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors duration-300';
</script>

<template>
  <main class="w-full px-6 md:px-20 lg:px-[160px] py-16 md:py-24">
    <h1 class="font-display font-extrabold uppercase text-white text-4xl sm:text-5xl md:text-6xl">
      Contact
    </h1>
    <div class="mt-6 h-[2px] w-full bg-accent"></div>

    <div class="mt-14 md:mt-20 grid grid-cols-1 lg:grid-cols-[minmax(0,340px)_1fr] gap-12 lg:gap-20 items-start">
      <div>
        <p class="font-display font-bold text-xl md:text-2xl text-white leading-snug">
          Send a message.<br />
          I read every one and reply within a day or two.
        </p>
        <p class="mt-6 text-sm md:text-base text-muted leading-relaxed">
          Email to
          <a :href="`mailto:${CONTACT_EMAIL}`" class="text-accent hover:underline">{{ CONTACT_EMAIL }}</a>
          or use the form.
        </p>
      </div>

      <form
        :action="`mailto:${CONTACT_EMAIL}`"
        method="post"
        enctype="text/plain"
        class="w-full"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            v-model="name"
            type="text"
            name="Name"
            placeholder="Name"
            :class="fieldClass"
          />
          <input
            v-model="phone"
            type="tel"
            name="Phone"
            placeholder="Phone (optional)"
            :class="fieldClass"
          />
        </div>

        <input
          v-model="email"
          type="email"
          name="Email"
          placeholder="Email"
          required
          :class="fieldClass"
          class="mt-4"
        />

        <textarea
          v-model="message"
          name="Message"
          placeholder="Message"
          rows="5"
          required
          :class="fieldClass"
          class="mt-4 resize-none"
        ></textarea>

        <div class="mt-10 pt-6 border-t border-white/15 flex justify-end">
          <button
            type="submit"
            class="px-8 py-3 rounded-md border border-accent text-accent text-sm uppercase tracking-widest font-semibold hover:bg-accent/10 hover:shadow-glow-sm transition-all duration-300"
          >
            Submit
          </button>
        </div>
      </form>
    </div>

    <footer class="mt-16 md:mt-24 pt-10 border-t border-accent">
      <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-10 md:gap-8">
        <div>
          <p
            class="font-display font-extrabold uppercase text-white text-2xl sm:text-3xl md:text-4xl tracking-tight leading-none"
            aria-label="START FROM ZERO"
          >
            START FROM ZER<span
              class="relative inline-block text-transparent select-none"
              aria-hidden="true"
            >O<span
              class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[0.78em] h-[0.78em] rounded-full border-[0.135em] border-accent box-border"
            ></span></span><sup class="text-[0.45em] font-bold tracking-normal relative -top-[0.7em]">™</sup>
          </p>
          <p class="mt-3 text-xs sm:text-sm text-muted">
            © 2026 Nitya Suon
          </p>
        </div>

        <nav class="flex flex-col gap-2" aria-label="Legal">
          <a
            v-for="link in POLICY_LINKS"
            :key="link.label"
            :href="link.href"
            class="text-sm text-white underline underline-offset-4 decoration-white/70 hover:text-accent hover:decoration-accent transition-colors duration-300 w-fit"
          >
            {{ link.label }}
          </a>
        </nav>

        <div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 md:ml-auto">
          <NuxtLink
            to="/projects"
            class="text-sm text-white underline underline-offset-4 decoration-white/70 hover:text-accent hover:decoration-accent transition-colors duration-300 w-fit"
          >
            Work with me
          </NuxtLink>

          <div class="flex items-center gap-4">
            <a
              v-for="social in SOCIAL_LINKS"
              :key="social.label"
              :href="social.href"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="social.label"
              class="text-white hover:text-accent transition-colors duration-300"
            >
              <component :is="social.icon" :size="20" :stroke-width="1.75" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  </main>
</template>
