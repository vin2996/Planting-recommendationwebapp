import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useT } from "@/lib/i18n";

/** Small banner telling the farmer the app still works without internet. */
export function OfflineBanner() {
  const t = useT();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-earth/20 px-4 py-2 text-center text-xs font-semibold text-foreground">
      <WifiOff className="h-4 w-4 flex-none" />
      {t("You are offline — saved guides and crops still work.")}
    </div>
  );
}
