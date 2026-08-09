<script setup lang="ts">
import BlogDemoMedia from '~/component/BlogDemoMedia.vue';
import InsightsReadingShell from '~/component/InsightsReadingShell.vue';
import InsightsReadingToggle from '~/component/InsightsReadingToggle.vue';
import { mediaUrl } from '~/utils/media';

const GITHUB_URL = 'https://github.com/NityaSu/supercage';

const stackTags = ['Python', 'Ollama', 'Docker', 'FastAPI', 'React'] as const;

/** site-media object paths under images/blog/supercage and videos/blog/supercage */
const demos = {
  phase1Whoami: mediaUrl('images/blog/supercage/phase1-whoami.png'),
  phase1Desktop: mediaUrl('images/blog/supercage/phase1-desktop.png'),
  phase2Ui: mediaUrl('images/blog/supercage/phase2-ui.png'),
  phase3Root: mediaUrl('images/blog/supercage/phase3-root.png'),
  phase3DesktopSafe: mediaUrl('images/blog/supercage/phase3-desktop-safe.png'),
  phase4Success: mediaUrl('videos/blog/supercage/phase4-success.mp4'),
  phase4Block: mediaUrl('videos/blog/supercage/phase4-block.mp4'),
} as const;

useHead({
  title: 'Building supercage',
  meta: [
    {
      name: 'description',
      content:
        'A learning project: I built an unsafe AI coding agent first, then put it in a Docker cage, then connected a real dashboard.',
    },
  ],
});
</script>

<template>
  <InsightsReadingShell>
    <main>
      <article class="w-full px-6 md:px-20 lg:px-[160px] py-16 md:py-24">
        <!-- Hero -->
        <header class="max-w-3xl">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <p class="flex items-center gap-2 text-xs md:text-sm font-display font-semibold uppercase tracking-[0.3em] text-accent">
              Build notes
            </p>
            <InsightsReadingToggle />
          </div>
          <h1 class="mt-4 font-display font-extrabold ri-ink text-3xl sm:text-4xl md:text-5xl leading-tight">
            Building supercage: caging an AI coding agent
          </h1>
          <p class="mt-5 text-base md:text-lg ri-ink leading-relaxed">
            I built an unsafe agent first, then put it in a Docker cage, then connected a real dashboard.
          </p>
          <div class="mt-6 flex flex-wrap gap-2">
            <span
              v-for="tag in stackTags"
              :key="tag"
              class="font-dm text-[11px] uppercase tracking-[0.12em] ri-sub border ri-border px-2.5 py-1"
            >
              {{ tag }}
            </span>
          </div>
          <div class="mt-8 h-[2px] w-full ri-rule" />
        </header>

        <div class="mt-12 md:mt-16 max-w-3xl space-y-6 text-sm md:text-base ri-ink leading-relaxed">
          <section aria-labelledby="why-heading" class="space-y-4">
            <h2 id="why-heading" class="font-display font-bold ri-ink text-xl md:text-2xl">
              Why this exists
            </h2>
            <p>
              Modern AI coding agents don’t just chat. Through
              <strong class="ri-ink font-medium">tool calling</strong>
              — asking the model to invoke functions like “read this file” or “run this shell command” —
              they can read and write files and execute commands on your machine.
            </p>
            <p>
              That is powerful. It is also dangerous. If the agent’s shell tool runs on the host, it can
              touch everything your user account can touch.
            </p>
            <p>
              Phase 1 made that concrete for me: when the agent ran <code class="text-accent/90">whoami</code>,
              it returned my Mac username. When it wrote a file to Desktop, the file landed on my real Desktop —
              not a fake folder inside a demo.
            </p>
            <p>
              <strong class="ri-ink font-medium">supercage</strong> is a learning project. The point is
              the cage: understand how tools like Cursor keep agents safer by isolating what they can reach.
              It is not a production product.
            </p>
            <p>
              Code:
              <a
                :href="GITHUB_URL"
                target="_blank"
                rel="noopener noreferrer"
                class="text-accent hover:underline"
              >github.com/NityaSu/supercage</a>
            </p>
          </section>

          <section aria-labelledby="arch-heading" class="space-y-4 pt-4">
            <h2 id="arch-heading" class="font-display font-bold ri-ink text-xl md:text-2xl">
              Architecture (simple)
            </h2>
            <p>
              At a high level the loop is:
            </p>
            <ol class="list-decimal pl-5 space-y-2">
              <li>You send a message in the UI (or CLI).</li>
              <li>The agent (LLM + tools) decides whether to call <code class="text-accent/90">read_file</code>, <code class="text-accent/90">write_file</code>, or <code class="text-accent/90">run_command</code>.</li>
              <li>
                File tools hit a project
                <strong class="ri-ink font-medium">workspace</strong>
                folder.
              </li>
              <li>
                Shell commands go through a
                <strong class="ri-ink font-medium">sandbox</strong>
                — here, a throwaway Docker container with only <code class="text-accent/90">./workspace</code> mounted.
              </li>
              <li>
                Optional
                <strong class="ri-ink font-medium">policies</strong>
                can deny a tool before it runs (for example, Shell Commands off).
              </li>
            </ol>
            <div
              class="mt-6 rounded-xl border ri-border ri-surface px-5 py-6 font-dm text-xs sm:text-sm ri-ink leading-relaxed tracking-wide"
              role="img"
              aria-label="Flow: User to Agent to run_command to Docker sandbox with only workspace mounted"
            >
              <p class="text-center">
                User
                <span class="text-accent mx-1.5" aria-hidden="true">→</span>
                Agent (LLM + tools)
                <span class="text-accent mx-1.5" aria-hidden="true">→</span>
                run_command
                <span class="text-accent mx-1.5" aria-hidden="true">→</span>
                Docker sandbox
              </p>
              <p class="mt-3 text-center ri-sub">
                only <code class="text-accent/90">./workspace</code> mounted · network off by default
              </p>
            </div>
            <p>
              One more term:
              <strong class="ri-ink font-medium">SSE</strong>
              (Server-Sent Events) is how the dashboard streams live agent updates from the FastAPI backend —
              tokens, tool calls, and execution log lines — without you refreshing the page.
            </p>
          </section>
        </div>

        <div class="mt-16 md:mt-20 max-w-4xl space-y-20 md:space-y-24">
          <section aria-labelledby="phase1-heading" class="space-y-6">
            <div class="max-w-3xl space-y-4">
              <p class="font-dm text-xs uppercase tracking-[0.2em] text-accent">Phase 1</p>
              <h2 id="phase1-heading" class="font-display font-bold ri-ink text-2xl md:text-3xl">
                Unsafe CLI agent
              </h2>
              <p class="text-sm md:text-base ri-ink leading-relaxed">
                What I built:
              </p>
              <ul class="list-disc pl-5 space-y-2 text-sm md:text-base ri-ink leading-relaxed">
                <li>Ollama-backed agent with tool calling on the host</li>
                <li>Tools: <code class="text-accent/90">read_file</code>, <code class="text-accent/90">write_file</code>, <code class="text-accent/90">run_command</code></li>
                <li>Shell and writes could reach outside any “workspace” idea if the command said so</li>
              </ul>
              <p class="text-sm md:text-base ri-ink leading-relaxed">
                <strong class="ri-ink font-medium">What it proves:</strong>
                an agent with unrestricted shell access is not a toy. Path checks on file tools do not matter
                if <code class="text-accent/90">run_command</code> can do anything your user can do.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BlogDemoMedia
                kind="image"
                :src="demos.phase1Whoami"
                alt="Terminal showing whoami returning the Mac username nityasuon"
                caption="whoami on the host → my real Mac user (nityasuon)."
              />
              <BlogDemoMedia
                kind="image"
                :src="demos.phase1Desktop"
                alt="Desktop file agent-was-here.txt created on the real Mac Desktop"
                caption="agent-was-here.txt written to the real Desktop — not a sandbox."
              />
            </div>

            <p class="max-w-3xl text-sm md:text-base ri-ink leading-relaxed border-l-2 border-accent pl-4">
              <span class="font-dm text-xs uppercase tracking-[0.14em] text-accent">Takeaway</span><br />
              The danger is real. Workspace path checks don’t save you if shell is unrestricted.
            </p>
          </section>

          <section aria-labelledby="phase2-heading" class="space-y-6">
            <div class="max-w-3xl space-y-4">
              <p class="font-dm text-xs uppercase tracking-[0.2em] text-accent">Phase 2</p>
              <h2 id="phase2-heading" class="font-display font-bold ri-ink text-2xl md:text-3xl">
                React dashboard (mock UI)
              </h2>
              <ul class="list-disc pl-5 space-y-2 text-sm md:text-base ri-ink leading-relaxed">
                <li>Vite + Tailwind shell: chat, terminal, file tree, execution log, policy toggles</li>
                <li>Still mock data — not wired to the agent</li>
                <li>Looks like a product; the brains are not connected yet</li>
              </ul>
              <p class="text-sm md:text-base ri-ink leading-relaxed">
                <strong class="ri-ink font-medium">What it proves:</strong>
                you can design the control surface before the dangerous parts are live — chat, logs, and
                policy switches as first-class UI.
              </p>
            </div>

            <BlogDemoMedia
              kind="image"
              :src="demos.phase2Ui"
              alt="supercage React dashboard with chat, terminal, file tree, and policy toggles"
              caption="Dashboard shell — chat, terminal, file tree, execution log, policies."
              aspect="wide"
            />

            <p class="max-w-3xl text-sm md:text-base ri-ink leading-relaxed border-l-2 border-accent pl-4">
              <span class="font-dm text-xs uppercase tracking-[0.14em] text-accent">Takeaway</span><br />
              UI before wiring. Looks finished; the agent is still disconnected.
            </p>
          </section>

          <section aria-labelledby="phase3-heading" class="space-y-6">
            <div class="max-w-3xl space-y-4">
              <p class="font-dm text-xs uppercase tracking-[0.2em] text-accent">Phase 3</p>
              <h2 id="phase3-heading" class="font-display font-bold ri-ink text-2xl md:text-3xl">
                Docker sandbox (the cage)
              </h2>
              <ul class="list-disc pl-5 space-y-2 text-sm md:text-base ri-ink leading-relaxed">
                <li><code class="text-accent/90">run_command</code> goes through <code class="text-accent/90">sandbox/runner.py</code></li>
                <li>Fresh container per command</li>
                <li>Only <code class="text-accent/90">./workspace</code> mounted; host Desktop not available</li>
                <li>Network off by default</li>
              </ul>
              <p class="text-sm md:text-base ri-ink leading-relaxed">
                <strong class="ri-ink font-medium">What it proves:</strong>
                the same agent can still “succeed” inside the cage, while the host stays untouched.
                That is different from the model politely refusing — the command may run, just not on your Mac.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BlogDemoMedia
                kind="image"
                :src="demos.phase3Root"
                alt="whoami inside the sandbox returning root with a sandbox marker"
                caption="whoami → root, with a [sandbox] marker — not my Mac user."
              />
              <BlogDemoMedia
                kind="image"
                :src="demos.phase3DesktopSafe"
                alt="Escape attempt writing under /root/Desktop inside the container while real Mac Desktop is unchanged"
                caption="Escape write lands in the container; real Mac Desktop unchanged."
              />
            </div>

            <p class="max-w-3xl text-sm md:text-base ri-ink leading-relaxed border-l-2 border-accent pl-4">
              <span class="font-dm text-xs uppercase tracking-[0.14em] text-accent">Takeaway</span><br />
              Cage = Docker isolation, not a custom kernel sandbox — and not the same as model refusal.
            </p>
          </section>

          <section aria-labelledby="phase4-heading" class="space-y-6">
            <div class="max-w-3xl space-y-4">
              <p class="font-dm text-xs uppercase tracking-[0.2em] text-accent">Phase 4</p>
              <h2 id="phase4-heading" class="font-display font-bold ri-ink text-2xl md:text-3xl">
                FastAPI + live dashboard
              </h2>
              <ul class="list-disc pl-5 space-y-2 text-sm md:text-base ri-ink leading-relaxed">
                <li>Dashboard talks to the real agent via FastAPI + SSE</li>
                <li>Policy toggles (e.g. Shell Commands off) actually block tools</li>
                <li>Execution Log shows <code class="text-accent/90">BLOCK</code> when a tool is denied</li>
              </ul>
              <p class="text-sm md:text-base ri-ink leading-relaxed">
                <strong class="ri-ink font-medium">What it proves:</strong>
                the full loop works — UI → API → caged agent → live logs and policies.
                Important distinction:
                <em>cage success</em>
                (command runs in Docker, host safe) is not the same as a
                <em>policy BLOCK</em>
                (tool denied before it runs).
              </p>
            </div>

            <div class="space-y-8">
              <BlogDemoMedia
                kind="video"
                :src="demos.phase4Success"
                alt="Recording of creating hello.py, running it, and seeing Hello from supercage with file tree updates"
                caption="Success path: create hello.py, run it, see “Hello from supercage,” file tree updates."
                aspect="video"
              />
              <BlogDemoMedia
                kind="video"
                :src="demos.phase4Block"
                alt="Recording with Shell Commands off where whoami and python attempts show BLOCK in the execution log"
                caption="Block path: Shell Commands OFF — agent tries whoami/python; Execution Log shows blocked by policy."
                aspect="video"
              />
            </div>

            <p class="max-w-3xl text-sm md:text-base ri-ink leading-relaxed border-l-2 border-accent pl-4">
              <span class="font-dm text-xs uppercase tracking-[0.14em] text-accent">Takeaway</span><br />
              Policy UI must enforce for real. A toggle that only looks off is theater.
            </p>
          </section>
        </div>

        <footer class="mt-20 md:mt-28 max-w-3xl space-y-8">
          <div class="h-[2px] w-full border-t ri-border" />

          <section aria-labelledby="learned-heading" class="space-y-4">
            <h2 id="learned-heading" class="font-display font-bold ri-ink text-xl md:text-2xl">
              What I learned
            </h2>
            <ul class="list-disc pl-5 space-y-2 text-sm md:text-base ri-ink leading-relaxed">
              <li>Build the unsafe baseline first so the cage’s value is obvious.</li>
              <li>Isolation ≠ model refusal — Docker can let a command succeed without touching the host.</li>
              <li>Policy UI must enforce for real; logs should show BLOCK when a tool is denied.</li>
            </ul>
          </section>

          <section aria-labelledby="next-heading" class="space-y-4">
            <h2 id="next-heading" class="font-display font-bold ri-ink text-xl md:text-2xl">
              What’s next
            </h2>
            <ul class="list-disc pl-5 space-y-2 text-sm md:text-base ri-ink leading-relaxed">
              <li>Harden policies and make denial messages clearer in the UI</li>
              <li>Reduce noisy agent retry loops when a tool is blocked</li>
              <li>Better status when Docker is down or the sandbox can’t start</li>
            </ul>
          </section>

          <div class="pt-4 space-y-4">
            <p class="text-sm md:text-base ri-ink leading-relaxed">
              Built as a learning project — the cage is the point.
            </p>
            <a
              :href="GITHUB_URL"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-none border border-accent font-dm font-bold text-sm uppercase tracking-[0.14em] ri-ink hover:bg-accent/10 hover:shadow-glow-sm transition-all duration-300"
            >
              View on GitHub
              <span aria-hidden="true">→</span>
            </a>
            <p class="pt-6">
              <NuxtLink
                to="/insights/notes"
                class="text-sm ri-sub hover:text-accent transition-colors"
              >
                ← Back to Build notes
              </NuxtLink>
            </p>
          </div>
        </footer>
      </article>
    </main>
  </InsightsReadingShell>
</template>

<style scoped>
code {
  font-family: 'DM Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9em;
}
</style>
