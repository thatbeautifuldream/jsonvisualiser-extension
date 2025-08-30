import IframeViewer from "@/components/iframe-viewer";
import { APP_CONFIG } from "@/lib/config";

function App() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <IframeViewer config={APP_CONFIG.iframe} className="min-h-screen" />
    </div>
  );
}

export default App;
