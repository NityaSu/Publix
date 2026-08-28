<script setup lang="ts">
const grain =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
</script>

<template>
  <article
    class="relative h-[168px] w-full max-w-[420px] overflow-hidden rounded-[6px] text-[#2d1810] drop-shadow-[0_14px_28px_rgba(45,24,16,0.28)] bg-[linear-gradient(100deg,#ffe8d0_0%,#ffd4a8_18%,#ffb366_45%,#ff8c42_72%,#f06d1a_100%)]"
    aria-label="AutoWallet card"
  >
    <div
      class="pointer-events-none absolute -left-[5%] -top-[30%] z-[2] h-[160%] w-[60%] mix-blend-screen blur-[2px] bg-[radial-gradient(ellipse_70%_90%_at_35%_50%,rgba(255,250,240,0.85)_0%,rgba(255,235,210,0.4)_35%,transparent_65%)]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute right-0 top-0 z-[2] h-full w-[45%] bg-[radial-gradient(circle_at_85%_50%,rgba(255,100,30,0.3)_0%,transparent_55%)]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 z-[3] shadow-[inset_0_0_40px_rgba(160,60,10,0.15)]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 z-[4] bg-[length:180px] opacity-[0.22] mix-blend-multiply"
      :style="{ backgroundImage: grain }"
      aria-hidden="true"
    />
    <div class="absolute -top-[9px] left-[18px] z-10 size-[18px] rounded-full bg-[#140e0a]" aria-hidden="true" />
    <div class="absolute -top-[9px] right-[18px] z-10 size-[18px] rounded-full bg-[#140e0a]" aria-hidden="true" />
    <div class="absolute -bottom-[9px] left-[18px] z-10 size-[18px] rounded-full bg-[#140e0a]" aria-hidden="true" />
    <div class="absolute -bottom-[9px] right-[18px] z-10 size-[18px] rounded-full bg-[#140e0a]" aria-hidden="true" />
    <div
      class="pointer-events-none absolute bottom-4 right-[52px] top-4 z-[4] border-l-[1.5px] border-dashed border-[rgba(45,24,14,0.08)]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute right-2.5 top-1/2 z-[4] -translate-y-1/2 text-[36px] font-black uppercase leading-[0.85] tracking-[2px] text-[rgba(45,24,14,0.055)] [writing-mode:vertical-rl]"
      aria-hidden="true"
    >
      WALLET
    </div>

    <div class="relative z-[5] flex h-full flex-col justify-between px-4 pb-2.5 pt-3">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-[7px]">
          <svg width="28" height="18" viewBox="0 0 42 28" fill="none" aria-hidden="true">
            <path
              d="M12 20C5.373 20 0 15.523 0 10C0 4.477 5.373 0 12 0C14.5 0 16.8 0.7 18.7 2C20.5 0.8 22.7 0 25 0C31.627 0 37 4.477 37 10C37 10.5 36.95 11 36.85 11.5C39.6 12.8 41.5 15.5 41.5 18.5C41.5 23.2 37.8 27 33 27H12C5.373 27 0 22.627 0 17C0 14.5 1 12.2 2.8 10.5"
              fill="rgba(45,24,14,0.1)"
              stroke="rgba(45,24,14,0.55)"
              stroke-width="1.4"
            />
            <circle cx="14" cy="8" r="2.2" fill="rgba(45,24,14,0.35)" />
            <circle cx="22" cy="6" r="1.6" fill="rgba(45,24,14,0.25)" />
          </svg>
          <span class="text-[8px] font-extrabold uppercase tracking-[2.4px] opacity-60">AutoWallet</span>
        </div>
        <div class="flex items-center gap-[5px] rounded-[20px] border border-[rgba(45,24,14,0.12)] bg-[rgba(45,24,14,0.06)] px-2 py-[3px]">
          <span class="size-[5px] rounded-full bg-[#3cb371] shadow-[0_0_5px_rgba(60,179,113,0.5)]" />
          <span class="text-[8px] font-bold uppercase not-italic tracking-[0.8px] opacity-75">Active</span>
        </div>
      </div>

      <div>
        <p class="mb-1 text-[8px] font-bold uppercase tracking-[1.8px] opacity-45">Agent Wallet · Owner</p>
        <h2 class="m-0 text-[22px] font-black uppercase leading-[0.95] tracking-[-0.6px]">
          Nitya<br />Suon
        </h2>
        <p class="mt-1 flex items-center gap-1.5 text-[10px]">
          <b class="font-bold opacity-70">Research Agent</b>
          <span class="opacity-35">·</span>
          <code class="font-mono text-[9px] opacity-45">research-agent.pay</code>
        </p>
      </div>

      <dl class="m-0 flex flex-wrap gap-3.5">
        <div>
          <dt class="mb-0.5 text-[7px] font-extrabold uppercase tracking-[1.2px] opacity-40">Balance</dt>
          <dd class="m-0 text-xs font-black tracking-[-0.3px]">$82.40 <small class="text-[9px] font-bold opacity-50">USD</small></dd>
        </div>
        <div>
          <dt class="mb-0.5 text-[7px] font-extrabold uppercase tracking-[1.2px] opacity-40">Daily Limit</dt>
          <dd class="m-0 text-xs font-black tracking-[-0.3px]">$10.00</dd>
        </div>
        <div>
          <dt class="mb-0.5 text-[7px] font-extrabold uppercase tracking-[1.2px] opacity-40">Used Today</dt>
          <dd class="m-0 text-xs font-black tracking-[-0.3px]">$3.42 <small class="text-[9px] font-bold opacity-50">34%</small></dd>
        </div>
        <div>
          <dt class="mb-0.5 text-[7px] font-extrabold uppercase tracking-[1.2px] opacity-40">Remaining</dt>
          <dd class="m-0 text-xs font-black tracking-[-0.3px]">$6.58</dd>
        </div>
      </dl>
    </div>
  </article>
</template>
