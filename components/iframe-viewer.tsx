import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export type TIframeViewerConfig = {
  url: string;
  title: string;
};

type TIframeViewerProps = {
  config: IframeViewerConfig;
  className?: string;
};

const IframeViewer = forwardRef<HTMLIFrameElement, TIframeViewerProps>(
  ({ config, className = "" }, ref) => {
    const { url, title } = config;

    const sandbox = [
      "allow-scripts",
      "allow-same-origin",
      "allow-forms",
      "allow-popups",
      "allow-popups-to-escape-sandbox",
    ];

    return (
      <iframe
        ref={ref}
        src={url}
        title={title}
        className={cn("w-full h-full border-0 rounded-none", className)}
        allowFullScreen={true}
        sandbox={sandbox.join(" ")}
        loading="lazy"
      />
    );
  }
);

IframeViewer.displayName = "IframeViewer";

export default IframeViewer;
