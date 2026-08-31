<script setup lang="ts">
import { computed, ref } from 'vue';

const treatAsData = ref(true);
const tokenInCookie = ref(true);
const comment = ref('');
const wall = ref<{ raw: string; stolen: boolean }[]>([]);
const stolen = ref(false);
const fakeToken = 'sess_a1b2';

const PAYLOAD = `<img src=x onerror="steal()">`;

const tokenLabel = computed(() =>
  tokenInCookie.value ? 'HttpOnly cookie (JS cannot read)' : 'localStorage (JS can read)',
);

function looksLikeAttack(raw: string) {
  return /<\s*img[\s\S]*onerror/i.test(raw) || /<\s*script/i.test(raw);
}

function pasteAttack() {
  comment.value = PAYLOAD;
}

function postComment() {
  const raw = comment.value.trim();
  if (!raw) return;
  const canSteal = looksLikeAttack(raw) && !treatAsData.value && !tokenInCookie.value;
  wall.value = [...wall.value, { raw, stolen: canSteal }];
  if (canSteal) stolen.value = true;
  comment.value = '';
}

function reset() {
  comment.value = '';
  wall.value = [];
  stolen.value = false;
  treatAsData.value = true;
  tokenInCookie.value = true;
}
</script>

<template>
  <div class="sx">
    <div class="sx-toggles">
      <div class="sx-toggle" role="tablist" aria-label="How comments render">
        <button
          type="button"
          class="sx-label"
          :class="{ 'is-on': !treatAsData }"
          @click="treatAsData = false"
        >
          Trust user HTML
        </button>
        <button
          type="button"
          class="sx-switch"
          :class="{ 'is-on': treatAsData }"
          :aria-pressed="treatAsData"
          aria-label="Toggle treat comments as data"
          @click="treatAsData = !treatAsData"
        >
          <span class="sx-knob" />
        </button>
        <button
          type="button"
          class="sx-label"
          :class="{ 'is-on': treatAsData }"
          @click="treatAsData = true"
        >
          Treat as data
        </button>
      </div>

      <div class="sx-toggle" role="tablist" aria-label="Where the session token lives">
        <button
          type="button"
          class="sx-label"
          :class="{ 'is-on': !tokenInCookie }"
          @click="tokenInCookie = false"
        >
          Token in localStorage
        </button>
        <button
          type="button"
          class="sx-switch"
          :class="{ 'is-on': tokenInCookie }"
          :aria-pressed="tokenInCookie"
          aria-label="Toggle token storage"
          @click="tokenInCookie = !tokenInCookie"
        >
          <span class="sx-knob" />
        </button>
        <button
          type="button"
          class="sx-label"
          :class="{ 'is-on': tokenInCookie }"
          @click="tokenInCookie = true"
        >
          HttpOnly cookie
        </button>
      </div>
    </div>

    <div class="sx-page">
      <div class="sx-chrome">
        <span class="sx-url">shop.test/product</span>
        <span class="sx-token" :class="{ 'is-safe': tokenInCookie }">
          session · {{ tokenLabel }}
        </span>
      </div>

      <p class="sx-kicker">Comment wall</p>

      <ul class="sx-wall">
        <li v-if="!wall.length" class="sx-empty">No comments yet.</li>
        <li v-for="(item, index) in wall" :key="`${index}-${item.raw}`" class="sx-item">
          <p v-if="treatAsData" class="sx-text">{{ item.raw }}</p>
          <p v-else-if="looksLikeAttack(item.raw)" class="sx-html">
            [broken image · a handler tried to run]
          </p>
          <p v-else class="sx-html">{{ item.raw }}</p>
          <p v-if="item.stolen" class="sx-leak">Attack script ran. Token {{ fakeToken }} left the tab.</p>
          <p v-else-if="!treatAsData && looksLikeAttack(item.raw)" class="sx-warn">
            Markup ran in the page. Cookie is HttpOnly so the token stayed put.
          </p>
        </li>
      </ul>

      <label class="sx-field">
        <span>Write a comment</span>
        <textarea v-model="comment" rows="2" placeholder="Nice shoes." />
      </label>
      <div class="sx-actions">
        <button type="button" class="sx-btn" @click="postComment">Post</button>
        <button type="button" class="sx-btn sx-btn-ghost" @click="pasteAttack">Paste XSS payload</button>
        <button type="button" class="sx-reset" @click="reset">Reset demo</button>
      </div>
    </div>

    <p v-if="stolen" class="sx-banner">
      Session stolen. The attacker now has <code>{{ fakeToken }}</code> because the page treated their comment as HTML and JavaScript could read storage.
    </p>
    <p v-else class="sx-caption">
      <template v-if="treatAsData">
        Comments are text. Tags stay on screen. Nothing runs.
      </template>
      <template v-else-if="tokenInCookie">
        HTML can still run, but the session cookie is HttpOnly — JS on this page cannot read it.
      </template>
      <template v-else>
        Trusting HTML plus a token in localStorage is how a comment steals the session.
      </template>
    </p>
  </div>
</template>

<style scoped>
.sx {
  margin: 8px 0 28px;
  padding: 18px 16px 14px;
  border: 1px solid var(--mf-line, #eaeaea);
  border-radius: 10px;
  background: var(--mf-graph, #fafafa);
}

.sx-toggles {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.sx-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.sx-label {
  border: 0;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: var(--mf-muted, #787774);
  padding: 0;
}

.sx-label.is-on {
  color: var(--mf-text, #37352f);
}

.sx-switch {
  width: 44px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid var(--mf-line, #eaeaea);
  background: #e6e6e6;
  position: relative;
  padding: 0;
}

.sx-switch.is-on {
  background: #7b2d8e;
  border-color: #7b2d8e;
}

.sx-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.18s ease;
}

.sx-switch.is-on .sx-knob {
  transform: translateX(20px);
}

.sx-page {
  max-width: 520px;
  margin: 0 auto;
  background: var(--mf-panel, #fff);
  border: 1px solid var(--mf-line, #eaeaea);
  border-radius: 8px;
  padding: 12px 14px 14px;
}

.sx-chrome {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  margin: -12px -14px 14px;
  border-bottom: 1px solid var(--mf-line, #eaeaea);
  background: color-mix(in srgb, var(--mf-muted, #787774) 8%, var(--mf-panel, #fff));
  border-radius: 8px 8px 0 0;
}

.sx-url {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 11px;
  color: var(--mf-muted, #787774);
}

.sx-token {
  font-size: 11px;
  font-weight: 600;
  color: #e03131;
}

.sx-token.is-safe {
  color: #7b2d8e;
}

.sx-kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7b2d8e;
  margin: 0 0 8px;
}

.sx-wall {
  list-style: none;
  margin: 0 0 12px;
  padding: 0;
  min-height: 72px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sx-empty,
.sx-item {
  padding: 8px 10px;
  border: 1px solid var(--mf-line, #eaeaea);
  border-radius: 6px;
  font-size: 13px;
  background: var(--mf-graph, #fafafa);
}

.sx-empty {
  color: var(--mf-muted, #787774);
}

.sx-text,
.sx-html {
  margin: 0;
  word-break: break-word;
}

.sx-leak,
.sx-warn {
  margin: 6px 0 0;
  font-size: 12px;
}

.sx-leak { color: #e03131; }
.sx-warn { color: var(--mf-muted, #787774); }

.sx-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--mf-muted, #787774);
}

.sx-field textarea {
  width: 100%;
  resize: vertical;
  border: 1px solid var(--mf-line, #eaeaea);
  border-radius: 6px;
  padding: 8px 10px;
  font: inherit;
  font-weight: 400;
  color: var(--mf-text, #37352f);
  background: var(--mf-panel, #fff);
}

.sx-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: 10px;
}

.sx-btn {
  height: 30px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid #7b2d8e;
  background: #7b2d8e;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.sx-btn-ghost {
  background: var(--mf-panel, #fff);
  color: var(--mf-text, #37352f);
  border-color: var(--mf-line, #eaeaea);
}

.sx-reset {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: var(--mf-muted, #787774);
  font-size: 12px;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.sx-banner {
  margin: 14px 0 0;
  padding: 10px 12px;
  border-radius: 6px;
  background: color-mix(in srgb, #e03131 10%, var(--mf-graph, #fafafa));
  border-left: 3px solid #e03131;
  font-size: 13px;
  line-height: 1.55;
}

.sx-caption {
  margin: 14px 0 0;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--mf-text, #37352f);
}

.sx :deep(code) {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.86em;
}
</style>
