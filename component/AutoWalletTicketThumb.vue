<script setup lang="ts">
const stats = [
  { label: 'Balance', value: '$27.74' },
  { label: 'Spent today', value: '$0.00' },
  { label: 'Received', value: '$0.00' },
  { label: 'Available', value: '$27.74' },
];
</script>

<template>
  <div class="absolute inset-[18px] [container-type:size]">
    <div
      class="absolute left-1/2 top-1/2 [container-type:size]"
      :style="{
        width: 'min(100cqw, calc(100cqh * 520 / 328))',
        height: 'min(100cqh, calc(100cqw * 328 / 520))',
        transform: 'translate(-50%, -50%)',
      }"
    >
      <article
        class="aw-card"
        aria-label="AutoWallet card"
      >
      <div class="aw-top">
        <div class="aw-brand">
          <h2>AUTOWALLET</h2>
          <p>Personal wallet · owner</p>
        </div>
        <div class="aw-qr">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="108"
            height="108"
            viewBox="0 0 27 27"
            shape-rendering="crispEdges"
            aria-label="QR code"
          >
            <path fill="#fdf9f2" d="M0 0h27v27H0z" />
            <path
              stroke="#1a1a1a"
              d="M1 1.5h7m6 0h1m1 0h1m2 0h7M1 2.5h1m5 0h1m2 0h8m1 0h1m5 0h1M1 3.5h1m1 0h3m1 0h1m1 0h6m1 0h1m2 0h1m1 0h3m1 0h1M1 4.5h1m1 0h3m1 0h1m1 0h2m1 0h2m1 0h1m1 0h1m1 0h1m1 0h3m1 0h1M1 5.5h1m1 0h3m1 0h1m1 0h2m1 0h2m3 0h1m1 0h1m1 0h3m1 0h1M1 6.5h1m5 0h1m1 0h1m1 0h1m1 0h1m2 0h2m1 0h1m5 0h1M1 7.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M9 8.5h1m5 0h2M1 9.5h1m1 0h5m2 0h2m4 0h1m2 0h5M3 10.5h1m5 0h7m1 0h1m2 0h1m3 0h1M4 11.5h5m1 0h1m1 0h5m4 0h2m1 0h2M1 12.5h2m1 0h2m3 0h1m1 0h1m1 0h2m1 0h1m1 0h4m3 0h1M1 13.5h2m1 0h2m1 0h4m2 0h1m1 0h5m1 0h1m1 0h3M1 14.5h2m1 0h3m2 0h2m6 0h2m1 0h1m1 0h1m1 0h1M1 15.5h1m3 0h1m1 0h2m2 0h3m2 0h1m1 0h5m1 0h2M1 16.5h1m1 0h3m2 0h3m1 0h1m2 0h1m1 0h1m1 0h3m3 0h1M1 17.5h1m2 0h4m2 0h1m1 0h1m4 0h5m1 0h1M9 18.5h1m3 0h5m3 0h2M1 19.5h7m6 0h2m1 0h1m1 0h1m1 0h1m1 0h3M1 20.5h1m5 0h1m1 0h1m1 0h1m1 0h2m1 0h2m3 0h2m1 0h2M1 21.5h1m1 0h3m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7m1 0h1m1 0h1M1 22.5h1m1 0h3m1 0h1m1 0h3m6 0h2m1 0h5M1 23.5h1m1 0h3m1 0h1m1 0h2m1 0h2m2 0h1m1 0h1m3 0h2m1 0h1M1 24.5h1m5 0h1m2 0h1m1 0h1m2 0h3m2 0h3m2 0h1M1 25.5h7m1 0h1m2 0h1m5 0h8"
            />
          </svg>
        </div>
      </div>

      <div class="aw-owner">
        <p class="aw-name">NITYA SUON</p>
        <p class="aw-handle">nitya.pay</p>
      </div>

      <dl class="aw-stats">
        <div v-for="stat in stats" :key="stat.label">
          <dt>{{ stat.label }}</dt>
          <dd>{{ stat.value }}</dd>
        </div>
      </dl>
    </article>
    </div>
  </div>
</template>

<style scoped>
.aw-card {
  position: relative;
  width: 520px;
  height: 328px;
  border-radius: 22px;
  padding: 34px;
  overflow: hidden;
  color: #fff8f0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  background:
    radial-gradient(120% 140% at 15% 0%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 35%),
    linear-gradient(135deg, #e08a49 0%, #cf6f2e 22%, #b8551f 48%, #a3481a 70%, #8a3d15 100%);
  box-shadow:
    0 30px 60px rgba(80, 40, 10, 0.35),
    0 6px 16px rgba(80, 40, 10, 0.25),
    inset 0 1px 1px rgba(255, 255, 255, 0.4),
    inset 0 -2px 6px rgba(0, 0, 0, 0.25);
  transform: scale(calc(100cqw / 520px));
  transform-origin: top left;
}

.aw-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    100deg,
    rgba(255, 255, 255, 0.05) 0px,
    rgba(255, 255, 255, 0.05) 1px,
    rgba(0, 0, 0, 0.02) 2px,
    rgba(0, 0, 0, 0.02) 3px
  );
  mix-blend-mode: overlay;
  pointer-events: none;
}

.aw-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.aw-brand h2 {
  margin: 0;
  font-size: 27px;
  font-weight: 800;
  letter-spacing: 1px;
  text-shadow:
    1px 1.5px 1px rgba(0, 0, 0, 0.35),
    -0.5px -0.5px 0.5px rgba(255, 255, 255, 0.25);
}

.aw-brand p {
  margin: 4px 0 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.5px;
  opacity: 0.85;
  text-transform: uppercase;
}

.aw-qr {
  background: #fdf9f2;
  border-radius: 10px;
  padding: 8px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.25);
  line-height: 0;
}

.aw-qr svg {
  display: block;
  border-radius: 3px;
}

.aw-owner {
  margin-top: 34px;
}

.aw-name {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-shadow:
    1px 1.5px 1px rgba(0, 0, 0, 0.35),
    -0.5px -0.5px 0.5px rgba(255, 255, 255, 0.25);
}

.aw-handle {
  margin: 2px 0 0;
  font-size: 13px;
  font-weight: 500;
  opacity: 0.85;
}

.aw-stats {
  position: absolute;
  right: 34px;
  bottom: 28px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 34px;
  row-gap: 14px;
  margin: 0;
  text-align: right;
}

.aw-stats dt {
  margin: 0 0 2px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.75;
}

.aw-stats dd {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  text-shadow: 0.5px 1px 1px rgba(0, 0, 0, 0.3);
}
</style>
