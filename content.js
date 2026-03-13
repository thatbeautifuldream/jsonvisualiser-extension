(() => {
  const APP_ORIGIN = "https://jsonvisualiser.com";
  const APP_ROUTE = `${APP_ORIGIN}/extension`;
  const SENTINEL_ID = "json-visualiser-extension-root";
  const CHUNK_SIZE = 256 * 1024;
  const STREAM_VERSION = 1;
  const READY_TIMEOUT_MS = 15000;
  const ACK_TIMEOUT_MS = 15000;
  const numberPattern = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/;

  if (window.top !== window.self) return;
  if (location.origin === APP_ORIGIN) return;
  if (document.getElementById(SENTINEL_ID)) return;

  function looksLikeRawJson(text) {
    if (!text) return false;
    const trimmed = text.trim();
    if (!trimmed) return false;

    const startsLikeJson =
      trimmed.startsWith("{") ||
      trimmed.startsWith("[") ||
      trimmed === "null" ||
      trimmed === "true" ||
      trimmed === "false" ||
      numberPattern.test(trimmed) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'));

    if (!startsLikeJson) return false;

    try {
      JSON.parse(trimmed);
      return true;
    } catch {
      return false;
    }
  }

  function getBodyChildren() {
    return Array.from(document.body?.children || []);
  }

  function extractRawJsonText() {
    const children = getBodyChildren();
    if (children.length === 1 && children[0].tagName === "PRE") {
      return children[0].textContent || "";
    }

    const pre = document.body?.querySelector("pre");
    if (pre && getBodyChildren().length <= 2) {
      return pre.textContent || "";
    }

    return document.body?.innerText || "";
  }

  function isLikelyRawJsonPage(text) {
    const contentType = document.contentType || "";
    const children = getBodyChildren();
    const hasPre = Boolean(document.body?.querySelector("pre"));
    const hasSimpleLayout =
      children.length <= 1 ||
      (children.length <= 2 &&
        children.every((child) => ["PRE", "DIV"].includes(child.tagName)));

    const jsonContentType =
      contentType.includes("application/json") ||
      contentType.includes("text/json") ||
      contentType.includes("+json");

    return (
      (jsonContentType || (hasPre && hasSimpleLayout)) && looksLikeRawJson(text)
    );
  }

  function createTransferId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function mountIframe(jsonText, contentType) {
    let readyTimeoutId = null;
    let ackTimeoutId = null;
    let channel = null;
    let completed = false;
    let nextIndex = 0;
    const totalChunks = Math.max(1, Math.ceil(jsonText.length / CHUNK_SIZE));
    const transferId = createTransferId();

    const clearReadyTimeout = () => {
      if (readyTimeoutId !== null) {
        window.clearTimeout(readyTimeoutId);
        readyTimeoutId = null;
      }
    };

    const clearAckTimeout = () => {
      if (ackTimeoutId !== null) {
        window.clearTimeout(ackTimeoutId);
        ackTimeoutId = null;
      }
    };

    const cleanup = () => {
      completed = true;
      clearReadyTimeout();
      clearAckTimeout();

      if (channel) {
        channel.port1.onmessage = null;
        channel.port1.close();
        channel.port2.close();
        channel = null;
      }

      window.removeEventListener("beforeunload", cleanup);
      window.removeEventListener("message", onReady);
    };

    const abortTransfer = (reason) => {
      if (completed) return;

      if (channel) {
        channel.port1.postMessage({
          type: "JSON_VISUALISER_ABORT",
          payload: { reason },
        });
      }

      cleanup();
    };

    const scheduleAckTimeout = () => {
      clearAckTimeout();
      ackTimeoutId = window.setTimeout(() => {
        abortTransfer("Timed out waiting for the next chunk acknowledgement.");
      }, ACK_TIMEOUT_MS);
    };

    const sendChunk = () => {
      if (completed || !channel) return;

      if (nextIndex >= totalChunks) {
        completed = true;
        clearAckTimeout();
        channel.port1.postMessage({
          type: "JSON_VISUALISER_COMPLETE",
        });
        cleanup();
        return;
      }

      const start = nextIndex * CHUNK_SIZE;
      const chunk = jsonText.slice(start, start + CHUNK_SIZE);
      channel.port1.postMessage({
        type: "JSON_VISUALISER_CHUNK",
        payload: {
          index: nextIndex,
          chunk,
        },
      });

      scheduleAckTimeout();
    };

    document.documentElement.innerHTML =
      '<head><meta charset="utf-8"><title>JSON Visualiser</title></head><body></body>';

    const body = document.body;
    if (!body) return;

    body.style.margin = "0";

    const root = document.createElement("div");
    root.id = SENTINEL_ID;
    root.style.width = "100vw";
    root.style.height = "100vh";

    const iframe = document.createElement("iframe");
    iframe.src = APP_ROUTE;
    iframe.allow = "clipboard-write";
    iframe.style.display = "block";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "0";

    root.appendChild(iframe);
    body.replaceChildren(root);

    function onReady(event) {
      if (event.origin !== APP_ORIGIN) return;
      if (event.source !== iframe.contentWindow) return;
      if (event.data?.type !== "JSON_VISUALISER_READY") return;

      clearReadyTimeout();
      window.removeEventListener("message", onReady);
      window.addEventListener("beforeunload", cleanup, { once: true });

      channel = new MessageChannel();

      iframe.contentWindow?.postMessage(
        {
          type: "JSON_VISUALISER_PORT",
          payload: {
            version: STREAM_VERSION,
            transferId,
            sourceUrl: location.href,
            contentType: contentType || null,
            detectedAt: new Date().toISOString(),
            totalChunks,
            totalCharacters: jsonText.length,
          },
        },
        APP_ORIGIN,
        [channel.port2],
      );

      channel.port1.onmessage = (portEvent) => {
        const data = portEvent.data;

        if (data?.type === "JSON_VISUALISER_ACK") {
          clearAckTimeout();

          if (data.payload?.index !== nextIndex) {
            abortTransfer("Ack order mismatch.");
            return;
          }

          nextIndex += 1;
          sendChunk();
          return;
        }

        if (data?.type === "JSON_VISUALISER_ABORT") {
          cleanup();
        }
      };

      channel.port1.start();
      sendChunk();
    }

    window.addEventListener("message", onReady);
    readyTimeoutId = window.setTimeout(() => {
      window.removeEventListener("message", onReady);
    }, READY_TIMEOUT_MS);
  }

  function init() {
    if (!document.body) return;

    const jsonText = extractRawJsonText();
    if (!isLikelyRawJsonPage(jsonText)) return;

    mountIframe(jsonText, document.contentType || null);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
