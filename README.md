# Math Practice Everywhere

A mobile-first, cross-platform math practice application built with a **single HTML/CSS/JavaScript codebase**.

## Platform coverage
- **Web app (primary)**: Responsive, installable PWA, offline support.
- **iOS**: Optimized for Safari + Home Screen installation, safe-area handling, touch-first UX.
- **Android**: Optimized for Chrome, Material-style interactions, back-button-friendly tab history.
- **Wrapper-ready**: Can be wrapped with Capacitor/Cordova for App Store / Play Store delivery.

## Features implemented
- Multiplication quiz with instant feedback and local progress tracking.
- Worksheet generator with local history.
- Native share integration (`navigator.share`) + print/save PDF flow.
- Service worker caching and background sync signaling for quiz results.
- Touch gestures: swipe between tabs, pull-to-refresh worksheets.
- Optional voice input (Web Speech API when available).
- Haptic feedback via vibration API.
- PWA manifest with required icon sizes (text-based SVG assets to keep repository fully diffable):
  - 72, 96, 128, 144, 152, 192, 384, 512.

## Run locally
Because this uses a service worker, run from a local HTTP server (not `file://`).

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

## Capacitor wrapper quick start (optional)

```bash
npm init -y
npm install @capacitor/core @capacitor/cli
npx cap init math.practice.app "Math Practice Everywhere" --web-dir=.
npx cap add ios
npx cap add android
npx cap sync
```

Then open native projects:

```bash
npx cap open ios
npx cap open android
```

## Files
- `index.html`: App structure + semantic sections + mobile meta tags.
- `styles.css`: Responsive styling, iOS/Android-specific UX touches.
- `app.js`: Quiz logic, offline state, navigation, gestures, sharing, install prompts.
- `service-worker.js`: Caching, offline fallback strategy, background sync + push hooks.
- `manifest.webmanifest`: PWA metadata and icons.
- `icons/`: Required PWA icon sizes as SVG files (no binary image files).
