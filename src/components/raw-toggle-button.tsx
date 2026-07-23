import { FileJson2 } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/ui/button";
import { setOriginDisabled } from "@/lib/extension-state";

type TRawToggleButtonProps = {
  sourceUrl: string | null;
};

export function RawToggleButton({ sourceUrl }: TRawToggleButtonProps) {
  const handleDisable = useCallback(async () => {
    if (!sourceUrl) return;
    try {
      const origin = new URL(sourceUrl).origin;
      await setOriginDisabled(origin, true);
      location.reload();
    } catch {
      /* invalid URL — ignore */
    }
  }, [sourceUrl]);

  return (
    <Button
      onClick={handleDisable}
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-foreground"
      title="View as raw JSON"
      aria-label="View as raw JSON"
      type="button"
    >
      <FileJson2 className="h-4 w-4" />
    </Button>
  );
}
