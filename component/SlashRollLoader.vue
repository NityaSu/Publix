<script setup lang="ts">
/**
 * Loading v1 — cloned from the Supercage slash (same bar + cage box).
 * Sequence: rush into the cage, roll right twice, then the same roll in the middle.
 * Do not use this to change SupercageEscapeMark.
 */
interface Props {
  size?: number;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 160,
  label: 'Loading',
});

const SCENE = 340;
</script>

<template>
  <div
    class="srl-frame"
    :style="{ width: `${props.size}px`, height: `${props.size}px` }"
    role="status"
    :aria-label="props.label"
  >
    <div
      class="srl-scene"
      :style="{
        width: `${SCENE}px`,
        height: `${SCENE}px`,
        transform: `scale(${props.size / SCENE})`,
      }"
    >
      <div class="srl-cage" aria-hidden="true" />
      <div class="srl-roll">
        <div class="srl-slash" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.srl-frame {
  position: relative;
  overflow: visible;
  flex-shrink: 0;
}

.srl-scene {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
}

/* Same cage as SupercageEscapeMark — static, no shake */
.srl-cage {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: #111;
  border: 3px solid #222;
  overflow: hidden;
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.7);
}

.srl-cage::before {
  content: '';
  position: absolute;
  inset: 12px;
  border-radius: 10px;
  border: 1px dashed #333;
  opacity: 0.25;
  pointer-events: none;
}

.srl-roll {
  position: absolute;
  inset: 0;
  z-index: 5;
  transform-origin: center center;
  animation: srlCycle 5.4s linear infinite;
}

/* Identical slash UI — no animation on the bar itself */
.srl-slash {
  position: absolute;
  width: 22px;
  height: 104px;
  background: #fff;
  border-radius: 3px;
  left: 50%;
  top: 50%;
  margin-left: -11px;
  margin-top: -52px;
  box-shadow:
    0 0 28px rgba(255, 255, 255, 0.4),
    0 0 10px rgba(255, 255, 255, 0.7),
    0 6px 16px rgba(0, 0, 0, 0.35);
}

/*
 * 5.4s cycle (linear so these % match wall-clock):
 * 0–1.8s  rush into the cage (semRollRush)
 * 1.8–2.6s roll right
 * 2.6–3.4s roll right again
 * 3.4–4.2s same roll, in the middle of the square
 * 4.2–5.4s roll back out left so the loop can rush in again
 */
@keyframes srlCycle {
  /* rush in */
  0% {
    transform: translate(-300px, 40px) rotate(-1440deg) scale(0.3);
    opacity: 0;
  }
  6% {
    opacity: 1;
  }
  18.333% {
    transform: translate(-70px, 8px) rotate(-600deg) scale(0.75);
    opacity: 1;
  }
  26.667% {
    transform: translate(-15px, 2px) rotate(-240deg) scale(0.92);
  }
  33.333% {
    transform: translate(0, 0) rotate(20deg) scale(1);
    opacity: 1;
  }

  /* roll right #1 (semRollEast) */
  38.963% {
    transform: translate(132px, -30px) rotate(400deg) scale(1);
  }
  40.741% {
    transform: translate(142px, -35px) rotate(420deg) scale(1);
  }
  42.518% {
    transform: translate(127px, -25px) rotate(390deg) scale(1);
  }
  48.148% {
    transform: translate(0, 0) rotate(20deg) scale(1);
  }

  /* roll right #2 */
  53.778% {
    transform: translate(132px, -30px) rotate(400deg) scale(1);
  }
  55.556% {
    transform: translate(142px, -35px) rotate(420deg) scale(1);
  }
  57.333% {
    transform: translate(127px, -25px) rotate(390deg) scale(1);
  }
  62.963% {
    transform: translate(0, 0) rotate(20deg) scale(1);
  }

  /* 3rd roll — same spin, stay in the middle */
  68.593% {
    transform: translate(0, 0) rotate(400deg) scale(1);
  }
  70.37% {
    transform: translate(0, 0) rotate(420deg) scale(1);
  }
  72.148% {
    transform: translate(0, 0) rotate(390deg) scale(1);
  }
  77.778% {
    transform: translate(0, 0) rotate(20deg) scale(1);
  }

  81.481% {
    transform: translate(0, 0) rotate(20deg) scale(1);
    opacity: 1;
  }

  /* exit left to meet the next rush */
  85.185% {
    transform: translate(-15px, 2px) rotate(-240deg) scale(0.92);
    opacity: 1;
  }
  89.815% {
    transform: translate(-70px, 8px) rotate(-600deg) scale(0.75);
  }
  100% {
    transform: translate(-300px, 40px) rotate(-1440deg) scale(0.3);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .srl-roll {
    animation: none;
    opacity: 1;
    transform: rotate(20deg);
  }
}
</style>
