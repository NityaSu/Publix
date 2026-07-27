<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useMediaQuery } from '@vueuse/core';

interface Props {
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: '#e74c3c',
});

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
const canvasRef = ref<HTMLCanvasElement | null>(null);
let rafId: number | null = null;
let lastTime = 0;

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = canvas.clientWidth;
  let height = canvas.clientHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const chars = '.::-=+xX#';
  const maxWaves = 16;
  const waveColor = props.color;
  const waves: {
    radius: number;
    speed: number;
    segments: number;
    arcSize: number;
    opacity: number;
    age: number;
  }[] = [];

  const createWave = () => ({
    radius: 0,
    speed: 0.5 + Math.random() * 0.6,
    segments: 3 + Math.floor(Math.random() * 3),
    arcSize: 0.5 + Math.random() * 0.8,
    opacity: 0.15 + Math.random() * 0.25,
    age: 0,
  });

  for (let i = 0; i < 5; i += 1) {
    waves.push(createWave());
  }

  const drawBackgroundGrid = () => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    const spacing = 24;
    ctx.fillStyle = waveColor;
    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += spacing) {
        const dx = x - width / 2;
        const dy = y - height / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const alpha = Math.max(0, 1 - dist / (Math.max(width, height) * 0.55)) * 0.14;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  };

  const drawWave = (wave: (typeof waves)[number]) => {
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.max(width, height) * 0.7;
    const life = Math.min(1, wave.age / 420);
    const charIndex = Math.floor(life * (chars.length - 1));
    const char = chars[charIndex] ?? '#';

    ctx.font = `bold ${14 + Math.floor(life * 10)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = waveColor;

    for (let i = 0; i < wave.segments; i += 1) {
      const startAngle = (i / wave.segments) * Math.PI * 2 + wave.age * 0.01;
      const endAngle = startAngle + wave.arcSize;
      const arcLen = wave.radius * wave.arcSize;
      const count = Math.max(3, Math.floor(arcLen / 18));

      for (let j = 0; j <= count; j += 1) {
        const t = j / count;
        const angle = startAngle + (endAngle - startAngle) * t;
        const x = cx + Math.cos(angle) * wave.radius;
        const y = cy + Math.sin(angle) * wave.radius;
        const fade = Math.max(0, 1 - wave.radius / maxRadius) * wave.opacity;
        ctx.globalAlpha = fade;
        ctx.fillText(char, x, y);
      }
    }
    ctx.globalAlpha = 1;
  };

  const loop = (time: number) => {
    if (!lastTime) lastTime = time;
    const delta = time - lastTime;
    lastTime = time;

    drawBackgroundGrid();

    const spawnRate = 70;
    if (waves.length < maxWaves && Math.random() < 1 / spawnRate) {
      waves.push(createWave());
    }

    for (let i = waves.length - 1; i >= 0; i -= 1) {
      const wave = waves[i];
      if (wave === undefined) continue;
      wave.radius += wave.speed * (delta / 16);
      wave.age += 1;
      drawWave(wave);
      const maxRadius = Math.max(width, height) * 0.75;
      if (wave.radius > maxRadius) {
        waves.splice(i, 1);
      }
    }

    rafId = requestAnimationFrame(loop);
  };

  if (prefersReducedMotion.value) {
    drawBackgroundGrid();
  } else {
    rafId = requestAnimationFrame(loop);
  }

  const stopMotion = watch(prefersReducedMotion, (reduced) => {
    if (reduced) {
      if (rafId) cancelAnimationFrame(rafId);
      drawBackgroundGrid();
    } else if (!rafId) {
      rafId = requestAnimationFrame(loop);
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
