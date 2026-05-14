# Install Meditrack

Meditrack is a PWA, so it is installed from the browser rather than from an app store.

## Important note about installation

For a real install test on a phone, use an **HTTPS URL**.

That means one of these:

- deploy the built app to static hosting
- use a secure tunnel to your local machine

A plain local network URL like `http://192.168.x.x:4173` is useful for layout testing, but may not provide full install/offline behavior on phones.

## Production install URL

Use this HTTPS URL on your phone for real install and offline setup:

- `https://edvindj89.github.io/meditrack/`

## Build for install testing

From the project root:

```bash
npm install
npm run build
npm run preview:host
```

Then open the shown URL from a browser.

For the best real-device install test, use the GitHub Pages URL above or another HTTPS host.

## Android install

1. Open Meditrack in **Chrome** on Android.
2. If Chrome shows **Install**, tap it.
3. If not, open the browser menu, tap **Add to Home screen**, then **Install**.
4. Follow the on-screen steps.
5. Launch Meditrack from its new app icon.

### Android checks

- opens from its own icon
- opens without browser chrome in standalone mode
- still opens after the app has been loaded once and the device goes offline
- if offline opening fails, remove the app, reopen the HTTPS URL once, reinstall, then test again

## iPhone install

1. Open Meditrack in **Safari** on iPhone.
2. Tap **Share**. If needed, tap **More** first.
3. Choose **Add to Home Screen**. If you do not see it, scroll down, tap **Edit Actions**, and add it.
4. Make sure **Open as Web App** is on, then tap **Add**.
5. Launch Meditrack from the new Home Screen icon.

### iPhone checks

- opens from the home screen icon
- opens in standalone/full-screen mode
- app still opens after first load when offline support has been cached
- if offline opening fails, remove the app, reopen the HTTPS URL once, reinstall, then test again

## Updating an installed app

- Open the app while online.
- If a new version is available, Meditrack shows an update notice.
- Tap **Update app**.

## During development

Useful commands:

```bash
npm run dev
npm run dev:host
npm run build
npm run preview
npm run preview:host
```

- `npm run dev:host` is good for quick phone UI testing on the same network.
- `npm run build` + `npm run preview:host` is better for PWA behavior checks.
