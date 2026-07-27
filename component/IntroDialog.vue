<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

interface Props {
  /** 'center' = screen center; 'header-bot' = anchored under the header bot */
  position?: 'center' | 'header-bot';
}

withDefaults(defineProps<Props>(), {
  position: 'center',
});

const showDialog = ref(false);
const isClientReady = ref(false);
const STORAGE_KEY = 'moondot-intro-seen';
const { isDone } = useHeroSequence();

const getHasSeen = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'true';
};

const maybeOpen = () => {
  if (!isClientReady.value) return;
  if (!isDone.value) return;
  if (getHasSeen()) return;
  if (showDialog.value) return;
  showDialog.value = true;
};

onMounted(() => {
  isClientReady.value = true;
  maybeOpen();
});

watch(isDone, () => {
  maybeOpen();
});

const closeDialog = () => {
  showDialog.value = false;
  localStorage.setItem(STORAGE_KEY, 'true');
};
</script>

<template>
  <Transition name="fade" appear>
    <div
      v-if="showDialog && isClientReady"
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
  position: fixed;
  top: 80px;
  left: 16px;
  right: 16px;
  transform: none;
  margin-top: 0;
  pointer-events: none;
}

.intro-dialog--header-bot .dialog-content::before {
  display: none;
}

.dialog-content {
  background: #ffffff;
  color: #333333;
  padding: 18px 26px;
  border-radius: 14px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
  width: 100%;
  max-width: 560px;
  text-align: center;
  pointer-events: auto;
  position: relative;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .intro-dialog--header-bot {
    position: absolute;
    top: 100%;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    margin-top: 12px;
  }

  .intro-dialog--header-bot .dialog-content::before {
    display: block;
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
    width: min(90vw, 560px);
  }
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
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
