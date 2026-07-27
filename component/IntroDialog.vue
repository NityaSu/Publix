<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  /** 'center' = screen center; 'header-bot' = anchored under the header bot */
  position?: 'center' | 'header-bot';
}

withDefaults(defineProps<Props>(), {
  position: 'center',
});

const showDialog = ref(false);
const STORAGE_KEY = 'moondot-intro-seen';
const { isDone } = useHeroSequence();

const hasSeen = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY);

watch(isDone, (done) => {
  if (done && !hasSeen && !showDialog.value) {
    showDialog.value = true;
  }
});

const closeDialog = () => {
  showDialog.value = false;
  localStorage.setItem(STORAGE_KEY, 'true');
};
</script>

<template>
  <Transition name="fade">
    <div
      v-if="showDialog"
      class="intro-dialog"
      :class="`intro-dialog--${position}`"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
    >
      <div class="dialog-content">
        <p id="intro-title" class="dialog-text">
          Hello Audience, I'm <strong>Moondot V0</strong>.<br>
          You can click on my profile image again to respin and see another image.
        </p>
        <button
          type="button"
          class="dialog-close"
          @click="closeDialog"
        >
          Got it
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.intro-dialog {
  z-index: 100;
}

.intro-dialog--center {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.intro-dialog--header-bot {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 12px;
  pointer-events: none;
}

.intro-dialog--header-bot .dialog-content::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 10px;
  border-style: solid;
  border-color: transparent transparent #ffffff transparent;
}

.dialog-content {
  background: #ffffff;
  color: #333333;
  padding: 18px 26px;
  border-radius: 14px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
  min-width: 520px;
  max-width: 600px;
  text-align: center;
  pointer-events: auto;
  position: relative;
}

.dialog-text {
  font-size: 14px;
  line-height: 1.55;
  margin: 0 0 16px 0;
  color: #555555;
}

.dialog-text strong {
  color: #2b8cfd;
  font-weight: 700;
}

.dialog-close {
  background: #2b8cfd;
  color: white;
  border: none;
  padding: 7px 22px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.dialog-close:hover {
  background: #1a7aef;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.intro-dialog--header-bot.fade-enter-from,
.intro-dialog--header-bot.fade-leave-to {
  transform: translateX(-50%) translateY(-6px);
}

.intro-dialog--header-bot.fade-enter-to,
.intro-dialog--header-bot.fade-leave-from {
  transform: translateX(-50%) translateY(0);
}
</style>
