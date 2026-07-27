<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useMediaQuery } from '@vueuse/core';

interface Props {
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: '231, 76, 60', // rgb parts of coral #E74C3C
});

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
const canvasRef = ref<HTMLCanvasElement | null>(null);
let rafId: number | null = null;

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const chars = '.::-=+xX#';
  const maxWaves = 12;
  let w = 0;
  let h = 0;
  let cx = 0;
  let cy = 0;

  const resize = () => {
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;
    w = canvas.width = rect.width;
    h = canvas.height = rect.height;
    cx = w / 2;
    cy = h / 2;
  };
  resize();
  window.addEventListener('resize', resize);

  class Wave {
    radius: number;
    speed: number;
    opacity: number;
    arcCount: number;
    arcSpread: number;
    rotationOffset: number;

    constructor(radius: number) {
      this.radius = radius;
      this.speed = 0.4 + Math.random() * 0.3;
      this.opacity = 1;
      this.arcCount = 3 + Math.floor(Math.random() * 3);
      this.arcSpread = 0.3 + Math.random() * 0.5;
      this.rotationOffset = Math.random() * Math.PI * 2;
    }

    update() {
      this.radius += this.speed;
      this.opacity = Math.max(0, 1 - (this.radius / Math.max(w, h)) * 0.8);
    }

    draw(context: CanvasRenderingContext2D) {
      if (this.opacity <= 0) return;
      const arcStep = (Math.PI * 2) / this.arcCount;
      for (let a = 0; a < this.arcCount; a += 1) {
        const baseAngle = a * arcStep + this.rotationOffset;
        const arcLen = this.arcSpread;
        const steps = Math.floor(this.radius * 0.6);
        for (let i = 0; i <= steps; i += 1) {
          const t = i / Math.max(steps, 1);
          const angle = baseAngle - arcLen / 2 + t * arcLen;
          const r = this.radius + Math.sin(t * Math.PI * 3) * 3;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          const charIndex = Math.floor((1 - this.opacity) * (chars.length - 1));
          const char = chars[Math.min(charIndex, chars.length - 1)] ?? '#';
          const distFromCenter = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          const size = 8 + (distFromCenter / Math.max(w, h)) * 8;
          context.font = `${size}px monospace`;
          context.fillStyle = `rgba(${props.color}, ${this.opacity * (0.3 + 0.7 * Math.sin(t * Math.PI))})`;
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText(char, x, y);
        }
      }
    }
  }

  let waves: Wave[] = [];
  const seedWaves = () => {
    waves = [];
    for (let i = 0; i < maxWaves; i += 1) {
      waves.push(new Wave(i * 35));
    }
  };
  seedWaves();

  const drawGrid = () => {
    ctx.fillStyle = `rgba(${props.color}, 0.04)`;
    for (let x = 0; x < w; x += 20) {
      for (let y = 0; y < h; y += 20) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const fade = Math.max(0, 1 - dist / (Math.max(w, h) * 0.6));
        if (fade > 0.1) {
          ctx.globalAlpha = fade * 0.5;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    ctx.globalAlpha = 1;
  };

  const animate = () => {
    ctx.clearRect(0, 0, w, h);
    drawGrid();

    for (let i = waves.length - 1; i >= 0; i -= 1) {
      const wave = waves[i];
      if (wave === undefined) continue;
      wave.update();
      wave.draw(ctx);
      if (wave.radius > Math.max(w, h) * 0.9 || wave.opacity <= 0) {
        waves.splice(i, 1);
      }
    }

    if (waves.length < maxWaves) {
      const last = waves[waves.length - 1];
      const lastR = last ? last.radius : 9999;
      if (lastR > 35) {
        waves.push(new Wave(0));
      }
    }

    rafId = requestAnimationFrame(animate);
  };

  if (prefersReducedMotion.value) {
    drawGrid();
  } else {
    rafId = requestAnimationFrame(animate);
  }

  const stopMotion = watch(prefersReducedMotion, (reduced) => {
    if (reduced) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      ctx.clearRect(0, 0, w, h);
      drawGrid();
    } else if (!rafId) {
      seedWaves();
      rafId = requestAnimationFrame(animate);
    }
  });

  onUnmounted(() => {
    stopMotion();
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
  });
});
</script>

<template>
  <canvas
    ref="canvasRef"
    class="absolute inset-0 w-full h-full"
    aria-hidden="true"
  />
</template>
