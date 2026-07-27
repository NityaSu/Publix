<script setup lang="ts">
import { computed } from 'vue';
import { useMediaQuery } from '@vueuse/core';

interface Props {
  /** 'normal' = open eyes, 'sleepy' = closed / relaxed */
  mode?: 'normal' | 'sleepy';
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'normal',
});

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

const isNormal = computed(() => props.mode === 'normal');
const isSleepy = computed(() => props.mode === 'sleepy');
const isReduced = computed(() => prefersReducedMotion.value);
</script>

<template>
  <div
    class="project-bot"
    :class="{
      'is-normal': isNormal,
      'is-sleepy': isSleepy,
      'is-reduced': isReduced,
    }"
  >
    <!-- Antennae (curved feelers) -->
    <div class="antenna antenna-left" />
    <div class="antenna antenna-right" />

    <!-- Arms -->
    <div class="arm arm-left" />
    <div class="arm arm-right" />

    <!-- Body -->
    <div class="bot-body">
      <!-- Eyes -->
      <div class="eyes">
        <div class="eye">
          <div class="pupil" />
        </div>
        <div class="eye">
          <div class="pupil" />
        </div>
      </div>
    </div>

    <!-- Legs -->
    <div class="legs">
      <div class="leg leg-left" />
      <div class="leg leg-right" />
    </div>
  </div>
</template>

<style scoped>
.project-bot {
  position: relative;
  width: 110px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Gentle float on normal mode */
.project-bot:not(.is-reduced) {
  animation: botFloat 4s ease-in-out infinite;
}

@keyframes botFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* Body: blue squircle, brighter at top */
.bot-body {
  width: 90px;
  height: 84px;
  border-radius: 45% 45% 42% 42% / 48% 48% 44% 44%;
  background: radial-gradient(circle at 45% 35%, #5b9bd5 0%, #3a7bd5 55%, #2c5aa0 100%);
  position: relative;
  box-shadow:
    0 4px 20px rgba(58, 123, 213, 0.4),
    0 0 60px rgba(58, 123, 213, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Eyes */
.eyes {
  display: flex;
  gap: 14px;
  position: relative;
  z-index: 2;
  margin-top: -8px;
}

.eye {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #111111;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eye::after {
  content: '';
  width: 7px;
  height: 7px;
  background: radial-gradient(circle at 35% 35%, #00fff0, #00bcd4);
  border-radius: 50%;
  box-shadow: 0 0 5px rgba(0, 255, 240, 0.5);
}

/* Normal blink */
.project-bot.is-normal .eye {
  animation: bb-blink 3.5s infinite;
}

@keyframes bb-blink {
  0%,
  96%,
  100% {
    transform: scaleY(1);
  }
  98% {
    transform: scaleY(0.1);
  }
}

/* Sleepy: half-closed, dimmed pupils */
.project-bot.is-sleepy .eye {
  height: 4px;
  border-radius: 4px;
  overflow: hidden;
  animation: bb-sleepy-blink 4s infinite;
}

.project-bot.is-sleepy .eye::after {
  opacity: 0.3;
}

.project-bot.is-sleepy .antenna-left {
  transform: rotate(-20deg);
}

.project-bot.is-sleepy .antenna-right {
  transform: rotate(20deg);
}

@keyframes bb-sleepy-blink {
  0%,
  90%,
  100% {
    transform: scaleY(1);
  }
  95% {
    transform: scaleY(0.3);
  }
}

/* Antennae: curved feelers with knobs */
.antenna {
  position: absolute;
  top: -6px;
  width: 5px;
  height: 22px;
  background: transparent;
  border-radius: 50%;
  border-top: 3px solid #3a7bd5;
  border-right: 3px solid #3a7bd5;
  transform-origin: bottom center;
  transition: transform 0.4s ease;
}

.antenna::after {
  content: '';
  position: absolute;
  top: -5px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, #7ec8e3, #3a7bd5);
}

.antenna-left {
  left: 24px;
  transform: rotate(-35deg);
  border-radius: 0 50% 0 0;
}

.antenna-left::after {
  left: -2px;
  top: -6px;
}

.antenna-right {
  right: 24px;
  transform: rotate(35deg) scaleX(-1);
  border-radius: 50% 0 0 0;
}

.antenna-right::after {
  right: -2px;
  top: -6px;
}

/* Arms: rounded-rectangle pills */
.arm {
  position: absolute;
  top: 34px;
  width: 18px;
  height: 14px;
  background: linear-gradient(to bottom, #5b9bd5, #3a7bd5);
  box-shadow: 0 1px 4px rgba(44, 90, 160, 0.25);
  transition: transform 0.4s ease;
}

.arm-left {
  left: -6px;
  border-radius: 50% 40% 40% 50%;
}

.arm-right {
  right: -6px;
  border-radius: 40% 50% 50% 40%;
}

/* Sleepy: arms droop slightly */
.project-bot.is-sleepy .arm-left {
  transform: translateY(8px) rotate(15deg);
}

.project-bot.is-sleepy .arm-right {
  transform: translateY(8px) rotate(-15deg);
}

/* Legs: short flat stubs */
.legs {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 18px;
}

.leg {
  width: 14px;
  height: 12px;
  background: linear-gradient(to bottom, #3a7bd5, #2c5aa0);
  border-radius: 0 0 3px 3px;
}

@media (prefers-reduced-motion: reduce) {
  .project-bot {
    animation: none;
  }

  .eye,
  .pupil,
  .arm,
  .antenna {
    transition: none;
    animation: none;
  }
}
</style>
