import { create } from "zustand";

export type TValidationResult = {
  isValid: boolean;
  error: string;
  parsedJson: unknown;
};

export type TJsonStats = {
  lines: number;
  characters: number;
  size: number;
};

export type TJsonDocumentMetadata = {
  sourceUrl: string | null;
  contentType: string | null;
  loadedAt: number | null;
};

const DEFAULT_METADATA: TJsonDocumentMetadata = {
  sourceUrl: null,
  contentType: null,
  loadedAt: null,
};

export type TJsonStore = {
  jsonContent: string;
  metadata: TJsonDocumentMetadata;
  setJsonContent: (content: string) => void;
  clearJson: () => void;
  loadJsonDocument: (input: {
    content: string;
    sourceUrl?: string;
    contentType?: string | null;
  }) => void;
  getValidation: () => TValidationResult;
  getStats: () => TJsonStats;
  hasContent: () => boolean;
};

const validationCache = new Map<string, TValidationResult>();
const statsCache = new Map<string, TJsonStats>();

export const useJsonStore = create<TJsonStore>((set, get) => ({
  jsonContent: "",
  metadata: DEFAULT_METADATA,

  setJsonContent: (content: string) => {
    set({ jsonContent: content });
    validationCache.clear();
    statsCache.clear();
  },

  clearJson: () => {
    set({ jsonContent: "" });
    validationCache.clear();
    statsCache.clear();
  },

  loadJsonDocument: ({ content, sourceUrl, contentType }) => {
    set({
      jsonContent: content,
      metadata: {
        sourceUrl: sourceUrl ?? null,
        contentType: contentType ?? null,
        loadedAt: Date.now(),
      },
    });
    validationCache.clear();
    statsCache.clear();
  },

  getValidation: (): TValidationResult => {
    const content = get().jsonContent;

    const cached = validationCache.get(content);
    if (cached) return cached;

    if (!content.trim()) {
      const result: TValidationResult = {
        isValid: true,
        error: "",
        parsedJson: null,
      };
      validationCache.set(content, result);
      return result;
    }

    try {
      const parsed = JSON.parse(content);
      const result: TValidationResult = {
        isValid: true,
        error: "",
        parsedJson: parsed,
      };
      validationCache.set(content, result);
      return result;
    } catch (err) {
      const result: TValidationResult = {
        isValid: false,
        error: err instanceof Error ? err.message : "Invalid JSON",
        parsedJson: null,
      };
      validationCache.set(content, result);
      return result;
    }
  },

  getStats: (): TJsonStats => {
    const content = get().jsonContent;

    const cached = statsCache.get(content);
    if (cached) return cached;

    const lines = content ? content.split("\n").length : 0;
    const characters = content.length;
    const size = new Blob([content]).size;

    const result: TJsonStats = {
      lines,
      characters,
      size,
    };
    statsCache.set(content, result);
    return result;
  },

  hasContent: () => {
    return get().jsonContent.trim().length > 0;
  },
}));
