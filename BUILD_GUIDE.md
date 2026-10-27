# Building & Sharing Test Builds (Android + iOS)

Status check of this repo as of 2026-10-27:

| | Android | iOS |
|---|---|---|
| App ID / Bundle ID | `com.propertylistingapp` | `org.reactjs.native.example.$(PRODUCT_NAME)` — still the RN default placeholder, not a real bundle ID |
| Signing | `release` build type currently points at `signingConfigs.debug` (see `android/app/build.gradle:98`) — fine for sharing an APK for internal testing, **not** fine for Play Store | No certificate/provisioning profile set up — confirmed by you |
| Version | `versionCode 1`, `versionName "1.0"` | Not checked (set in Xcode target / Info.plist) |

Nothing below has been run. This is a reference checklist only.

---

## 1. Android — generate a build to share

### Quickest path: debug APK (no signing setup needed)

```sh
cd android
./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

Install on a device with `adb install app-debug.apk`, or just send the `.apk` file directly (AirDrop, Slack, Drive, etc.) — testers enable "install unknown apps" once and tap it.

### More realistic path: release APK (recommended for sharing)

Release builds are smaller, faster, and behave closer to production (minification, no dev menu). Since `release` is currently wired to the debug signing config, this will work out of the box but **do not submit this build to the Play Store** — it's debug-signed.

```sh
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

### Proper release signing (needed before Play Store, optional for ad-hoc sharing)

1. Generate a keystore once:
   ```sh
   keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore \
     -alias property-listing-app -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Store it outside git, reference it via `android/gradle.properties` (`MYAPP_RELEASE_STORE_FILE`, `...STORE_PASSWORD`, `...KEY_ALIAS`, `...KEY_PASSWORD`) or environment variables in CI — never commit the keystore or its passwords.
3. Point `signingConfigs.release` in `android/app/build.gradle` at those properties instead of `signingConfigs.debug`.
4. For the Play Store specifically, build an **AAB** instead of an APK:
   ```sh
   ./gradlew bundleRelease
   ```
   Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Sharing without the Play Store

- **Direct APK**: send the file; simplest for a handful of testers.
- **Firebase App Distribution**: upload the APK/AAB, invite testers by email, they get an install link + update notifications. No Play Console needed.
- **Internal/Closed testing track on Play Console**: needs a Play Developer account ($25 one-time) and a properly signed AAB.

---

## 2. iOS — generate a build to share

You said you don't have a valid certificate. That's the actual blocker — Apple requires code signing for **any** build that runs on a physical device, free account or paid. Simulator builds don't need signing but can't be shared with testers (simulator-only, not installable on real hardware).

### What a certificate buys you, and what it costs

| Account type | Cost | Can do |
|---|---|---|
| Free Apple ID (personal team) | $0 | Build & run on your **own registered devices** via Xcode, 7-day signing expiry, must re-sign weekly, max 3 "app IDs" |
| Apple Developer Program | $99/yr | Ad Hoc builds (up to 100 registered devices/year), TestFlight (up to 10,000 external testers), App Store release |

### Path A — No paid account (free, limited)

1. Open `ios/PropertyListingApp.xcworkspace` in Xcode.
2. Sign in with your Apple ID: Xcode → Settings → Accounts.
3. Select the `PropertyListingApp` target → Signing & Capabilities → check "Automatically manage signing" → pick your personal team.
4. Also fix `PRODUCT_BUNDLE_IDENTIFIER` — it's currently the RN placeholder (`org.reactjs.native.example...`), which won't work for real signing. Set something like `com.yourname.propertylistingapp`.
5. Connect the tester's iPhone by cable, select it as the run destination, hit Run. The app installs and launches directly.
6. Build expires after 7 days; repeat to refresh.

This only works for devices physically connected to your Mac at build time — not something you can "send" to someone remotely.

### Path B — Paid Apple Developer account ($99/yr)

1. Enroll at developer.apple.com.
2. In Xcode, create/select a real signing certificate + provisioning profile (Automatic signing handles this once you pick the team).
3. Register tester device UDIDs in the Apple Developer portal (for Ad Hoc) — or skip this and use TestFlight (no UDID registration needed).
4. Archive the build: Xcode → Product → Archive (requires a real/generic device destination, not simulator).
5. In the Organizer window, "Distribute App":
   - **Ad Hoc** → produces an `.ipa` you can share via a link/service (Diawi, Firebase App Distribution) and install on pre-registered devices.
   - **TestFlight (App Store Connect)** → upload, add testers by email, they install via the TestFlight app — no device registration limit hassle, works over-the-air.
6. For TestFlight, the build also needs a review-light "internal testing" pass or a quick Apple review for external testers (usually fast, sometimes automatic).

### Sharing without Xcode GUI (CLI, once signing is set up)

```sh
xcodebuild -workspace ios/PropertyListingApp.xcworkspace \
  -scheme PropertyListingApp \
  -configuration Release \
  -archivePath build/PropertyListingApp.xcarchive \
  archive

xcodebuild -exportArchive \
  -archivePath build/PropertyListingApp.xcarchive \
  -exportPath build/export \
  -exportOptionsPlist ExportOptions.plist
```
`ExportOptions.plist` needs `method` set to `ad-hoc`, `development`, or `app-store`, plus your team ID.

---

## 3. Recommended order for this project

1. Fix the iOS bundle identifier (still the RN placeholder) before doing any real signing work.
2. For Android: ship the release APK as-is for quick internal sharing; set up a real keystore only once you're close to a Play Store submission.
3. For iOS: get a free Apple ID signed into Xcode and test on your own device first (Path A) — costs nothing and confirms the app builds/runs on real hardware. Only pay for the Developer Program once you need to share with testers who aren't physically next to you.
