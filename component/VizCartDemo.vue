<script setup lang="ts">
import { computed, ref } from 'vue';

type Mode = 'bad' | 'good';

const mode = ref<Mode>('bad');
const cardCount = ref(0);
const iconCount = ref(0);
const sharedCount = ref(0);

const isGood = computed(() => mode.value === 'good');

const badge = computed(() => (isGood.value ? sharedCount.value : iconCount.value));
const cardShown = computed(() => (isGood.value ? sharedCount.value : cardCount.value));
const iconShown = computed(() => (isGood.value ? sharedCount.value : iconCount.value));

function setMode(next: Mode) {
  mode.value = next;
  resetCart();
}

function addToCart() {
  if (mode.value === 'bad') {
    cardCount.value += 1;
    return;
  }
  sharedCount.value += 1;
}

function resetCart() {
  cardCount.value = 0;
  iconCount.value = 0;
  sharedCount.value = 0;
}
</script>

<template>
  <div class="shop">
    <div class="shop-tabs" role="tablist">
      <button
        type="button"
        role="tab"
        class="shop-tab"
        :class="{ 'is-on': !isGood }"
        :aria-selected="!isGood"
        @click="setMode('bad')"
      >
        Without a store
      </button>
      <button
        type="button"
        role="tab"
        class="shop-tab"
        :class="{ 'is-on': isGood }"
        :aria-selected="isGood"
        @click="setMode('good')"
      >
        With a store
      </button>
    </div>

    <div class="shop-bar">
      <span class="shop-name">Café</span>
      <span class="shop-cart" aria-label="Cart">
        Cart
        <span class="shop-badge">{{ badge }}</span>
      </span>
    </div>

    <div class="shop-card">
      <p class="shop-cup" aria-hidden="true">Latte</p>
      <p class="shop-product">Latte</p>
      <p class="shop-price">$4.50</p>
      <div class="shop-actions">
        <button type="button" class="shop-btn shop-add" @click="addToCart">Add latte</button>
        <button type="button" class="shop-btn shop-reset" @click="resetCart">Reset</button>
      </div>
      <div class="shop-debug">
        Product card count: {{ cardShown }}<br />
        Cart icon count: {{ iconShown }}
      </div>
    </div>

    <div class="shop-note" :class="isGood ? 'is-good' : 'is-bad'">
      <p v-if="!isGood">
        <strong>Problem.</strong> Each piece has its own number. Add latte only updates the
        product card. The cart icon still says 0 — they are out of sync.
      </p>
      <p v-else>
        <strong>Fix.</strong> One shared store holds the count. The latte card and the cart icon
        both read that same number — always in sync.
      </p>
    </div>
  </div>
</template>

<style scoped>
.shop {
  margin: 20px 0 8px;
  max-width: 420px;
  border: 1px solid var(--mf-line, #eaeaea);
  border-radius: 8px;
  padding: 16px;
  background: var(--mf-graph, #fafafa);
}

.shop-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.shop-tab {
  flex: 1;
  height: 32px;
  border: 1px solid var(--mf-line, #eaeaea);
  border-radius: 6px;
  background: var(--mf-panel, #fff);
  color: var(--mf-muted, #787774);
  font-size: 12px;
  font-weight: 600;
}

.shop-tab.is-on {
  border-color: #7b2d8e;
  color: var(--mf-text, #37352f);
  background: color-mix(in srgb, #8b7cff 14%, var(--mf-panel, #fff));
}

.shop-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: var(--mf-panel, #fff);
  color: var(--mf-text, #37352f);
  border: 1px solid var(--mf-line, #eaeaea);
  border-radius: 6px;
  margin-bottom: 12px;
}

.shop-name {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.shop-cart {
  position: relative;
  font-size: 13px;
  font-weight: 600;
  padding-right: 10px;
  color: var(--mf-muted, #787774);
}

.shop-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  min-width: 18px;
  padding: 1px 6px;
  border-radius: 10px;
  background: #7b2d8e;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
}

.shop-card {
  text-align: center;
  padding: 16px 12px;
  border: 1px solid var(--mf-line, #eaeaea);
  border-radius: 6px;
  background: var(--mf-panel, #fff);
}

.shop-cup {
  margin: 0 auto 10px;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #1a1440;
  background: linear-gradient(180deg, #8b7cff 0%, #4A9EFF 48%, #ffffff 100%);
  border: 2.5px solid #fff;
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--mf-line, #eaeaea) 80%, transparent);
}

.shop-product { font-weight: 600; margin: 0 0 4px; }
.shop-price {
  color: #7b2d8e;
  font-weight: 700;
  margin: 0 0 12px;
}

.shop-actions { display: flex; justify-content: center; gap: 8px; }

.shop-btn {
  height: 32px;
  padding: 0 14px;
  border: 1px solid var(--mf-line, #eaeaea);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.shop-add {
  background: #7b2d8e;
  border-color: #7b2d8e;
  color: #fff;
}
.shop-reset {
  background: var(--mf-panel, #fff);
  color: var(--mf-muted, #787774);
}

.shop-debug {
  margin-top: 12px;
  padding: 10px;
  border-radius: 6px;
  background: var(--mf-graph, #fafafa);
  border: 1px solid var(--mf-line, #eaeaea);
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 12px;
  color: var(--mf-muted, #787774);
  text-align: left;
}

.shop-note {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.55;
}

.shop-note p { margin: 0; }

.shop-note.is-bad {
  background: color-mix(in srgb, #8b7cff 10%, var(--mf-graph, #fafafa));
  border-left: 3px solid #8b7cff;
}

.shop-note.is-good {
  background: color-mix(in srgb, #8b7cff 10%, var(--mf-graph, #fafafa));
  border-left: 3px solid #7b2d8e;
}
</style>
