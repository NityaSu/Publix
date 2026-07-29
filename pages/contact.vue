<script setup lang="ts">
import { ref } from 'vue';
import FooterSection from '~/component/FooterSection.vue';

useHead({
  title: 'Contact',
});

const CONTACT_EMAIL = 'suonnitya@gmail.com';

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
            class="px-8 py-3 rounded-none border border-accent text-accent font-dm font-bold text-sm uppercase tracking-[0.14em] hover:bg-accent/10 hover:shadow-glow-sm transition-all duration-300"
          >
            Submit
          </button>
        </div>
      </form>
    </div>

  </main>

  <FooterSection />
</template>
