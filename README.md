# Samanvaya — Kundli Compatibility

Samanvaya is a mobile-first, dependency-free progressive web app for thoughtfully exploring traditional Jyotisha compatibility methods.

It includes:

- a complete eight-category Ashtakoota (Guna Milan) table with a score out of 36;
- a category-by-category explanation of Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi;
- sidereal Moon, rashi, nakshatra, and pada estimates from birth date, local time, and UTC offset;
- a Nakshatra guide that compares all 27 nakshatras and recommends the strongest table alignments;
- offline support, install icons, and a standalone PWA experience;
- visible source notes, computational limitations, and a non-deterministic disclaimer.

Astrology is not established science. This project presents a cultural and reflective framework, not a prediction, medical assessment, or substitute for real-world relationship judgment.

## Run locally

The app has no runtime or build dependencies. Node.js 20 or newer is recommended for the local server and tests.

```bash
npm run dev
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173).

Run the calculation tests:

```bash
npm test
```

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Semantic application shell, forms, method notes, and disclaimers |
| `styles.css` | Responsive visual system and accessibility states |
| `app.js` | UI behavior, results rendering, and install guidance |
| `calculations.js` | Moon-position estimate and Ashtakoota scoring engine |
| `manifest.webmanifest` | PWA identity and install icons |
| `sw.js` | Offline application-shell cache |
| `server.js` | Small local static server |
| `vercel.json` | Vercel headers for the service worker, manifest, and static assets |

## PWA install behavior

The production site must be served over HTTPS; Vercel provides this automatically.

- **Android and supported Chromium browsers:** the **Install app** control remains hidden unless the browser emits `beforeinstallprompt`. The app never fabricates or forces a native prompt.
- **iPhone and iPad:** iOS does not expose `beforeinstallprompt`. When opened in a browser and not already running standalone, Samanvaya displays instructions to tap **Share** and then **Add to Home Screen**. The guidance can be dismissed for the current browser session.
- **Offline use:** after the first successful load, the service worker caches the local application shell. External source links still require a network connection.

When changing cached files, increment the cache name in `sw.js` so installed copies receive the new shell.

## Deploy to Vercel

### From the Vercel dashboard

1. Import the GitHub repository into Vercel.
2. Choose **Other** as the Framework Preset.
3. Keep the repository root as the Root Directory.
4. Leave Build Command empty.
5. Leave Output Directory empty (the deployable static files are in the repository root).
6. Deploy.

No environment variables are required. `vercel.json` gives the service worker a revalidation policy and explicitly sets the manifest content type.

### With the Vercel CLI

```bash
npx vercel
npx vercel --prod
```

Choose the current directory and accept the detected static-project settings. The first command creates a preview deployment; the second promotes a production deployment.

## Publish to GitHub

Authenticate the GitHub CLI if needed:

```bash
gh auth login -h github.com
gh auth status
```

From this repository, create and push a public remote:

```bash
gh repo create samanvaya-kundli --public --source=. --remote=origin --push
```

If that repository name is already taken under your account, choose another name and use it consistently in the command and Vercel import.

## Calculation and source boundaries

The in-app **How this works** section is the canonical explanation. In brief:

- the score out of 36 is a direct lookup in a 36×36 marriage-points table transcribed from a published South Indian Panchangam boy-girl matching chart (Chilakamarthi Panchangam), keyed by each partner's Moon Nakshatra and pada — see `MARRIAGE_POINTS_MATRIX` in `calculations.js`;
- the 8-factor breakdown shown alongside the score (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi — labeled in plain English in the UI) is computed separately with standard Ashtakoota rules; it illustrates the traditional components but may not always sum to exactly the same total as the reference-table score, since regional tables vary;
- the browser calculation uses a compact lunar model and linear Lahiri/Chitrapaksha approximation (not a professional ephemeris) to estimate each Moon's Nakshatra and pada from birth date, time, and timezone;
- this first version does not apply Nadi/Bhakoot cancellation rules or full-chart analysis.

Birth details are processed locally in the browser and are not transmitted by the app.
