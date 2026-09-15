<template>
  <div class="absolute inset-0 overflow-hidden bg-[#0c0e13] [container-type:size]" aria-label="podsum">
    <div
      class="absolute left-1/2 top-1/2 [container-type:size]"
      :style="{
        width: 'min(100cqw, calc(100cqh * 16 / 9))',
        height: 'min(100cqh, calc(100cqw * 9 / 16))',
        transform: 'translate(-50%, -50%)',
      }"
    >
      <div class="ps">
        <header class="ps-head">
          <span class="ps-brand">podsum</span>
          <span class="ps-chip">LOCAL</span>
          <span class="ps-meta">ollama:qwen3:8b</span>
        </header>

        <p class="ps-cmd">
          <span class="ps-prompt">$</span>
          podsum summarize youtube.com/watch?v=VIDEO_ID -o notes.md
        </p>

        <article class="ps-notes">
          <h2 class="ps-title">How Compilers Actually Optimise Loops</h2>
          <p class="ps-sub">118 min · 14 chapters</p>

          <p class="ps-label">TL;DR</p>
          <p class="ps-tldr">
            Most hand-written loop optimisations backfire on modern CPUs. The compiler already
            does them; unrolling by hand often makes things worse.
          </p>

          <p class="ps-label">Chapters</p>
          <div class="ps-row">
            <span class="ps-time">0:00</span>
            <span>Introductions and sponsor read</span>
          </div>
          <div class="ps-row">
            <span class="ps-time">4:12</span>
            <span>Why manual loop unrolling backfires</span>
          </div>
          <div class="ps-row">
            <span class="ps-time">18:40</span>
            <span>What -O2 actually changes</span>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ps {
  --ps-pri: #e9ebf1;
  --ps-sec: #a3a9b8;
  --ps-ter: #6d7486;
  --ps-line: #454b5c;
  --ps-accent: #4a9eff;
  width: 960px;
  height: 540px;
  padding: 18px 20px 20px;
  color: var(--ps-pri);
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 700;
  background: #0c0e13;
  transform: scale(calc(100cqw / 960px));
  transform-origin: top left;
  display: flex;
  flex-direction: column;
}

.ps-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  margin-bottom: 12px;
}

.ps-brand {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.ps-chip {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #101216;
  background: var(--ps-accent);
}

.ps-meta {
  margin-left: auto;
  font-family: 'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace;
  font-size: 12px;
  color: var(--ps-ter);
}

.ps-cmd {
  flex-shrink: 0;
  margin-bottom: 14px;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--ps-line) 45%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--ps-line) 12%, transparent);
  font-family: 'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace;
  font-size: 13px;
  font-weight: 600;
  color: var(--ps-sec);
}

.ps-prompt {
  color: var(--ps-accent);
  margin-right: 8px;
}

.ps-notes {
  flex: 1;
  min-height: 0;
  padding: 16px 18px;
  border: 1px solid color-mix(in srgb, var(--ps-line) 40%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--ps-line) 8%, transparent);
}

.ps-title {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.ps-sub {
  margin-top: 6px;
  font-size: 12px;
  color: var(--ps-ter);
}

.ps-label {
  margin-top: 16px;
  margin-bottom: 6px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ps-accent);
}

.ps-tldr {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.45;
  color: var(--ps-sec);
}

.ps-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-top: 8px;
  font-size: 14px;
  color: var(--ps-pri);
}

.ps-time {
  flex-shrink: 0;
  width: 48px;
  font-family: 'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace;
  font-size: 13px;
  font-weight: 800;
  color: var(--ps-accent);
}
</style>
