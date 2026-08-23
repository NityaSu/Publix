<script setup lang="ts">
interface SocialLink {
  label: string;
  href: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  { label: 'X (Twitter)', href: 'https://x.com/NityaSuon' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/nityasuon/' },
  { label: 'Instagram', href: 'https://www.instagram.com/nitya_suon/' },
  { label: 'GitHub', href: 'https://github.com/NityaSu' },
];
</script>

<template>
  <div class="footer-wrapper">
    <footer class="site-footer">
      <svg
        class="robot-watermark"
        width="380"
        height="380"
        viewBox="0 0 200 200"
        fill="white"
        aria-hidden="true"
      >
        <rect x="55" y="30" width="90" height="75" rx="22" />
        <line
          x1="100"
          y1="30"
          x2="100"
          y2="12"
          stroke="white"
          stroke-width="5"
          stroke-linecap="round"
        />
        <circle cx="100" cy="8" r="6" />
        <circle cx="82" cy="58" r="10" fill="#1e3a5f" />
        <circle cx="118" cy="58" r="10" fill="#1e3a5f" />
        <circle cx="79" cy="55" r="3" fill="white" opacity="0.5" />
        <circle cx="115" cy="55" r="3" fill="white" opacity="0.5" />
        <path
          d="M 85 78 Q 100 90 115 78"
          stroke="#1e3a5f"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
        />
        <circle cx="68" cy="72" r="5" fill="white" opacity="0.2" />
        <circle cx="132" cy="72" r="5" fill="white" opacity="0.2" />
        <rect x="70" y="108" width="60" height="55" rx="14" />
        <rect x="82" y="120" width="36" height="22" rx="6" fill="#1e3a5f" opacity="0.4" />
        <rect x="38" y="115" width="22" height="45" rx="11" />
        <rect x="140" y="115" width="22" height="45" rx="11" />
        <circle cx="49" cy="165" r="10" />
        <circle cx="151" cy="165" r="10" />
        <rect x="78" y="160" width="18" height="28" rx="9" />
        <rect x="104" y="160" width="18" height="28" rx="9" />
        <ellipse cx="87" cy="192" rx="14" ry="8" />
        <ellipse cx="113" cy="192" rx="14" ry="8" />
      </svg>

      <div class="footer-inner">
        <div class="footer-top">
          <div>
            <div class="footer-logo" aria-hidden="true">
              <svg width="36" height="36" viewBox="0 0 80 80" fill="none">
                <rect x="4" y="4" width="72" height="72" rx="14" fill="white" />
                <path
                  d="M26 28L42 40L26 52"
                  stroke="#1e3a5f"
                  stroke-width="5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  fill="none"
                />
                <rect x="46" y="49" width="16" height="5" rx="2" fill="#1e3a5f" />
              </svg>
            </div>

            <p class="footer-tagline">Building systems that solve real problems.</p>

            <div class="footer-socials">
              <a
                v-for="social in SOCIAL_LINKS"
                :key="social.label"
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ social.label }}
              </a>
            </div>

            <p class="start-from-zero">Start from Zero</p>
          </div>
        </div>

        <div class="footer-divider"></div>

        <div class="footer-bottom">
          <div class="footer-copyright">© 2026 · NITYA SUON · ALL RIGHTS RESERVED</div>
          <div class="footer-legal">
            <NuxtLink to="/legal">Legal</NuxtLink>
            <NuxtLink to="/privacy">Privacy</NuxtLink>
            <NuxtLink to="/sitemap">Sitemap</NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.footer-wrapper {
  font-family: 'DM Mono', 'DM Mono fallback', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  background: #0a0a0a;
  color: #e5e5e5;
}

.site-footer {
  background: #1e3a5f;
  position: relative;
  overflow: hidden;
}

.site-footer::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}

.robot-watermark {
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.06;
  pointer-events: none;
}

.footer-inner {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 56px 48px 36px;
}

.footer-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 32px;
}

.footer-logo {
  margin-bottom: 28px;
}

.footer-tagline {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 28px 0;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.3px;
}

.footer-socials {
  display: flex;
  gap: 28px;
  align-items: center;
  flex-wrap: wrap;
}

.footer-socials a {
  color: rgba(255, 255, 255, 0.55);
  text-decoration: none;
  font-size: 14px;
  letter-spacing: 0.5px;
  transition: color 0.2s;
  font-weight: 400;
}

.footer-socials a:hover {
  color: #fff;
}

.start-from-zero {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.25);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin: 20px 0 0 0;
  font-weight: 300;
}

.footer-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-copyright {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 2px;
  font-weight: 300;
}

.footer-legal {
  display: flex;
  gap: 28px;
}

.footer-legal a {
  color: rgba(255, 255, 255, 0.35);
  text-decoration: none;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  transition: color 0.2s;
  font-weight: 300;
}

.footer-legal a:hover {
  color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 640px) {
  .footer-inner {
    padding: 48px 24px 32px;
  }

  .robot-watermark {
    width: 240px;
    height: 240px;
    right: -40px;
  }
}
</style>
