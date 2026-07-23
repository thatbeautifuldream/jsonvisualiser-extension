import { defineContentScript } from "wxt/utils/define-content-script";
import { createRoot } from "react-dom/client";
import cssText from "@/assets/content.css?inline";
import App from "@/App";
import { detectRawJson } from "@/lib/detect";
import { useJsonStore } from "@/store/json-store";
import { injectFloatingToggle } from "@/lib/floating-toggle";
import {
  isOriginDisabled,
  setOriginDisabled,
} from "@/lib/extension-state";

const ROOT_ID = "json-visualiser-root";

function prettyPrint(text: string): string {
  const trimmed = text.trim();
  try {
    const parsed = JSON.parse(trimmed);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return trimmed;
  }
}

function deriveTitle(sourceUrl: string, originalTitle: string): string {
  const trimmed = originalTitle.trim();
  if (trimmed) return trimmed;

  try {
    const url = new URL(sourceUrl);
    const segments = url.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    if (last) return decodeURIComponent(last);
    return url.hostname;
  } catch {
    return "JSON";
  }
}

function buildDocumentShell(preservedTitle: string) {
  const html = document.documentElement;
  html.innerHTML =
    '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body></body>';

  document.title = preservedTitle;

  const head = document.head;
  const style = document.createElement("style");
  style.setAttribute("data-json-visualiser", "styles");
  style.textContent = cssText;
  head.appendChild(style);

  const body = document.body;
  if (!body) return null;

  body.style.margin = "0";
  body.style.padding = "0";

  const root = document.createElement("div");
  root.id = ROOT_ID;
  body.replaceChildren(root);

  return root;
}

function render(detected: { text: string; contentType: string | null; sourceUrl: string }) {
  const formatted = prettyPrint(detected.text);

  useJsonStore.getState().loadJsonDocument({
    content: formatted,
    sourceUrl: detected.sourceUrl,
    contentType: detected.contentType,
  });

  const preservedTitle = deriveTitle(detected.sourceUrl, document.title);

  const container = buildDocumentShell(preservedTitle);
  if (!container) return;

  try {
    const root = createRoot(container);
    root.render(<App />);
  } catch (err) {
    const notice = document.createElement("pre");
    notice.style.color = "#dc2626";
    notice.style.padding = "16px";
    notice.style.fontFamily = "monospace";
    notice.textContent = "JSON Visualiser failed to render:\n\n" + (err instanceof Error ? err.stack || err.message : String(err));
    container.appendChild(notice);
  }
}

function whenBodyReady(): Promise<void> {
  return new Promise((resolve) => {
    if (document.body) {
      resolve();
      return;
    }
    const observer = new MutationObserver(() => {
      if (document.body) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(document.documentElement, { childList: true });
  });
}

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_start",
  allFrames: false,
  async main(ctx) {
    await whenBodyReady();

    const detected = detectRawJson();
    if (!detected) return;

    const origin = (() => {
      try {
        return new URL(detected.sourceUrl).origin;
      } catch {
        return detected.sourceUrl;
      }
    })();

    if (await isOriginDisabled(origin)) {
      injectFloatingToggle(ctx, async () => {
        await setOriginDisabled(origin, false);
        location.reload();
      });
      return;
    }

    render(detected);

    ctx.onInvalidated(() => {
      const root = document.getElementById(ROOT_ID);
      const host = root?.parentElement;
      host?.remove();
    });
  },
});
