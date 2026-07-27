<script setup lang="ts">
import { ref, computed } from 'vue';
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

/** Subtle idle float handled with CSS if reduced motion is off. */
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
      <div class="eye eye-left">
        <div class="pupil" />
      </div>
      <div class="eye eye-right">
        <div class="pupil" />
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
  width: 140px;
  height: 120px;
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

/* Body: super-ellipse squircle, coral-red, brighter top-center */
.bot-body {
  width: 120px;
  height: 100px;
  border-radius: 45% 45% 40% 40% / 55% 55% 45% 45%;
  background: radial-gradient(
    ellipse at 50% 30%,
    #ff7a66 0%,
    #e74c3c 35%,
    #c0392b 80%,
    #a93226 100%
  );
  position: relative;
  box-shadow:
    inset 0 -8px 20px rgba(0, 0, 0, 0.2),
    0 0 40px rgba(231, 76, 60, 0.35),
    0 12px 30px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
}

/* Eyes */
.eye {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #0a0a0a;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s ease;
}

.pupil {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #00e5e5;
  box-shadow: 0 0 8px 2px rgba(0, 229, 229, 0.6);
  transition: all 0.4s ease;
}

/* Sleepy eyes: squashed and dimmed */
.project-bot.is-sleepy .eye {
  height: 4px;
  border-radius: 2px;
  background: #0a0a0a;
}

.project-bot.is-sleepy .pupil {
  opacity: 0;
  transform: scale(0);
}

/* Antennae: curved feelers with knobs */
.antenna {
  position: absolute;
  top: 8px;
  width: 5px;
  height: 34px;
  background: transparent;
  border-radius: 50%;
  border-left: 4px solid #e74c3c;
  border-top: 4px solid #e74c3c;
  transform-origin: bottom center;
}

.antenna::after {
  content: '';
  position: absolute;
  top: -6px;
  left: -5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e74c3c;
  box-shadow: 0 0 8px rgba(231, 76, 60, 0.4);
}

.antenna-left {
  left: 32px;
  transform: rotate(-35deg);
}

.antenna-right {
  right: 32px;
  transform: rotate(35deg) scaleX(-1);
}

/* Arms: rounded-rectangle pills */
.arm {
  position: absolute;
  top: 50%;
  width: 34px;
  height: 18px;
  border-radius: 9px;
  background: #e74c3c;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.4s ease;
}

.arm-left {
  left: -6px;
  transform: translateY(-50%) rotate(-10deg);
}

.arm-right {
  right: -6px;
  transform: translateY(-50%) rotate(10deg);
}

/* Sleepy: arms droop slightly */
.project-bot.is-sleepy .arm-left {
  transform: translateY(-30%) rotate(15deg);
}

.project-bot.is-sleepy .arm-right {
  transform: translateY(-30%) rotate(-15deg);
}

/* Legs: short flat stubs */
.legs {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 28px;
}

.leg {
  width: 24px;
  height: 12px;
  border-radius: 3px 3px 6px 6px;
  background: #c0392b;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

@media (prefers-reduced-motion: reduce) {
  .project-bot {
    animation: none;
  }

  .eye,
  .pupil,
  .arm {
    transition: none;
  }
}
</style>
