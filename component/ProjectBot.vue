<script setup lang="ts">
import { computed } from 'vue';
import { useMediaQuery } from '@vueuse/core';

interface Props {
  /** 'normal' = open eyes, 'sleepy' = closed / relaxed */
  mode?: 'normal' | 'sleepy';
  /** 'v1' = blue, 'v2' = coral-red */
  version?: 'v1' | 'v2';
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'normal',
  version: 'v1',
});

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

const isNormal = computed(() => props.mode === 'normal');
const isSleepy = computed(() => props.mode === 'sleepy');
const isReduced = computed(() => prefersReducedMotion.value);
const isV1 = computed(() => props.version === 'v1');
const isV2 = computed(() => props.version === 'v2');
</script>

<template>
  <div
    class="project-bot"
    :class="{
      'is-normal': isNormal,
      'is-sleepy': isSleepy,
      'is-reduced': isReduced,
      'is-v1': isV1,
      'is-v2': isV2,
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

/* Body: squircle, brighter at top */
.bot-body {
  width: 90px;
  height: 84px;
  border-radius: 45% 45% 42% 42% / 48% 48% 44% 44%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.4s ease, box-shadow 0.4s ease;
}

/* V1: Blue */
.project-bot.is-v1 .bot-body {
  background: radial-gradient(circle at 45% 35%, #5b9bd5 0%, #3a7bd5 55%, #2c5aa0 100%);
  box-shadow:
    0 4px 20px rgba(58, 123, 213, 0.4),
    0 0 60px rgba(58, 123, 213, 0.15);
}

/* V2: Coral-red */
.project-bot.is-v2 .bot-body {
  background: radial-gradient(circle at 45% 35%, #ff6b6b 0%, #e74c3c 55%, #c0392b 100%);
  box-shadow:
    0 4px 20px rgba(231, 76, 60, 0.4),
    0 0 60px rgba(231, 76, 60, 0.15);
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
  border-radius: 50%;
  transition: background 0.4s ease, box-shadow 0.4s ease;
}

.project-bot.is-v1 .eye::after {
  background: radial-gradient(circle at 35% 35%, #00fff0, #00bcd4);
  box-shadow: 0 0 5px rgba(0, 255, 240, 0.5);
}

.project-bot.is-v2 .eye::after {
  background: radial-gradient(circle at 35% 35%, #ffd700, #ffa500);
  box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
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
  border-top: 3px solid transparent;
  border-right: 3px solid transparent;
  transform-origin: bottom center;
  transition: border-color 0.4s ease, transform 0.4s ease;
}

.antenna::after {
  content: '';
  position: absolute;
  top: -5px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  transition: background 0.4s ease;
}

.project-bot.is-v1 .antenna {
  border-top-color: #3a7bd5;
  border-right-color: #3a7bd5;
}

.project-bot.is-v1 .antenna::after {
  background: radial-gradient(circle at 40% 40%, #7ec8e3, #3a7bd5);
}

.project-bot.is-v2 .antenna {
  border-top-color: #e74c3c;
  border-right-color: #e74c3c;
}

.project-bot.is-v2 .antenna::after {
  background: radial-gradient(circle at 40% 40%, #ff8a80, #e74c3c);
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
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  transition: background 0.4s ease, transform 0.4s ease;
}

.project-bot.is-v1 .arm {
  background: linear-gradient(to bottom, #5b9bd5, #3a7bd5);
}

.project-bot.is-v2 .arm {
  background: linear-gradient(to bottom, #ff6b6b, #e74c3c);
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
  border-radius: 0 0 3px 3px;
  transition: background 0.4s ease;
}

.project-bot.is-v1 .leg {
  background: linear-gradient(to bottom, #3a7bd5, #2c5aa0);
}

.project-bot.is-v2 .leg {
  background: linear-gradient(to bottom, #e74c3c, #c0392b);
}

@media (prefers-reduced-motion: reduce) {
  .project-bot {
    animation: none;
  }

  .eye,
  .pupil,
  .arm,
  .antenna,
  .bot-body {
    transition: none;
    animation: none;
  }
}
</style>
