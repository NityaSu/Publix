<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { Play } from 'lucide-vue-next';

const props = defineProps<{
  reduceMotion?: boolean;
}>();

const SCENE = 340;
const DISPLAY = 160;

const playKey = ref(0);
const cageEl = ref<HTMLElement | null>(null);
const fxEl = ref<HTMLElement | null>(null);

const IMPACTS = [
  { t: 2450, x: 275, y: 38, w: 28, h: 3, r: -48 },
  { t: 3450, x: 28, y: 275, w: 30, h: 3, r: 42 },
  { t: 4425, x: 38, y: 38, w: 26, h: 3, r: -22 },
  { t: 5375, x: 278, y: 275, w: 28, h: 3, r: 52 },
  { t: 6300, x: 290, y: 140, w: 22, h: 3, r: -38 },
  { t: 7200, x: 150, y: 290, w: 3, h: 24, r: 18 },
  { t: 7900, x: 270, y: 45, w: 24, h: 3, r: -42 },
  { t: 8200, x: 32, y: 268, w: 26, h: 3, r: 38 },
  { t: 8500, x: 42, y: 42, w: 22, h: 3, r: -20 },
  { t: 8800, x: 272, y: 270, w: 24, h: 3, r: 48 },
  { t: 9100, x: 285, y: 130, w: 20, h: 3, r: -35 },
  { t: 9400, x: 145, y: 285, w: 3, h: 22, r: 15 },
] as const;

const timers: ReturnType<typeof setTimeout>[] = [];
let trailInterval: ReturnType<typeof setInterval> | undefined;

function clearFxTimers() {
  while (timers.length) {
    const id = timers.pop();
    if (id !== undefined) clearTimeout(id);
  }
  if (trailInterval) {
    clearInterval(trailInterval);
    trailInterval = undefined;
  }
}

function later(fn: () => void, ms: number) {
  timers.push(setTimeout(fn, ms));
}

function spawnCrack(imp: (typeof IMPACTS)[number]) {
  const cage = cageEl.value;
  const fx = fxEl.value;
  if (!cage || !fx) return;

  const el = document.createElement('div');
  el.className = 'sem-crack sem-crack-show';
  el.style.left = `${imp.x}px`;
  el.style.top = `${imp.y}px`;
  el.style.width = `${imp.w}px`;
  el.style.height = `${imp.h}px`;
  el.style.setProperty('--cr', `${imp.r}deg`);
  fx.appendChild(el);

  for (let i = 0; i < 6; i++) {
    const sp = document.createElement('div');
    sp.className = 'sem-spark sem-spark-show';
    const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.7;
    const dist = 20 + Math.random() * 24;
    sp.style.left = `${imp.x + imp.w / 2}px`;
    sp.style.top = `${imp.y + imp.h / 2}px`;
    sp.style.setProperty('--sx', `${Math.cos(angle) * dist}px`);
    sp.style.setProperty('--sy', `${Math.sin(angle) * dist}px`);
    sp.style.animationDelay = `${Math.random() * 0.1}s`;
    fx.appendChild(sp);
    later(() => sp.remove(), 700);
  }

  cage.classList.remove('sem-shake');
  void cage.offsetWidth;
  cage.classList.add('sem-shake');
  later(() => cage.classList.remove('sem-shake'), 500);
}

function startEffects() {
  clearFxTimers();
  if (fxEl.value) fxEl.value.replaceChildren();
  if (props.reduceMotion) return;

  IMPACTS.forEach((imp) => {
    later(() => spawnCrack(imp), imp.t);
  });

  let trailCount = 0;
  trailInterval = setInterval(() => {
    trailCount += 1;
    if (trailCount > 20) {
      if (trailInterval) clearInterval(trailInterval);
      trailInterval = undefined;
      return;
    }
    const fx = fxEl.value;
    if (!fx) return;
    const t = document.createElement('div');
    t.className = 'sem-trail';
    const p = trailCount / 20;
    const sx = 50;
    const ex = 170;
    const sy = 190;
    const ey = 170;
    t.style.left = `${sx + (ex - sx) * p}px`;
    t.style.top = `${sy + (ey - sy) * p + Math.sin(p * Math.PI) * 20}px`;
    fx.appendChild(t);
    later(() => t.remove(), 600);
  }, 70);
}

function replay() {
  if (props.reduceMotion) return;
  playKey.value += 1;
}

watch(playKey, async () => {
  await nextTick();
  startEffects();
});

onMounted(() => {
  startEffects();
});

onUnmounted(() => {
  clearFxTimers();
});
</script>

<template>
  <aside class="sem-mark">
    <div
      class="sem-frame"
      :style="{ width: `${DISPLAY}px`, height: `${DISPLAY}px` }"
      role="img"
      aria-label="Supercage mark: a slash rolling inside a cage, cracking the walls"
    >
      <div
        :key="playKey"
        class="sem-scene"
        :class="{ 'is-static': reduceMotion }"
        :style="{
          width: `${SCENE}px`,
          height: `${SCENE}px`,
          transform: `scale(${DISPLAY / SCENE})`,
        }"
      >
        <div ref="cageEl" class="sem-cage" />
        <div class="sem-slash" />
        <div ref="fxEl" class="sem-fx" />
      </div>
    </div>

    <div class="sem-brand-row">
      <p class="sem-brand" aria-label="supercage">
        <span class="sem-brand-super">super</span><span class="sem-brand-cage">cage</span>
      </p>
      <button
        type="button"
        class="sem-play"
        :disabled="reduceMotion"
        aria-label="Replay animation"
        title="Replay"
        @click="replay"
      >
        <Play :size="12" :stroke-width="2.5" aria-hidden="true" />
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sem-mark {
  float: right;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  margin: 0.15rem 0 1.25rem 1.5rem;
  shape-outside: margin-box;
}

@media (max-width: 640px) {
  .sem-mark {
    float: none;
    margin: 0 auto 1.5rem;
  }
}

.sem-frame {
  position: relative;
  overflow: visible;
}

.sem-scene {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
}

.sem-cage {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: #111;
  border: 3px solid #222;
  overflow: hidden;
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.7);
}

.sem-cage::before {
  content: '';
  position: absolute;
  inset: 12px;
  border-radius: 10px;
  border: 1px dashed #333;
  opacity: 0.25;
  pointer-events: none;
}

.sem-slash {
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
  transform-origin: center center;
  animation:
    semRollRush 1.8s cubic-bezier(0.25, 1, 0.5, 1) forwards,
    semRollNE 0.9s ease-in-out 2s forwards,
    semRollSW 0.9s ease-in-out 3s forwards,
    semRollNW 0.85s ease-in-out 4s forwards,
    semRollSE 0.85s ease-in-out 4.95s forwards,
    semRollEast 0.8s ease-in-out 5.9s forwards,
    semRollSouth 0.8s ease-in-out 6.8s forwards,
    semRollFrantic 2s ease-in-out 7.7s forwards;
  z-index: 5;
}

.sem-scene.is-static .sem-slash {
  animation: none;
  opacity: 1;
  transform: translate(0, 0) rotate(20deg) scale(1);
}

.sem-fx {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}

.sem-brand-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.sem-brand {
  margin: 0;
  font-family: 'Montserrat', 'Montserrat fallback', sans-serif;
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: 0.06em;
  line-height: 1;
  text-transform: lowercase;
}

.sem-brand-super {
  color: var(--ri-ink);
}

.sem-brand-cage {
  color: #888888;
}

.sem-play {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.35rem;
  height: 1.35rem;
  padding: 0;
  color: var(--ri-sub);
  background: transparent;
  border: 1px solid var(--ri-border);
  border-radius: 999px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background-color 0.2s;
}

.sem-play:hover:not(:disabled) {
  color: var(--ri-ink);
  border-color: color-mix(in srgb, var(--ri-ink) 28%, transparent);
  background: color-mix(in srgb, var(--ri-ink) 4%, transparent);
}

.sem-play:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

@keyframes semRollRush {
  0% {
    transform: translate(-300px, 40px) rotate(-1440deg) scale(0.3);
    opacity: 0;
  }
  18% {
    opacity: 1;
  }
  55% {
    transform: translate(-70px, 8px) rotate(-600deg) scale(0.75);
  }
  80% {
    transform: translate(-15px, 2px) rotate(-240deg) scale(0.92);
  }
  100% {
    transform: translate(0, 0) rotate(20deg) scale(1);
    opacity: 1;
  }
}

@keyframes semRollNE {
  0% {
    transform: translate(0, 0) rotate(20deg);
  }
  38% {
    transform: translate(110px, -110px) rotate(420deg);
  }
  50% {
    transform: translate(120px, -120px) rotate(440deg);
  }
  62% {
    transform: translate(105px, -105px) rotate(410deg);
  }
  100% {
    transform: translate(0, 0) rotate(20deg);
  }
}

@keyframes semRollSW {
  0% {
    transform: translate(0, 0) rotate(20deg);
  }
  38% {
    transform: translate(-115px, 115px) rotate(-400deg);
  }
  50% {
    transform: translate(-125px, 125px) rotate(-420deg);
  }
  62% {
    transform: translate(-110px, 110px) rotate(-390deg);
  }
  100% {
    transform: translate(0, 0) rotate(20deg);
  }
}

@keyframes semRollNW {
  0% {
    transform: translate(0, 0) rotate(20deg);
  }
  38% {
    transform: translate(-108px, -108px) rotate(410deg);
  }
  50% {
    transform: translate(-118px, -118px) rotate(430deg);
  }
  62% {
    transform: translate(-103px, -103px) rotate(400deg);
  }
  100% {
    transform: translate(0, 0) rotate(20deg);
  }
}

@keyframes semRollSE {
  0% {
    transform: translate(0, 0) rotate(20deg);
  }
  38% {
    transform: translate(115px, 108px) rotate(-390deg);
  }
  50% {
    transform: translate(125px, 118px) rotate(-410deg);
  }
  62% {
    transform: translate(110px, 103px) rotate(-380deg);
  }
  100% {
    transform: translate(0, 0) rotate(20deg);
  }
}

@keyframes semRollEast {
  0% {
    transform: translate(0, 0) rotate(20deg);
  }
  38% {
    transform: translate(132px, -30px) rotate(400deg);
  }
  50% {
    transform: translate(142px, -35px) rotate(420deg);
  }
  62% {
    transform: translate(127px, -25px) rotate(390deg);
  }
  100% {
    transform: translate(0, 0) rotate(20deg);
  }
}

@keyframes semRollSouth {
  0% {
    transform: translate(0, 0) rotate(20deg);
  }
  38% {
    transform: translate(-35px, 128px) rotate(-380deg);
  }
  50% {
    transform: translate(-40px, 138px) rotate(-400deg);
  }
  62% {
    transform: translate(-30px, 123px) rotate(-370deg);
  }
  100% {
    transform: translate(0, 0) rotate(20deg);
  }
}

@keyframes semRollFrantic {
  0% {
    transform: translate(0, 0) rotate(20deg) scale(1);
  }
  10% {
    transform: translate(112px, -105px) rotate(440deg) scale(1.06);
  }
  25% {
    transform: translate(-112px, 112px) rotate(-400deg) scale(0.94);
  }
  40% {
    transform: translate(-105px, -105px) rotate(420deg) scale(1.06);
  }
  55% {
    transform: translate(118px, 108px) rotate(-380deg) scale(0.94);
  }
  70% {
    transform: translate(135px, -32px) rotate(460deg) scale(1.06);
  }
  85% {
    transform: translate(-32px, 132px) rotate(-420deg) scale(0.94);
  }
  100% {
    transform: translate(0, 0) rotate(20deg) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sem-slash {
    animation: none !important;
    opacity: 1;
    transform: translate(0, 0) rotate(20deg) scale(1);
  }
}
</style>

<!-- Unscoped: dynamically created crack/spark/trail nodes need these classes -->
<style>
.sem-shake {
  animation: semCageShake 0.45s ease-in-out;
}

.sem-crack {
  position: absolute;
  background: #e5484d;
  border-radius: 1px;
  opacity: 0;
  transform-origin: center;
  pointer-events: none;
  z-index: 3;
}

.sem-crack-show {
  animation: semCrackAppear 0.55s ease forwards;
}

.sem-spark {
  position: absolute;
  width: 3px;
  height: 3px;
  background: #f5a623;
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  z-index: 4;
}

.sem-spark-show {
  animation: semSparkFly 0.6s ease-out forwards;
}

.sem-trail {
  position: absolute;
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  pointer-events: none;
  z-index: 2;
  animation: semTrailFade 0.5s ease-out forwards;
}

@keyframes semCageShake {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  10% {
    transform: translate(-5px, 4px) rotate(-1.2deg);
  }
  22% {
    transform: translate(5px, -4px) rotate(1.2deg);
  }
  34% {
    transform: translate(-4px, -4px) rotate(-0.7deg);
  }
  46% {
    transform: translate(4px, 4px) rotate(0.7deg);
  }
  58% {
    transform: translate(-3px, 3px) rotate(-0.4deg);
  }
  70% {
    transform: translate(3px, -3px) rotate(0.4deg);
  }
  82% {
    transform: translate(-2px, 1px) rotate(-0.2deg);
  }
  94% {
    transform: translate(2px, -1px) rotate(0.2deg);
  }
}

@keyframes semCrackAppear {
  0% {
    opacity: 0;
    transform: scale(0) rotate(var(--cr, 0deg));
  }
  45% {
    opacity: 1;
    transform: scale(1.5) rotate(var(--cr, 0deg));
  }
  100% {
    opacity: 0.8;
    transform: scale(1) rotate(var(--cr, 0deg));
  }
}

@keyframes semSparkFly {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--sx, 20px), var(--sy, -20px)) scale(0);
  }
}

@keyframes semTrailFade {
  0% {
    opacity: 0.5;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.15);
  }
}
</style>
