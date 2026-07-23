const numberPattern = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/;

export type DetectedJson = {
  text: string;
  contentType: string | null;
  sourceUrl: string;
};

export function looksLikeRawJson(text: string): boolean {
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

function getBodyChildren(): Element[] {
  return Array.from(document.body?.children ?? []);
}

function extractRawJsonText(): string {
  const children = getBodyChildren();
  if (children.length === 1 && children[0].tagName === "PRE") {
    return children[0].textContent ?? "";
  }

  const pre = document.body?.querySelector("pre");
  if (pre && getBodyChildren().length <= 2) {
    return pre.textContent ?? "";
  }

  return document.body?.innerText ?? "";
}

export function isLikelyRawJsonPage(text: string): boolean {
  const contentType = document.contentType ?? "";
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

  return (jsonContentType || (hasPre && hasSimpleLayout)) && looksLikeRawJson(text);
}

export function detectRawJson(): DetectedJson | null {
  if (window.top !== window.self) return null;

  const text = extractRawJsonText();
  if (!isLikelyRawJsonPage(text)) return null;

  return {
    text,
    contentType: document.contentType || null,
    sourceUrl: location.href,
  };
}
