import { Toaster } from "sonner";
import { JsonWorkspace } from "@/components/json-workspace";
import { ThemeProvider, useTheme } from "@/theme/theme-provider";

function ThemedToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          fontFamily: "var(--font-geist-sans)",
        },
      }}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <JsonWorkspace />
      <ThemedToaster />
    </ThemeProvider>
  );
}
