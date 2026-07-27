# Crop Guide — Android (Capacitor + AdMob)

The web app is already Capacitor-ready. Android Studio and the Android SDK are
required, so the final build steps run on **your** machine, not in Lovable.

## 1. Get the code

Export the project to GitHub (chat input `+` → GitHub → Create Repository),
then clone it and install:

```bash
git clone <your-repo-url>
cd <your-repo>
npm install
```

## 2. Add the Android platform

```bash
npx cap add android
npx cap sync android
```

`capacitor.config.ts` points the native shell at the published site
(`https://planting-recommendationwebapp.lovable.app`), so the app always shows
the latest version and the service worker keeps it usable offline.

## 3. Configure AdMob

1. Create an app in the [AdMob console](https://apps.admob.com) and create a
   **Banner** ad unit.
2. Put your real ad unit ID in `src/components/AdBanner.tsx`
   (`BANNER_AD_UNIT_ID`) — it currently uses Google's test unit.
3. Add your AdMob **App ID** to `android/app/src/main/AndroidManifest.xml`,
   inside `<application>`:

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
```

4. Re-sync: `npx cap sync android`

> Ship with the test ad unit only while developing. Live ads with test clicks
> can get your AdMob account suspended.

## 4. Signing key (one time)

```bash
keytool -genkey -v -keystore cropguide.keystore \
  -alias cropguide -keyalg RSA -keysize 2048 -validity 10000
```

Create `android/keystore.properties`:

```
storeFile=../../cropguide.keystore
storePassword=YOUR_STORE_PASSWORD
keyAlias=cropguide
keyPassword=YOUR_KEY_PASSWORD
```

Keep the keystore and passwords safe and out of git — losing them means you can
never update the app on Play.

## 5. Build the AAB

```bash
npx cap sync android
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

Or in Android Studio: `npx cap open android` →
**Build → Generate Signed Bundle / APK → Android App Bundle**.

## 6. Upload

Play Console → your app → **Production** (or Internal testing) → Create release
→ upload the `.aab`. Complete the Data safety form and declare that the app
serves ads.
