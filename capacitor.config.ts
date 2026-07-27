import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.cropguide",
  appName: "Crop Guide",
  // The app is server-rendered, so the native shell loads the published site.
  // Everything still works offline thanks to the service worker cache.
  webDir: "dist",
  server: {
    url: "https://planting-recommendationwebapp.lovable.app",
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    backgroundColor: "#f6f5ef",
  },
};

export default config;
