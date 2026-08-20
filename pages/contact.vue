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
const gotcha = ref('');
const status = ref<'idle' | 'sending' | 'sent' | 'error'>('idle');
const errorMessage = ref('');

const fieldClass =
  'w-full bg-white/[0.04] border border-white/20 rounded-md px-4 py-3 text-sm text-white caret-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors duration-300';

function resetForm() {
  name.value = '';
  phone.value = '';
  email.value = '';
  message.value = '';
  gotcha.value = '';
}

function readErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { message?: string } }).data;
    if (data?.message) return data.message;
  }
  return 'Could not send. Please email me directly.';
}

async function onSubmit() {
  if (status.value === 'sending') return;

  status.value = 'sending';
  errorMessage.value = '';

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        name: name.value,
        phone: phone.value,
        email: email.value,
        message: message.value,
        _gotcha: gotcha.value,
      },
    });
    status.value = 'sent';
    resetForm();
  } catch (error) {
    status.value = 'error';
    errorMessage.value = readErrorMessage(error);
  }
}
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

      <div v-if="status === 'sent'" class="w-full">
        <p class="font-display font-bold text-xl text-white">Message sent.</p>
        <p class="mt-3 text-sm md:text-base text-muted leading-relaxed">
          Thanks — I'll reply within a day or two.
        </p>
        <button
          type="button"
          class="mt-10 px-8 py-3 rounded-none border border-accent text-accent font-dm font-bold text-sm uppercase tracking-[0.14em] hover:bg-accent/10 hover:shadow-glow-sm transition-all duration-300"
          @click="status = 'idle'"
        >
          Send another
        </button>
      </div>

      <form v-else class="w-full" @submit.prevent="onSubmit">
        <input
          v-model="gotcha"
          type="text"
          name="_gotcha"
          tabindex="-1"
          autocomplete="off"
          aria-hidden="true"
          class="absolute -left-[9999px] h-0 w-0 opacity-0"
        />

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            v-model="name"
            type="text"
            name="name"
            autocomplete="name"
            placeholder="Name"
            aria-label="Name"
            required
            minlength="2"
            maxlength="100"
            :class="fieldClass"
          />
          <input
            v-model="phone"
            type="tel"
            name="phone"
            autocomplete="tel"
            placeholder="Phone (optional)"
            aria-label="Phone"
            maxlength="40"
            :class="fieldClass"
          />
        </div>

        <input
          v-model="email"
          type="email"
          name="email"
          autocomplete="email"
          placeholder="Email"
          aria-label="Email"
          required
          maxlength="200"
          :class="fieldClass"
          class="mt-4"
        />

        <textarea
          v-model="message"
          name="message"
          placeholder="Message"
          aria-label="Message"
          rows="5"
          required
          minlength="10"
          maxlength="4000"
          :class="fieldClass"
          class="mt-4 resize-none"
        ></textarea>

        <p v-if="status === 'error'" class="mt-4 text-sm text-red-400">
          {{ errorMessage }}
        </p>

        <div class="mt-10 pt-6 border-t border-white/15 flex justify-end">
          <button
            type="submit"
            :disabled="status === 'sending'"
            class="px-8 py-3 rounded-none border border-accent text-accent font-dm font-bold text-sm uppercase tracking-[0.14em] hover:bg-accent/10 hover:shadow-glow-sm transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
          >
            {{ status === 'sending' ? 'Sending…' : 'Submit' }}
          </button>
        </div>
      </form>
    </div>
  </main>

  <FooterSection />
</template>
