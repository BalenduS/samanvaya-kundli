# Samanvaya — Kundli Compatibility

Samanvaya is a mobile-first, dependency-free progressive web app for thoughtfully exploring traditional Jyotisha compatibility methods.

It includes:

- a complete eight-category Ashtakoota (Guna Milan) table with a score out of 36, looked up from a published South Indian marriage-points reference table;
- a category-by-category explanation of Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi;
- Mangal Dosha (Manglik), Nadi and Bhakoot Dosha with commonly cited cancellation exceptions, Rajju Dosha, Vedha Dosha, and Navamsha (D9) Moon / Vargottama status;
- an optional birthplace (searched from a bundled, offline world-city list — nothing is sent anywhere) that unlocks the Ascendant (Lagna) sign and the fuller, Ascendant-based Mangal Dosha check;
- sidereal Moon, Mars, and (with a birthplace) Ascendant, rashi, nakshatra, and pada estimates from birth date, local time, timezone, and coordinates;
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
| `calculations.js` | Moon/Mars/Ascendant position estimates and the Ashtakoota + traditional-checks scoring engine |
| `places.js` | Birthplace search over the bundled city list (fetched lazily, never transmitted) |
| `cities.json` | Offline world-city list for birthplace search (GeoNames.org, CC BY 4.0) |
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
- additional traditional checks run alongside the score (see `additionalChecks` in `calculations.js`): **Mangal Dosha** from the Moon chart (Chandra Manglik) always, and from the Ascendant (the fuller, more authoritative version) once a birthplace is given; **Nadi** and **Bhakoot Dosha** with commonly cited cancellation exceptions; **Rajju Dosha** (same Pada/Kati/Nabhi/Kantha/Shira group); **Vedha Dosha** (a fixed list of traditionally afflicting Nakshatra pairs); and **Navamsha (D9) Moon** harmony with each partner's Vargottama status — these are commonly cited rule sets, not the only versions in circulation;
- the Ascendant (Lagna) is computed from Greenwich Sidereal Time, the birthplace's latitude/longitude, and the obliquity of the ecliptic, using the standard closed-form Ascendant formula — cross-checked in this repo's tests against an independent numerical horizon search;
- Navamsha (D9) divides each sign into nine 3°20' slices; this app uses the equivalent simplified rule of treating the full 360° zodiac as one continuous run of slices from Aries, which reproduces the classical movable/fixed/dual starting-sign rule exactly;
- birthplace is optional and, when given, is matched against `cities.json` — a static list bundled with the app (~34,000 GeoNames cities, population > 15,000) fetched lazily on first use and cached by the service worker for offline reuse; nothing typed into the birthplace field is sent to any server. Cities not in the list can be entered by latitude/longitude directly;
- the browser calculation uses compact lunar, Martian, and solar orbital models with a linear Lahiri/Chitrapaksha approximation (not a professional ephemeris) to estimate positions from birth date, time, timezone, and (optionally) coordinates.

Birth details are processed locally in the browser and are not transmitted by the app.
