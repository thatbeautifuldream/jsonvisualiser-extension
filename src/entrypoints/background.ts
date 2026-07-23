import { defineBackground } from 'wxt/utils/define-background';

export default defineBackground({
  type: 'module',
  main() {
    // No-op for now. Present so Chrome treats the MV3 extension as active and
    // so Playwright's `context.serviceWorkers()` reports the extension as loaded.
  },
});
