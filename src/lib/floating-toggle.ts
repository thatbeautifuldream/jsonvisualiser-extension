import type { ContentScriptContext } from "wxt/utils/content-script-context";

const HOST_ID = "json-visualiser-floating-toggle";

const BRACES_SVG = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/>
  <path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/>
</svg>`.trim();

const STYLES = `
:host {
  all: initial;

  --jv-surface: oklch(0.985 0 0);
  --jv-surface-hover: oklch(0.94 0 0);
  --jv-foreground: oklch(0.205 0 0);
  --jv-ring: oklch(0 0 0 / 0.06);
  --jv-ring-hover: oklch(0 0 0 / 0.1);
  --jv-shadow-ambient: oklch(0 0 0 / 0.05);
  --jv-shadow-drop: oklch(0 0 0 / 0.12);
  --jv-shadow-deep: oklch(0 0 0 / 0.16);
  --jv-pulse: 0.205 0 0;
  --jv-tooltip-surface: oklch(0.205 0 0);
  --jv-tooltip-foreground: oklch(0.985 0 0);
  --jv-tooltip-ring: oklch(0 0 0 / 0.06);
}

@media (prefers-color-scheme: dark) {
  :host {
    --jv-surface: oklch(0.205 0 0);
    --jv-surface-hover: oklch(0.269 0 0);
    --jv-foreground: oklch(0.985 0 0);
    --jv-ring: oklch(1 0 0 / 0.1);
    --jv-ring-hover: oklch(1 0 0 / 0.15);
    --jv-shadow-ambient: oklch(0 0 0 / 0.2);
    --jv-shadow-drop: oklch(0 0 0 / 0.3);
    --jv-shadow-deep: oklch(0 0 0 / 0.4);
    --jv-pulse: 0.985 0 0;
    --jv-tooltip-surface: oklch(0.985 0 0);
    --jv-tooltip-foreground: oklch(0.205 0 0);
    --jv-tooltip-ring: oklch(1 0 0 / 0.1);
  }
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.wrapper {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 2147483647;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  animation: jv-enter 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes jv-enter {
  from {
    opacity: 0;
    transform: translateY(-12px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 12px;
  corner-shape: squircle;
  cursor: pointer;
  color: var(--jv-foreground);
  background: var(--jv-surface);
  box-shadow:
    0 0 0 1px var(--jv-ring),
    0 1px 2px var(--jv-shadow-ambient),
    0 4px 12px var(--jv-shadow-drop),
    0 8px 20px var(--jv-shadow-deep);
  transition-property: transform, box-shadow, background-color;
  transition-duration: 0.18s;
  transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.btn:hover {
  transform: scale(1.06);
  background: var(--jv-surface-hover);
  box-shadow:
    0 0 0 1px var(--jv-ring-hover),
    0 2px 4px var(--jv-shadow-ambient),
    0 6px 16px var(--jv-shadow-drop),
    0 12px 28px var(--jv-shadow-deep);
}
.btn:active {
  transform: scale(0.96);
  transition-duration: 0.08s;
}
.btn:focus-visible {
  outline: 2px solid oklch(0.55 0.18 264);
  outline-offset: 2px;
}

.touch-target {
  position: absolute;
  top: 50%;
  left: 50%;
  width: max(100%, 48px);
  height: max(100%, 48px);
  transform: translate(-50%, -50%);
  border-radius: inherit;
}
@media (pointer: fine) {
  .touch-target {
    display: none;
  }
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  pointer-events: none;
}
.icon svg {
  width: 100%;
  height: 100%;
  display: block;
}

.pulse-ring {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: 0 0 0 2px oklch(var(--jv-pulse) / 0.35);
  opacity: 0;
  pointer-events: none;
  animation: jv-pulse 1.8s ease-out 0.5s 2;
}
@keyframes jv-pulse {
  0% {
    opacity: 0.7;
    transform: scale(1);
  }
  70%, 100% {
    opacity: 0;
    transform: scale(1.25);
  }
}

.tooltip {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  white-space: nowrap;
  padding: 5px 9px;
  border-radius: 7px;
  corner-shape: squircle;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--jv-tooltip-foreground);
  background: var(--jv-tooltip-surface);
  box-shadow:
    0 0 0 1px var(--jv-tooltip-ring),
    0 4px 12px var(--jv-shadow-drop);
  opacity: 0;
  transform: translateY(-4px);
  transition-property: opacity, transform;
  transition-duration: 0.16s;
  transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
  pointer-events: none;
}
.tooltip::before {
  content: "";
  position: absolute;
  bottom: 100%;
  right: 13px;
  transform: translateX(50%);
  border: 4px solid transparent;
  border-bottom-color: var(--jv-tooltip-surface);
}
.wrapper:hover .tooltip {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.04s;
}

@media (prefers-reduced-motion: reduce) {
  .wrapper,
  .btn,
  .pulse-ring,
  .tooltip {
    animation: none !important;
    transition: none !important;
  }
}
`;

export function injectFloatingToggle(
  ctx: ContentScriptContext,
  onEnable: () => void,
): void {
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement("div");
  host.id = HOST_ID;

  const shadow = host.attachShadow({ mode: "open" });

  const styleEl = document.createElement("style");
  styleEl.textContent = STYLES;
  shadow.appendChild(styleEl);

  const wrapper = document.createElement("div");
  wrapper.className = "wrapper";

  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  tooltip.textContent = "Visualize JSON";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("aria-label", "Visualize JSON with JSON Visualiser");

  const pulseRing = document.createElement("div");
  pulseRing.className = "pulse-ring";

  const touchTarget = document.createElement("span");
  touchTarget.className = "touch-target";
  touchTarget.setAttribute("aria-hidden", "true");

  const iconWrap = document.createElement("span");
  iconWrap.className = "icon";
  iconWrap.innerHTML = BRACES_SVG;

  btn.appendChild(touchTarget);
  btn.appendChild(pulseRing);
  btn.appendChild(iconWrap);
  wrapper.appendChild(tooltip);
  wrapper.appendChild(btn);
  shadow.appendChild(wrapper);

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEnable();
  });

  document.documentElement.appendChild(host);

  ctx.onInvalidated(() => {
    host.remove();
  });
}
