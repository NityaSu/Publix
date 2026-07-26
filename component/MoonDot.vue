<template>
  <span class="moon-v4" aria-hidden="true" />
</template>

<style scoped>
.moon-v4 {
  width: max(18px, 0.32em);
  height: max(18px, 0.32em);
  border-radius: 50%;
  background: #333333;
  position: relative;
  overflow: hidden;
  display: inline-block;
  vertical-align: middle;
  margin-left: 0.2em;
  flex-shrink: 0;
}

.moon-v4::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(90deg, transparent 0%, #888888 50%, transparent 100%);
  background-size: 200% 100%;
  animation: gradientSweep 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes gradientSweep {
  0% {
    background-position: 200% 0;
  }
  50% {
    background-position: 100% 0;
  }
  100% {
    background-position: 0% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .moon-v4::before {
    animation: none;
    background-position: 100% 0;
  }
}
</style>
