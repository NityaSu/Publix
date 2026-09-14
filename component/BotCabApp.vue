<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
    },
  ],
});

type Mode = 'rider' | 'driver';
type State =
  | 'IDLE'
  | 'ESTIMATE'
  | 'FINDING'
  | 'MATCHED'
  | 'ENROUTE'
  | 'TRIP'
  | 'DONE';

const LABEL: Record<State, string> = {
  IDLE: 'IDLE',
  ESTIMATE: 'REQUESTED',
  FINDING: 'REQUESTED',
  MATCHED: 'MATCHED',
  ENROUTE: 'DRIVER_EN_ROUTE',
  TRIP: 'IN_PROGRESS',
  DONE: 'COMPLETED',
};

const ALLOWED: Record<State, State[]> = {
  IDLE: ['ESTIMATE'],
  ESTIMATE: ['FINDING', 'IDLE'],
  FINDING: ['MATCHED', 'IDLE'],
  MATCHED: ['ENROUTE', 'IDLE'],
  ENROUTE: ['TRIP'],
  TRIP: ['DONE'],
  DONE: ['IDLE'],
};

const places = [
  { name: 'Home', detail: 'BKK1 · Chamkar Mon' },
  { name: 'Work', detail: 'Aeon Mall Sen Sok' },
  { name: 'Gym', detail: 'Wat Botum Park' },
];

const fareRows = [
  ['Base fare', '៛3,600'],
  ['Distance · 9.4 km', '៛2,800'],
  ['Time · 22 min', '៛1,400'],
  ['Surge ×1.4', '+៛1,800'],
] as const;

const mode = ref<Mode>('rider');
const s = ref<State>('IDLE');
const online = ref(false);
const carT = ref(0.12);
const carVisible = ref(false);
const dropVisible = ref(false);
const reqVal = ref(15);
const tripBar = ref(15);
const etaKm = ref(2.4);
const etaMin = ref(14);
const driverPhase = ref<'idle' | 'waiting' | 'request' | 'accepted' | 'expired' | 'declined'>('idle');

const routeEl = ref<SVGPathElement | null>(null);
const carEl = ref<SVGGElement | null>(null);

const timers: number[] = [];
let carTimer: number | null = null;
let reqTimer: number | null = null;

const pill = computed(() => (mode.value === 'driver' ? 'DRIVER' : LABEL[s.value]));
const showDrop = computed(
  () =>
    dropVisible.value ||
    s.value === 'ESTIMATE' ||
    s.value === 'FINDING' ||
    s.value === 'MATCHED' ||
    s.value === 'ENROUTE' ||
    s.value === 'TRIP' ||
    s.value === 'DONE',
);

function later(fn: () => void, ms: number) {
  timers.push(window.setTimeout(fn, ms));
}

function clearTimers() {
  timers.forEach(clearTimeout);
  timers.length = 0;
}

function routeLength() {
  return routeEl.value?.getTotalLength() ?? 0;
}

function placeCar() {
  const route = routeEl.value;
  const car = carEl.value;
  if (!route || !car) return;
  const p = route.getPointAtLength(routeLength() * carT.value);
  car.setAttribute('transform', `translate(${p.x},${p.y})`);
}

function startCar() {
  stopCar();
  carTimer = window.setInterval(() => {
    carT.value = Math.min(carT.value + 0.0035, 0.97);
    placeCar();
  }, 50);
}

function stopCar() {
  if (carTimer != null) {
    clearInterval(carTimer);
    carTimer = null;
  }
}

function clearReq() {
  if (reqTimer != null) {
    clearInterval(reqTimer);
    reqTimer = null;
  }
}

function go(next: State) {
  if (!ALLOWED[s.value].includes(next)) return;
  s.value = next;
}

function setTab(next: Mode) {
  mode.value = next;
  clearReq();
  if (next === 'rider') s.value = 'IDLE';
}

function showRequest() {
  if (!online.value || mode.value !== 'driver') return;
  reqVal.value = 15;
  driverPhase.value = 'request';
  clearReq();
  reqTimer = window.setInterval(() => {
    reqVal.value -= 0.1;
    if (reqVal.value <= 0) {
      clearReq();
      driverPhase.value = 'expired';
      later(() => {
        if (online.value && mode.value === 'driver') showRequest();
      }, 1800);
    }
  }, 100);
}

function acceptRide() {
  clearReq();
  driverPhase.value = 'accepted';
}

function declineRide() {
  clearReq();
  driverPhase.value = 'declined';
  later(() => {
    if (online.value && mode.value === 'driver') showRequest();
  }, 1800);
}

watch(s, async (next) => {
  clearTimers();
  dropVisible.value =
    next === 'ESTIMATE' ||
    next === 'FINDING' ||
    next === 'MATCHED' ||
    next === 'ENROUTE' ||
    next === 'TRIP' ||
    next === 'DONE';

  if (next === 'ENROUTE') startCar();
  if (next === 'DONE' || next === 'IDLE') {
    stopCar();
    carVisible.value = false;
    carT.value = 0.12;
  }

  if (next === 'FINDING') {
    carVisible.value = false;
    later(() => {
      carVisible.value = true;
      go('MATCHED');
    }, 2400);
  }

  if (next === 'MATCHED') {
    carVisible.value = true;
    await nextTick();
    placeCar();
  }

  if (next === 'ENROUTE') {
    tripBar.value = 15;
    later(function tick() {
      if (s.value !== 'ENROUTE') return;
      tripBar.value = Math.min(15 + carT.value * 100 * 0.35, 50);
      etaKm.value = Math.max(0.1, 2.4 - carT.value * 9);
      later(tick, 300);
    }, 0);
  }

  if (next === 'TRIP') {
    later(function tick() {
      if (s.value !== 'TRIP') return;
      tripBar.value = Math.min(50 + carT.value * 100 * 0.47, 98);
      etaMin.value = Math.max(1, Math.round(14 - carT.value * 30));
      later(tick, 300);
    }, 0);
  }
});

watch(online, (v) => {
  clearReq();
  if (!v) {
    driverPhase.value = 'idle';
    return;
  }
  if (mode.value === 'driver') {
    driverPhase.value = 'waiting';
    later(() => showRequest(), 1500);
  }
});

watch(mode, () => {
  stopCar();
  carVisible.value = false;
  clearReq();
  if (mode.value === 'driver' && online.value) {
    driverPhase.value = 'waiting';
    later(() => showRequest(), 1500);
  }
});

onUnmounted(() => {
  clearTimers();
  stopCar();
  clearReq();
});
</script>

<template>
  <div class="botcab">
    <div class="bc-head">
      <div class="bc-brand">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 16v-2.5L6.2 8.5A2 2 0 0 1 8.1 7.2h7.8a2 2 0 0 1 1.9 1.3L20 13.5V16" />
          <circle cx="7.5" cy="17" r="1.6" />
          <circle cx="16.5" cy="17" r="1.6" />
          <path d="M9.5 7.2l-1 3.3h7l-1-3.3" />
        </svg>
        Botcab
      </div>
      <div class="bc-spacer" />
      <div class="bc-chip bc-chip-muted">{{ pill }}</div>
      <div class="bc-tabs">
        <button type="button" class="bc-tab" :class="{ 'is-on': mode === 'rider' }" @click="setTab('rider')">Rider</button>
        <button type="button" class="bc-tab" :class="{ 'is-on': mode === 'driver' }" @click="setTab('driver')">Driver</button>
      </div>
    </div>

    <div class="bc-layout">
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
          <text x="530" y="210" text-anchor="middle" font-size="11" fill="var(--bc-ter)">Wat Phnom</text>
          <path
            ref="routeEl"
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
          <g :opacity="showDrop ? 1 : 0">
            <circle cx="470" cy="110" r="11" fill="var(--bc-pri)" />
            <text x="470" y="115" text-anchor="middle" font-size="12" fill="var(--bc-ink)" font-weight="500">B</text>
          </g>
          <g ref="carEl" :opacity="carVisible ? 1 : 0">
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
        <template v-if="mode === 'rider'">
          <div v-if="s === 'IDLE'" class="bc-fade">
            <div class="bc-meta" style="margin-bottom: 4px">Good evening, Sreypov</div>
            <div class="bc-hero">Where to?</div>
            <div class="bc-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M11.5 3C16.19 3 20 6.81 20 11.5c0 2.02-.71 3.88-1.89 5.34l3.02 3.02a1.5 1.5 0 0 1-2.12 2.12l-3.02-3.02A8.44 8.44 0 0 1 11.5 20C6.81 20 3 16.19 3 11.5S6.81 3 11.5 3zm0 2.8a5.7 5.7 0 1 0 0 11.4 5.7 5.7 0 0 0 0-11.4z" />
              </svg>
              <span>Search destination</span>
            </div>
            <div class="bc-meta" style="margin-bottom: 4px">Saved places</div>
            <button v-for="place in places" :key="place.name" type="button" class="bc-row" @click="go('ESTIMATE')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--bc-ter)" aria-hidden="true">
                <path d="M12 2.1a9 9 0 0 1 9 9c0 2.28-1.19 4.38-2.71 6.1-1.52 1.73-3.25 3-4.12 3.57a.9.9 0 0 1-1.04 0c-.87-.57-2.6-1.84-4.12-3.57A10.9 10.9 0 0 1 3 11.1a9 9 0 0 1 9-9zm0 6.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z" />
              </svg>
              <span>
                <span class="bc-row-title">{{ place.name }}</span>
                <span class="bc-meta">{{ place.detail }}</span>
              </span>
            </button>
          </div>

          <div v-else-if="s === 'ESTIMATE'" class="bc-fade">
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
            <button type="button" class="bc-btn bc-btn-pri" @click="go('FINDING')">Request BotCab</button>
            <button type="button" class="bc-btn bc-btn-ghost" @click="go('IDLE')">Back</button>
          </div>

          <div v-else-if="s === 'FINDING'" class="bc-fade bc-center bc-finding">
            <div class="bc-steer" aria-hidden="true" />
            <div class="bc-title">Finding your driver…</div>
            <div class="bc-meta bc-find-meta">
              GEOSEARCH radius expanding: 300 m → 500 m
              <br />→ 1 km
            </div>
          </div>

          <div v-else-if="s === 'MATCHED'" class="bc-fade">
            <div class="bc-chip bc-chip-pos">Driver matched</div>
            <div class="bc-driver">
              <div class="bc-avatar">D</div>
              <div class="bc-grow">
                <div class="bc-product-name">Dara P.</div>
                <div class="bc-stars">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--bc-pri)" aria-hidden="true">
                    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" />
                  </svg>
                  <span>4.9 · 2,140 trips</span>
                </div>
              </div>
              <div class="bc-right">
                <div class="bc-plate">2A-1234</div>
                <div class="bc-meta" style="margin-top: 4px">Toyota Corolla · White</div>
              </div>
            </div>
            <div class="bc-meta" style="margin-bottom: 8px">Arriving in about 3 min</div>
            <div class="bc-bar" style="margin-bottom: 16px"><i style="width: 15%" /></div>
            <button type="button" class="bc-btn bc-btn-pri" @click="go('ENROUTE')">Driver is on the way</button>
            <button type="button" class="bc-btn bc-btn-ghost" @click="go('IDLE')">Cancel · free within 2 min</button>
          </div>

          <div v-else-if="s === 'ENROUTE'" class="bc-fade">
            <div class="bc-title">Dara is heading to you</div>
            <div class="bc-meta" style="margin-bottom: 8px">Pickup: BKK1 · {{ etaKm.toFixed(1) }} km away</div>
            <div class="bc-bar" style="margin-bottom: 16px"><i :style="{ width: `${tripBar}%` }" /></div>
            <div class="bc-legend">
              <span><i class="bc-dot" />You</span>
              <span><i class="bc-pin" />Wat Phnom</span>
            </div>
            <button type="button" class="bc-btn bc-btn-pri" @click="go('TRIP')">Dara arrived · start trip</button>
          </div>

          <div v-else-if="s === 'TRIP'" class="bc-fade">
            <div class="bc-title">Heading to Wat Phnom</div>
            <div class="bc-meta" style="margin-bottom: 8px">Live location streaming over WebSocket</div>
            <div class="bc-bar" style="margin-bottom: 16px"><i :style="{ width: `${tripBar}%` }" /></div>
            <div class="bc-eta-line">
              ETA <span>{{ etaMin }} min</span> · ៛9,600 locked fare
            </div>
            <button type="button" class="bc-btn bc-btn-pri" @click="go('DONE')">Complete trip</button>
          </div>

          <div v-else class="bc-fade bc-center">
            <div class="bc-check">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--bc-pos)" aria-hidden="true">
                <path d="M19.3 5.9a1.5 1.5 0 0 1 2.12 2.12L9.66 18.1a1.5 1.5 0 0 1-2.12 0l-4.97-4.97a1.5 1.5 0 1 1 2.12-2.12l3.33 3.32L19.3 5.9z" />
              </svg>
            </div>
            <div class="bc-title">You have arrived</div>
            <div class="bc-meta" style="margin-bottom: 16px">Rate Dara · ★★★★★</div>
            <div class="bc-receipt">
              <div v-for="row in fareRows" :key="row[0]" class="bc-receipt-row">
                <span>{{ row[0] }}</span>
                <span>{{ row[1] }}</span>
              </div>
              <div class="bc-receipt-total">
                <span>Total</span>
                <span>៛9,600 <span class="bc-meta">· $2.40</span></span>
              </div>
            </div>
            <button type="button" class="bc-btn bc-btn-pri" @click="go('IDLE')">Book another ride</button>
          </div>
        </template>

        <template v-else>
          <div class="bc-fade">
            <div class="bc-driver-head">
              <div>
                <div class="bc-title">Driver console</div>
                <div class="bc-meta">Dara P. · 2A-1234</div>
              </div>
              <label class="bc-switch-label">
                <span>{{ online ? 'Online' : 'Offline' }}</span>
                <input v-model="online" type="checkbox" class="bc-switch" />
              </label>
            </div>

            <div v-if="!online" class="bc-center bc-off">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path d="M4 16v-2.5L6.2 8.5A2 2 0 0 1 8.1 7.2h7.8a2 2 0 0 1 1.9 1.3L20 13.5V16" />
                <circle cx="7.5" cy="17" r="1.6" />
                <circle cx="16.5" cy="17" r="1.6" />
              </svg>
              <div>Go online to receive ride requests</div>
            </div>
            <div v-else-if="driverPhase === 'accepted'" class="bc-center">
              <div class="bc-product-name">Trip accepted</div>
              <div class="bc-meta">Navigate to pickup · BKK1, 2.4 km</div>
            </div>
            <div v-else-if="driverPhase === 'declined'" class="bc-meta bc-center">
              Declined — waiting for next request
            </div>
            <div v-else-if="driverPhase === 'expired'" class="bc-meta bc-center">
              Request expired — reassigned to next driver
            </div>
            <div v-else-if="driverPhase === 'request'" class="bc-request">
              <div class="bc-request-top">
                <span class="bc-product-name">New request</span>
                <div class="bc-right">
                  <div class="bc-product-price" style="font-size: 16px; font-weight: 500">៛9,600</div>
                  <div class="bc-meta">$2.40</div>
                </div>
              </div>
              <div class="bc-stop"><i class="bc-dot" />BKK1 · Street 63</div>
              <div class="bc-stop bc-stop-b"><i class="bc-pin" />Wat Phnom · 9.4 km</div>
              <div class="bc-bar" style="margin-bottom: 12px"><i class="is-warn" :style="{ width: `${(reqVal / 15) * 100}%` }" /></div>
              <div class="bc-actions">
                <button type="button" class="bc-btn bc-btn-pri" @click="acceptRide">Accept</button>
                <button type="button" class="bc-btn bc-btn-ghost" @click="declineRide">Decline</button>
              </div>
            </div>
            <div v-else class="bc-meta bc-center">Waiting for requests…</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.botcab {
  --bc-font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --bc-pri: #e9ebf1;
  --bc-sec: #a3a9b8;
  --bc-ter: #6d7486;
  --bc-q: #454b5c;
  --bc-pos: #4ade80;
  --bc-warn: #fb923c;
  --bc-ink: #101216;
  --t-fast: 0.15s;
  --ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);
  width: 100%;
  max-width: 960px;
  color: var(--bc-pri);
  font-family: var(--bc-font);
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
}

.botcab button,
.botcab input {
  font-family: inherit;
}

.bc-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.bc-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 900;
  color: #06c167;
}

.bc-spacer {
  flex: 1;
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
  font-variant-numeric: tabular-nums;
}

.bc-chip-warn {
  background: color-mix(in srgb, var(--bc-warn) 15%, transparent);
  color: var(--bc-warn);
}

.bc-chip-pos {
  margin-bottom: 12px;
  background: color-mix(in srgb, var(--bc-pos) 12%, transparent);
  color: var(--bc-pos);
}

.bc-tabs {
  display: flex;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--bc-q) 35%, transparent);
  border-radius: 10px;
}

.bc-tab {
  padding: 8px 14px;
  border: 0;
  background: transparent;
  color: var(--bc-sec);
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.bc-tab.is-on {
  background: var(--bc-pri);
  color: var(--bc-ink);
}

.bc-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  align-items: start;
  gap: 16px;
}

.bc-map-wrap {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--bc-q) 30%, transparent);
  border-radius: 12px;
}

.bc-map {
  display: block;
  width: 100%;
  background: color-mix(in srgb, var(--bc-q) 5%, transparent);
}

.bc-map-live {
  position: absolute;
  top: 10px;
  left: 10px;
  background: color-mix(in srgb, var(--bc-q) 18%, transparent);
  color: var(--bc-sec);
}

.bc-dot,
.bc-pin {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 8px;
  border-radius: 999px;
  background: var(--bc-pos);
}

.bc-map-live .bc-dot {
  width: 7px;
  height: 7px;
  margin: 0;
  border-radius: 1px;
}

.bc-pin {
  background: var(--bc-pri);
}

.bc-redis {
  position: absolute;
  bottom: 10px;
  left: 10px;
  padding: 3px 8px;
  border-radius: 6px;
  font-family: 'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace;
  font-size: 11px;
  color: var(--bc-ter);
  background: color-mix(in srgb, var(--bc-q) 15%, transparent);
}

.bc-panel {
  min-width: 0;
  padding: 16px;
  border: 1px solid color-mix(in srgb, var(--bc-q) 30%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--bc-q) 7%, transparent);
}

.bc-fade {
  animation: bc-fade 0.25s var(--ease-out);
}

.bc-hero {
  margin-bottom: 12px;
  font-size: 20px;
  font-weight: 500;
}

.bc-title {
  margin-bottom: 2px;
  font-size: 17px;
  font-weight: 500;
}

.bc-meta {
  font-size: 12px;
  color: var(--bc-ter);
}

.bc-mb12 {
  margin-bottom: 12px;
}

.bc-mb16 {
  margin-bottom: 16px;
}

.bc-search {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--bc-q) 35%, transparent);
  border-radius: 10px;
  color: var(--bc-ter);
  font-size: 14px;
}

.bc-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.bc-row:hover {
  background: color-mix(in srgb, var(--bc-q) 10%, transparent);
}

.bc-row-title {
  display: block;
  font-size: 14px;
  font-weight: 500;
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

.bc-product,
.bc-driver {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.bc-product {
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
  border: 0;
  border-radius: 10px;
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.bc-btn-pri {
  background: var(--bc-pri);
  color: var(--bc-ink);
}

.bc-btn-ghost {
  margin-top: 8px;
  border: 1px solid color-mix(in srgb, var(--bc-q) 40%, transparent);
  background: transparent;
  color: var(--bc-pri);
}

.bc-btn:hover {
  opacity: 0.82;
}

.bc-center {
  padding: 24px 0;
  text-align: center;
}

.bc-finding {
  padding: 32px 16px;
}

.bc-finding .bc-title {
  font-weight: 600;
}

.bc-find-meta {
  line-height: 1.55;
}

.bc-steer {
  width: 52px;
  height: 52px;
  margin: 0 auto 16px;
  border: 3.5px solid var(--bc-pri);
  border-radius: 12px;
  animation: bc-spin 1s linear infinite;
}

.bc-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bc-q) 18%, transparent);
  font-size: 17px;
  font-weight: 500;
}

.bc-stars {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.bc-plate {
  padding: 2px 8px;
  border: 1px solid color-mix(in srgb, var(--bc-q) 35%, transparent);
  border-radius: 6px;
  font-family: 'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace;
  font-size: 13px;
}

.bc-bar {
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bc-q) 25%, transparent);
}

.bc-bar > i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--bc-pri);
  transition: width 0.3s var(--ease-out);
}

.bc-bar > i.is-warn {
  background: var(--bc-warn);
}

.bc-legend {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--bc-sec);
}

.bc-legend span,
.bc-eta-line {
  display: flex;
  align-items: center;
  gap: 6px;
}

.bc-eta-line {
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--bc-sec);
}

.bc-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin: 0 auto 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bc-pos) 12%, transparent);
}

.bc-receipt {
  margin-bottom: 16px;
  padding-top: 12px;
  border-top: 1px solid color-mix(in srgb, var(--bc-q) 25%, transparent);
  text-align: left;
  font-size: 14px;
}

.bc-receipt-row {
  display: flex;
  justify-content: space-between;
  padding: 3px 0;
  color: var(--bc-sec);
  font-variant-numeric: tabular-nums;
}

.bc-receipt-total {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px dashed color-mix(in srgb, var(--bc-q) 35%, transparent);
  font-weight: 500;
}

.bc-driver-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.bc-switch-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--bc-sec);
}

.bc-switch {
  appearance: none;
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bc-q) 35%, transparent);
  cursor: pointer;
  transition: background var(--t-fast) var(--ease-out);
}

.bc-switch:checked {
  background: var(--bc-pos);
}

.bc-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: var(--bc-ink);
  transition: left var(--t-fast) var(--ease-out);
}

.bc-switch:checked::after {
  left: 22px;
}

.bc-off {
  color: var(--bc-ter);
  font-size: 14px;
}

.bc-off svg {
  opacity: 0.5;
}

.bc-request {
  padding: 14px;
  border: 1px solid color-mix(in srgb, var(--bc-q) 35%, transparent);
  border-radius: 10px;
}

.bc-request-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}

.bc-stop {
  margin-bottom: 2px;
  font-size: 13px;
}

.bc-stop-b {
  margin-bottom: 12px;
  color: var(--bc-sec);
}

.bc-actions {
  display: flex;
  gap: 8px;
}

.bc-actions .bc-btn {
  flex: 1;
  margin-top: 0;
}

.bc-pulse {
  animation: bc-pulse 1.6s ease-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}

@keyframes bc-fade {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes bc-spin {
  to {
    transform: rotate(360deg);
  }
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

@media (max-width: 720px) {
  .bc-layout {
    grid-template-columns: 1fr;
  }

  .bc-fare {
    font-size: 24px;
  }
}
</style>
