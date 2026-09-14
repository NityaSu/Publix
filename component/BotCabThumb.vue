<template>
  <div class="absolute inset-0 overflow-hidden bg-[#0c0e13] [container-type:size]" aria-label="BotCab">
    <div
      class="absolute left-1/2 top-1/2 [container-type:size]"
      :style="{
        width: 'min(100cqw, calc(100cqh * 16 / 9))',
        height: 'min(100cqh, calc(100cqw * 9 / 16))',
        transform: 'translate(-50%, -50%)',
      }"
    >
      <div class="bc">
        <header class="bc-head">
          <div class="bc-brand">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 16v-2.5L6.2 8.5A2 2 0 0 1 8.1 7.2h7.8a2 2 0 0 1 1.9 1.3L20 13.5V16" />
              <circle cx="7.5" cy="17" r="1.6" />
              <circle cx="16.5" cy="17" r="1.6" />
              <path d="M9.5 7.2l-1 3.3h7l-1-3.3" />
            </svg>
            BotCab
          </div>
          <div class="bc-spacer" />
          <div class="bc-chip bc-chip-muted">REQUESTED</div>
          <div class="bc-tabs">
            <span class="bc-tab is-on">Rider</span>
            <span class="bc-tab">Driver</span>
          </div>
        </header>

        <div class="bc-body">
          <div class="bc-map-wrap">
            <svg viewBox="0 0 600 400" class="bc-map">
              <g stroke="color-mix(in srgb, var(--bc-q) 45%, transparent)" stroke-width="1.5" fill="none">
                <path d="M0 80 H600 M0 170 H600 M0 260 H600 M0 340 H600" />
                <path d="M90 0 V400 M210 0 V400 M330 0 V400 M450 0 V400 M540 0 V400" />
              </g>
              <g stroke="color-mix(in srgb, var(--bc-q) 25%, transparent)" stroke-width="3" fill="none">
                <path d="M0 120 H600 M0 300 H600 M150 0 V400 M390 0 V400 M500 0 V400" />
              </g>
              <g fill="color-mix(in srgb, var(--bc-q) 9%, transparent)">
                <rect x="20" y="20" width="55" height="45" rx="6" />
                <rect x="230" y="30" width="80" height="60" rx="6" />
                <rect x="350" y="190" width="60" height="50" rx="6" />
                <rect x="100" y="280" width="90" height="45" rx="6" />
                <rect x="460" y="290" width="110" height="70" rx="6" />
                <rect x="410" y="30" width="70" height="60" rx="6" />
                <rect x="30" y="190" width="50" height="50" rx="6" />
                <rect x="230" y="280" width="80" height="45" rx="6" />
              </g>
              <rect x="480" y="140" width="100" height="130" rx="10" fill="color-mix(in srgb, var(--bc-pos) 9%, transparent)" />
              <text x="530" y="210" text-anchor="middle" font-size="11" font-weight="600" fill="var(--bc-ter)">Wat Phnom</text>
              <path
                d="M140 320 C 200 320, 210 260, 260 250 S 330 230, 350 190 S 420 150, 470 110"
                fill="none"
                stroke="var(--bc-pri)"
                stroke-width="3.5"
                stroke-linecap="round"
                opacity=".85"
              />
              <g>
                <circle cx="250" cy="140" r="5" fill="var(--bc-sec)" />
                <circle cx="420" cy="330" r="5" fill="var(--bc-sec)" />
                <circle cx="160" cy="200" r="5" fill="var(--bc-sec)" />
              </g>
              <g>
                <circle cx="140" cy="320" r="6" fill="var(--bc-pos)" />
                <circle cx="140" cy="320" r="6" fill="none" stroke="var(--bc-pos)" stroke-width="2" class="bc-pulse" />
              </g>
              <g>
                <circle cx="470" cy="110" r="11" fill="var(--bc-pri)" />
                <text x="470" y="115" text-anchor="middle" font-size="12" fill="var(--bc-ink)" font-weight="500">B</text>
              </g>
              <g transform="translate(188 292)">
                <rect x="-14" y="-9" width="28" height="18" rx="6" fill="var(--bc-pri)" />
                <rect x="-8" y="-5" width="10" height="10" rx="2.5" fill="var(--bc-ink)" opacity=".9" />
                <circle cx="8" cy="0" r="2.2" fill="var(--bc-pos)" />
              </g>
            </svg>
            <div class="bc-chip bc-map-live">
              <span class="bc-dot" />
              Live map
            </div>
            <div class="bc-redis">redis&gt; GEOSEARCH drivers +500m → 3 online</div>
          </div>

          <div class="bc-panel">
            <div class="bc-title">BKK1 → Wat Phnom</div>
            <div class="bc-meta bc-mb12">9.4 km · about 22 min</div>
            <div class="bc-fare-row">
              <span class="bc-fare">៛8,600 – ៛10,200</span>
              <span class="bc-chip bc-chip-warn">Surge ×1.4</span>
            </div>
            <div class="bc-meta bc-mb16">$2.15 – $2.55 · High demand right now — 3 drivers nearby</div>
            <div class="bc-product">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 16v-2.5L6.2 8.5A2 2 0 0 1 8.1 7.2h7.8a2 2 0 0 1 1.9 1.3L20 13.5V16" />
                <circle cx="7.5" cy="17" r="1.6" />
                <circle cx="16.5" cy="17" r="1.6" />
              </svg>
              <div class="bc-grow">
                <div class="bc-product-name">BotCab Go</div>
                <div class="bc-meta">4 seats · arrives in ~3 min</div>
              </div>
              <div class="bc-right">
                <div class="bc-product-price">៛9,600</div>
                <div class="bc-meta">$2.40</div>
              </div>
            </div>
            <div class="bc-btn bc-btn-pri">Request BotCab</div>
            <div class="bc-btn bc-btn-ghost">Back</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bc {
  --bc-font: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --bc-pri: #e9ebf1;
  --bc-sec: #a3a9b8;
  --bc-ter: #6d7486;
  --bc-q: #454b5c;
  --bc-pos: #4ade80;
  --bc-warn: #fb923c;
  --bc-ink: #101216;
  width: 960px;
  height: 540px;
  padding: 16px 18px 18px;
  color: var(--bc-pri);
  font-family: var(--bc-font);
  background: #0c0e13;
  transform: scale(calc(100cqw / 960px));
  transform-origin: top left;
  display: flex;
  flex-direction: column;
}

.bc-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.bc-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  color: #06c167;
}

.bc-spacer {
  flex: 1;
}

.bc-tabs {
  display: flex;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--bc-q) 35%, transparent);
  border-radius: 10px;
}

.bc-tab {
  padding: 8px 14px;
  font-size: 15px;
  font-weight: 500;
  color: var(--bc-sec);
}

.bc-tab.is-on {
  background: var(--bc-pri);
  color: var(--bc-ink);
}

.bc-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 12px;
}

.bc-chip-muted {
  background: color-mix(in srgb, var(--bc-q) 15%, transparent);
  color: var(--bc-sec);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.bc-chip-warn {
  background: color-mix(in srgb, var(--bc-warn) 15%, transparent);
  color: var(--bc-warn);
}

.bc-body {
  display: flex;
  align-items: stretch;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.bc-map-wrap {
  position: relative;
  flex: 1 1 360px;
  min-width: 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--bc-q) 30%, transparent);
  border-radius: 12px;
}

.bc-map {
  display: block;
  width: 100%;
  height: 100%;
  background: color-mix(in srgb, var(--bc-q) 5%, transparent);
}

.bc-map-live {
  position: absolute;
  top: 10px;
  left: 10px;
  background: color-mix(in srgb, var(--bc-q) 18%, transparent);
  color: var(--bc-sec);
  font-weight: 600;
}

.bc-dot {
  width: 7px;
  height: 7px;
  border-radius: 1px;
  background: var(--bc-pos);
}

.bc-redis {
  position: absolute;
  bottom: 10px;
  left: 10px;
  padding: 3px 8px;
  border-radius: 6px;
  font-family: 'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace;
  font-size: 11px;
  font-weight: 600;
  color: var(--bc-ter);
  background: color-mix(in srgb, var(--bc-q) 15%, transparent);
}

.bc-panel {
  flex: 1 1 300px;
  min-width: 280px;
  max-width: 360px;
  padding: 16px;
  border: 1px solid color-mix(in srgb, var(--bc-q) 30%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--bc-q) 7%, transparent);
}

.bc-title {
  margin-bottom: 2px;
  font-size: 17px;
  font-weight: 600;
}

.bc-meta {
  font-size: 12px;
  font-weight: 500;
  color: var(--bc-ter);
}

.bc-mb12 {
  margin-bottom: 12px;
}

.bc-mb16 {
  margin-bottom: 16px;
}

.bc-fare-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.bc-fare {
  font-size: 32px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.bc-product {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--bc-q) 30%, transparent);
  border-radius: 10px;
}

.bc-grow {
  flex: 1;
  min-width: 0;
}

.bc-product-name {
  font-size: 14px;
  font-weight: 500;
}

.bc-right {
  text-align: right;
}

.bc-product-price {
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

.bc-btn {
  width: 100%;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
}

.bc-btn-pri {
  background: var(--bc-pri);
  color: var(--bc-ink);
}

.bc-btn-ghost {
  margin-top: 8px;
  border: 1px solid color-mix(in srgb, var(--bc-q) 40%, transparent);
  color: var(--bc-pri);
}

.bc-pulse {
  animation: bc-pulse 1.6s ease-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}

@keyframes bc-pulse {
  0% {
    opacity: 0.8;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(3);
  }
}
</style>
