import { type TIframeViewerConfig } from "@/components/iframe-viewer";

export const JSON_VISUALISER_CONFIG: TIframeViewerConfig = {
  url: "https://jsonvisualiser.com/",
  title: "JSON Visualiser",
};

type TAppConfig = {
  name: string;
  iframe: IframeViewerConfig;
};

export const APP_CONFIG: TAppConfig = {
  name: "JSON Visualiser Extension",
  iframe: JSON_VISUALISER_CONFIG,
} as const;
