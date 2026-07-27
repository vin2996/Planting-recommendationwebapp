import { useEffect } from "react";

/**
 * Google AdMob banner, shown only when running inside the native Android app.
 * On the web this renders nothing.
 *
 * Replace the ad unit ID below with your real one from the AdMob console.
 * The value here is Google's official Android banner TEST unit.
 */
const BANNER_AD_UNIT_ID = "ca-app-pub-3940256099942544/6300978111";

export function AdBanner() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        const { AdMob, BannerAdPosition, BannerAdSize } = await import(
          "@capacitor-community/admob"
        );

        await AdMob.initialize({ initializeForTesting: false });
        if (cancelled) return;

        await AdMob.showBanner({
          adId: BANNER_AD_UNIT_ID,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
        });
      } catch (err) {
        console.warn("[AdMob] banner unavailable", err);
      }
    })();

    return () => {
      cancelled = true;
      void (async () => {
        try {
          const { Capacitor } = await import("@capacitor/core");
          if (!Capacitor.isNativePlatform()) return;
          const { AdMob } = await import("@capacitor-community/admob");
          await AdMob.removeBanner();
        } catch {
          /* noop */
        }
      })();
    };
  }, []);

  return null;
}
