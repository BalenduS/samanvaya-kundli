const DEG = Math.PI / 180;
const NAKSHATRA_SPAN = 360 / 27;
const PADA_SPAN = NAKSHATRA_SPAN / 4;

export const RASHIS = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena",
];

export const RASHI_WESTERN = {
  Mesha: "Aries", Vrishabha: "Taurus", Mithuna: "Gemini", Karka: "Cancer",
  Simha: "Leo", Kanya: "Virgo", Tula: "Libra", Vrishchika: "Scorpio",
  Dhanu: "Sagittarius", Makara: "Capricorn", Kumbha: "Aquarius", Meena: "Pisces",
};

export const GANA_PLAIN = { Deva: "Calm nature", Manushya: "Balanced nature", Rakshasa: "Intense nature" };

export const NAKSHATRAS = [
  ["Ashwini", "Ashvini Kumaras", "Ketu", "Deva", "Adi", "Horse"],
  ["Bharani", "Yama", "Venus", "Manushya", "Madhya", "Elephant"],
  ["Krittika", "Agni", "Sun", "Rakshasa", "Antya", "Sheep"],
  ["Rohini", "Prajapati", "Moon", "Manushya", "Antya", "Serpent"],
  ["Mrigashira", "Soma", "Mars", "Deva", "Madhya", "Serpent"],
  ["Ardra", "Rudra", "Rahu", "Manushya", "Adi", "Dog"],
  ["Punarvasu", "Aditi", "Jupiter", "Deva", "Adi", "Cat"],
  ["Pushya", "Brihaspati", "Saturn", "Deva", "Madhya", "Sheep"],
  ["Ashlesha", "Nagas", "Mercury", "Rakshasa", "Antya", "Cat"],
  ["Magha", "Pitris", "Ketu", "Rakshasa", "Antya", "Rat"],
  ["Purva Phalguni", "Bhaga", "Venus", "Manushya", "Madhya", "Rat"],
  ["Uttara Phalguni", "Aryaman", "Sun", "Manushya", "Adi", "Cow"],
  ["Hasta", "Savitar", "Moon", "Deva", "Adi", "Buffalo"],
  ["Chitra", "Tvashtar", "Mars", "Rakshasa", "Madhya", "Tiger"],
  ["Swati", "Vayu", "Rahu", "Deva", "Antya", "Buffalo"],
  ["Vishakha", "Indra-Agni", "Jupiter", "Rakshasa", "Antya", "Tiger"],
  ["Anuradha", "Mitra", "Saturn", "Deva", "Madhya", "Deer"],
  ["Jyeshtha", "Indra", "Mercury", "Rakshasa", "Adi", "Deer"],
  ["Mula", "Nirriti", "Ketu", "Rakshasa", "Adi", "Dog"],
  ["Purva Ashadha", "Apas", "Venus", "Manushya", "Madhya", "Monkey"],
  ["Uttara Ashadha", "Vishvadevas", "Sun", "Manushya", "Antya", "Mongoose"],
  ["Shravana", "Vishnu", "Moon", "Deva", "Antya", "Monkey"],
  ["Dhanishtha", "Vasus", "Mars", "Rakshasa", "Madhya", "Lion"],
  ["Shatabhisha", "Varuna", "Rahu", "Rakshasa", "Adi", "Horse"],
  ["Purva Bhadrapada", "Aja Ekapada", "Jupiter", "Manushya", "Adi", "Lion"],
  ["Uttara Bhadrapada", "Ahir Budhnya", "Saturn", "Manushya", "Madhya", "Cow"],
  ["Revati", "Pushan", "Mercury", "Deva", "Antya", "Elephant"],
].map(([name, deity, lord, gana, nadi, yoni], index) => ({ index, name, deity, lord, gana, nadi, yoni }));

// --- Marriage points ready-reckoner ------------------------------------------------
//
// The 36x36 total-score table below is transcribed from a published South Indian
// boy-girl marriage points chart (Chilakamarthi Panchangam). Nine of the 27
// nakshatras straddle a rashi (Moon-sign) boundary, so the chart gives them two
// columns/rows instead of one: NAKSHATRA_COLUMNS records, for every nakshatra, which
// matrix column(s) apply and — for the split ones — how many of its 4 padas belong
// to the earlier column (`splitAt`) versus the later one.
//
// Column/row order (36 entries, same on both axes):
// Ashwini, Bharani, Krittika(1), Krittika(2-4), Rohini, Mrigashira(1-2), Mrigashira(3-4),
// Ardra, Punarvasu(1-3), Punarvasu(4), Pushya, Ashlesha, Magha, Purva Phalguni,
// Uttara Phalguni(1), Uttara Phalguni(2-4), Hasta, Chitra(1-2), Chitra(3-4), Swati,
// Vishakha(1-3), Vishakha(4), Anuradha, Jyeshtha, Mula, Purva Ashadha,
// Uttara Ashadha(1), Uttara Ashadha(2-4), Shravana, Dhanishtha(1-2), Dhanishtha(3-4),
// Shatabhisha, Purva Bhadrapada(1-3), Purva Bhadrapada(4), Uttara Bhadrapada, Revati.
const NAKSHATRA_COLUMNS = [
  { cols: [0] }, { cols: [1] }, { cols: [2, 3], splitAt: 1 }, { cols: [4] },
  { cols: [5, 6], splitAt: 2 }, { cols: [7] }, { cols: [8, 9], splitAt: 3 }, { cols: [10] },
  { cols: [11] }, { cols: [12] }, { cols: [13] }, { cols: [14, 15], splitAt: 1 },
  { cols: [16] }, { cols: [17, 18], splitAt: 2 }, { cols: [19] }, { cols: [20, 21], splitAt: 3 },
  { cols: [22] }, { cols: [23] }, { cols: [24] }, { cols: [25] },
  { cols: [26, 27], splitAt: 1 }, { cols: [28] }, { cols: [29, 30], splitAt: 2 }, { cols: [31] },
  { cols: [32, 33], splitAt: 3 }, { cols: [34] }, { cols: [35] },
];

// MATRIX[girlColumn][boyColumn] = total marriage-points score out of 36.
const MARRIAGE_POINTS_MATRIX = [
  [28, 33, 28, 18, 21, 22, 26, 17, 18, 20, 31, 27, 21, 26, 17, 11, 9, 13, 22, 26, 22, 19, 26, 15, 13, 27, 24, 26, 24, 21, 21, 15, 16, 14, 24, 26],
  [34, 28, 29, 19, 22, 15, 18, 26, 26, 30, 23, 24, 21, 19, 28, 21, 19, 6, 14, 29, 22, 19, 17, 19, 21, 20, 27, 28, 26, 19, 10, 20, 14, 22, 16, 28],
  [27, 27, 28, 17, 9, 15, 19, 20, 21, 25, 26, 23, 17, 21, 22, 15, 15, 18, 27, 15, 19, 16, 20, 26, 24, 19, 14, 15, 10, 25, 25, 27, 19, 17, 19, 11],
  [18, 18, 19, 28, 19, 25, 16, 17, 18, 22, 23, 20, 19, 23, 24, 21, 21, 23, 22, 10, 14, 21, 25, 31, 20, 13, 9, 14, 10, 23, 29, 31, 23, 20, 22, 14],
  [23, 23, 10, 19, 28, 36, 27, 23, 23, 27, 26, 13, 12, 26, 28, 25, 26, 20, 19, 15, 9, 16, 30, 24, 14, 20, 11, 17, 18, 20, 26, 24, 30, 27, 26, 19],
  [22, 13, 15, 27, 34, 28, 20, 25, 23, 26, 19, 22, 21, 17, 25, 23, 27, 13, 10, 25, 17, 23, 22, 25, 15, 11, 18, 21, 24, 13, 19, 27, 29, 26, 17, 27],
  [27, 18, 21, 18, 25, 20, 28, 33, 31, 19, 10, 15, 24, 20, 28, 30, 34, 21, 14, 27, 19, 14, 11, 13, 23, 18, 24, 20, 25, 12, 13, 21, 23, 27, 17, 27],
  [19, 27, 21, 18, 24, 26, 34, 28, 25, 13, 20, 13, 23, 29, 22, 24, 24, 27, 20, 27, 20, 13, 17, 4, 16, 27, 27, 22, 22, 17, 18, 11, 16, 19, 27, 27],
  [19, 26, 22, 19, 23, 24, 32, 24, 28, 16, 23, 16, 22, 27, 21, 23, 24, 25, 18, 27, 21, 13, 20, 5, 13, 26, 27, 27, 23, 17, 18, 11, 17, 19, 27, 28],
  [21, 28, 23, 20, 24, 25, 19, 10, 14, 28, 35, 28, 15, 20, 14, 18, 18, 20, 20, 27, 20, 19, 26, 10, 8, 20, 21, 28, 27, 21, 12, 7, 11, 17, 25, 25],
  [30, 21, 26, 23, 24, 17, 10, 18, 21, 35, 28, 30, 18, 14, 23, 26, 27, 12, 11, 26, 21, 20, 19, 22, 17, 11, 22, 26, 25, 13, 4, 14, 18, 24, 18, 27],
  [25, 23, 22, 19, 12, 21, 13, 12, 15, 28, 28, 28, 15, 15, 17, 20, 20, 26, 25, 11, 16, 15, 20, 26, 22, 16, 8, 12, 13, 27, 18, 18, 12, 18, 20, 12],
  [21, 21, 17, 18, 11, 19, 22, 22, 21, 16, 18, 16, 28, 30, 16, 16, 16, 22, 25, 11, 17, 24, 26, 34, 24, 21, 11, 5, 4, 18, 24, 25, 18, 17, 18, 12],
  [27, 19, 21, 22, 25, 17, 20, 28, 27, 21, 16, 16, 30, 28, 34, 24, 22, 8, 11, 25, 19, 26, 24, 24, 19, 19, 27, 21, 18, 4, 11, 19, 24, 23, 16, 24],
  [18, 27, 22, 23, 27, 25, 28, 21, 21, 16, 25, 18, 26, 34, 28, 18, 16, 14, 17, 26, 17, 24, 32, 19, 10, 27, 28, 22, 20, 11, 18, 12, 16, 15, 26, 24],
  [13, 21, 16, 21, 25, 23, 30, 23, 23, 19, 28, 21, 17, 25, 19, 28, 25, 24, 16, 25, 16, 18, 27, 13, 15, 28, 29, 26, 25, 16, 16, 10, 14, 18, 29, 27],
  [11, 20, 16, 21, 26, 26, 33, 23, 23, 19, 28, 21, 17, 22, 17, 26, 28, 27, 19, 36, 17, 19, 26, 12, 14, 26, 27, 23, 24, 19, 19, 7, 14, 19, 27, 27],
  [13, 6, 19, 25, 20, 12, 19, 26, 24, 20, 12, 26, 23, 9, 15, 24, 27, 28, 20, 19, 26, 28, 11, 25, 28, 13, 21, 17, 19, 18, 18, 24, 18, 22, 11, 21],
  [22, 15, 28, 23, 20, 12, 13, 20, 18, 20, 12, 26, 25, 10, 17, 17, 20, 21, 28, 27, 34, 24, 7, 21, 28, 13, 21, 25, 27, 26, 20, 26, 20, 15, 4, 13],
  [27, 29, 17, 12, 16, 27, 27, 26, 26, 28, 28, 15, 13, 25, 25, 25, 27, 21, 28, 28, 20, 10, 23, 18, 23, 26, 18, 22, 23, 27, 21, 20, 25, 19, 20, 13],
  [22, 22, 20, 15, 10, 18, 19, 21, 21, 22, 21, 19, 17, 19, 18, 17, 18, 27, 34, 18, 28, 18, 17, 21, 28, 21, 13, 17, 17, 32, 26, 26, 22, 16, 13, 5],
  [16, 16, 14, 19, 14, 22, 13, 14, 14, 19, 18, 15, 21, 23, 21, 18, 19, 28, 23, 8, 17, 28, 27, 31, 23, 17, 9, 12, 12, 27, 27, 26, 22, 21, 18, 9],
  [24, 14, 19, 24, 27, 20, 11, 16, 21, 26, 18, 21, 24, 20, 29, 26, 27, 12, 7, 22, 17, 28, 28, 31, 16, 14, 22, 25, 26, 12, 12, 22, 24, 24, 18, 27],
  [12, 18, 24, 29, 22, 22, 13, 3, 6, 10, 20, 26, 31, 23, 16, 13, 12, 25, 20, 17, 20, 31, 30, 28, 15, 17, 17, 20, 20, 25, 25, 18, 11, 9, 21, 21],
  [12, 20, 24, 19, 13, 14, 21, 15, 12, 8, 17, 24, 25, 19, 9, 13, 13, 27, 27, 21, 27, 24, 26, 16, 28, 27, 25, 15, 15, 21, 25, 21, 11, 17, 25, 27],
  [27, 20, 19, 13, 20, 12, 18, 26, 26, 23, 13, 17, 21, 19, 27, 27, 26, 11, 11, 26, 19, 18, 18, 19, 27, 28, 34, 24, 23, 8, 15, 22, 29, 32, 23, 32],
  [25, 27, 14, 8, 11, 18, 24, 26, 26, 23, 24, 9, 11, 27, 28, 28, 27, 20, 20, 19, 12, 11, 25, 19, 25, 34, 28, 18, 15, 15, 22, 22, 28, 31, 32, 23],
  [28, 29, 16, 14, 17, 22, 20, 22, 22, 27, 28, 13, 6, 22, 23, 26, 25, 17, 24, 23, 16, 14, 28, 22, 16, 25, 19, 28, 25, 25, 17, 17, 23, 30, 32, 23],
  [27, 26, 13, 10, 17, 26, 23, 21, 23, 28, 26, 15, 17, 18, 20, 23, 25, 18, 25, 23, 16, 14, 28, 23, 17, 25, 15, 24, 28, 30, 20, 18, 23, 32, 31, 24],
  [20, 10, 26, 23, 20, 12, 8, 17, 17, 22, 13, 28, 18, 5, 12, 16, 18, 16, 24, 26, 30, 28, 14, 28, 21, 9, 16, 25, 21, 28, 18, 23, 21, 26, 15, 22],
  [20, 11, 26, 30, 27, 19, 10, 19, 19, 14, 5, 20, 25, 11, 19, 17, 21, 18, 19, 22, 25, 28, 12, 26, 29, 16, 13, 18, 21, 20, 28, 33, 28, 18, 7, 14],
  [15, 21, 28, 32, 25, 25, 18, 10, 10, 7, 15, 20, 26, 20, 13, 11, 8, 26, 26, 19, 26, 26, 21, 19, 22, 23, 23, 18, 18, 25, 33, 28, 19, 9, 17, 16],
  [18, 25, 20, 24, 31, 31, 24, 17, 17, 13, 20, 14, 19, 25, 17, 15, 17, 18, 19, 28, 21, 21, 27, 12, 15, 30, 29, 24, 25, 20, 27, 19, 28, 18, 23, 20],
  [14, 21, 16, 19, 26, 26, 25, 18, 18, 18, 25, 18, 16, 22, 14, 16, 18, 19, 12, 20, 14, 21, 27, 11, 15, 31, 30, 28, 30, 25, 17, 7, 16, 28, 33, 30],
  [24, 15, 18, 21, 25, 17, 16, 25, 27, 26, 19, 20, 17, 15, 25, 27, 26, 9, 3, 19, 12, 19, 20, 22, 24, 22, 31, 29, 29, 14, 6, 16, 21, 33, 28, 34],
  [25, 24, 11, 14, 17, 26, 25, 24, 25, 24, 27, 13, 12, 22, 22, 24, 26, 20, 13, 11, 5, 12, 27, 22, 27, 30, 21, 19, 22, 22, 14, 16, 18, 29, 33, 28],
];

function matrixColumnForPada(nakshatraIndex, pada) {
  const entry = NAKSHATRA_COLUMNS[nakshatraIndex];
  if (entry.cols.length === 1) return entry.cols[0];
  return pada <= entry.splitAt ? entry.cols[0] : entry.cols[1];
}

// Boy's star reads across the top, girl's star reads down the side, per the source chart.
export function matrixScore(maleProfile, femaleProfile) {
  const boyCol = matrixColumnForPada(maleProfile.nakshatraIndex, maleProfile.pada);
  const girlCol = matrixColumnForPada(femaleProfile.nakshatraIndex, femaleProfile.pada);
  return MARRIAGE_POINTS_MATRIX[girlCol][boyCol];
}
// -------------------------------------------------------------------------------------

const norm = (value) => ((value % 360) + 360) % 360;
const sin = (degrees) => Math.sin(degrees * DEG);
const cos = (degrees) => Math.cos(degrees * DEG);
const tan = (degrees) => Math.tan(degrees * DEG);

function keplerSolve(meanAnomalyDeg, eccentricity) {
  let e = meanAnomalyDeg;
  for (let i = 0; i < 4; i++) {
    e = e - (e - (180 / Math.PI) * eccentricity * sin(e) - meanAnomalyDeg) / (1 - eccentricity * cos(e));
  }
  return e;
}

function sunPosition(jd) {
  const d = jd - 2451543.5;
  const perigee = norm(282.9404 + 0.0000470935 * d);
  const meanAnomaly = norm(356.047 + 0.9856002585 * d);
  const eccentricity = 0.016709 - 1.151e-9 * d;
  const eccentricAnomaly = keplerSolve(meanAnomaly, eccentricity);
  const xv = cos(eccentricAnomaly) - eccentricity;
  const yv = Math.sqrt(1 - eccentricity ** 2) * sin(eccentricAnomaly);
  const trueAnomaly = Math.atan2(yv, xv) / DEG;
  const distance = Math.hypot(xv, yv);
  return { longitude: norm(trueAnomaly + perigee), distance };
}

// Low-precision geocentric Mars longitude, the same compact orbital-elements method
// (and the same accuracy tier) used for the Moon above — good enough to place Mars
// in a zodiac sign for Mangal Dosha, not for anything finer.
function marsLongitude(jd) {
  const d = jd - 2451543.5;
  const node = norm(49.5574 + 2.11081e-5 * d);
  const inclination = 1.8497 - 1.78e-8 * d;
  const perigee = norm(286.5016 + 2.92961e-5 * d);
  const semiMajorAxis = 1.523688;
  const eccentricity = 0.093405 + 2.516e-9 * d;
  const meanAnomaly = norm(18.6021 + 0.5240207766 * d);
  const eccentricAnomaly = keplerSolve(meanAnomaly, eccentricity);
  const xv = semiMajorAxis * (cos(eccentricAnomaly) - eccentricity);
  const yv = semiMajorAxis * Math.sqrt(1 - eccentricity ** 2) * sin(eccentricAnomaly);
  const trueAnomaly = Math.atan2(yv, xv) / DEG;
  const radius = Math.hypot(xv, yv);
  const argument = norm(trueAnomaly + perigee);
  const xh = radius * (cos(node) * cos(argument) - sin(node) * sin(argument) * cos(inclination));
  const yh = radius * (sin(node) * cos(argument) + cos(node) * sin(argument) * cos(inclination));

  const sun = sunPosition(jd);
  const xg = xh + sun.distance * cos(sun.longitude);
  const yg = yh + sun.distance * sin(sun.longitude);
  return norm(Math.atan2(yg, xg) / DEG);
}

// Greenwich Mean Sidereal Time, in degrees (standard IAU 1982 formula).
function greenwichSiderealTime(jd) {
  const t = (jd - 2451545) / 36525;
  return norm(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * t ** 2 - (t ** 3) / 38710000);
}

// Mean obliquity of the ecliptic, in degrees.
function obliquityOfEcliptic(jd) {
  const t = (jd - 2451545) / 36525;
  return 23.439291 - 0.0130042 * t;
}

// Tropical ecliptic longitude of the Ascendant (Lagna), from Greenwich sidereal
// time, the birthplace's east longitude, its latitude, and the obliquity of the
// ecliptic — the standard closed-form Ascendant formula, verified in this app's
// test suite against an independent numerical horizon search.
function ascendantLongitude(jd, latitude, longitudeEast) {
  const ramc = norm(greenwichSiderealTime(jd) + longitudeEast);
  const eps = obliquityOfEcliptic(jd);
  const y = -cos(ramc);
  const x = sin(eps) * tan(latitude) + cos(eps) * sin(ramc);
  return norm(Math.atan2(y, x) / DEG);
}

// Navamsha (D9): each 30° sign divides into nine 3°20' slices; treating the whole
// 360° zodiac as one continuous run of these slices (Aries-first) reproduces the
// classical movable/fixed/dual starting-sign rule exactly, and is far simpler.
function navamshaIndex(longitude) {
  return Math.floor(norm(longitude) / (10 / 3)) % 12;
}

export function julianDay(date, time, utcOffsetMinutes) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const utcMillis = Date.UTC(year, month - 1, day, hour, minute) - utcOffsetMinutes * 60_000;
  return utcMillis / 86_400_000 + 2440587.5;
}

// Low-precision geocentric lunar model after the compact orbital-elements method
// popularised by Paul Schlyter, with the largest lunar perturbation terms retained.
export function tropicalMoonLongitude(jd) {
  const d = jd - 2451543.5;
  const node = norm(125.1228 - 0.0529538083 * d);
  const perigee = norm(318.0634 + 0.1643573223 * d);
  const meanAnomaly = norm(115.3654 + 13.0649929509 * d);
  const eccentricity = 0.0549;
  const eccentricAnomaly = meanAnomaly + (180 / Math.PI) * eccentricity * sin(meanAnomaly) * (1 + eccentricity * cos(meanAnomaly));
  const xv = 60.2666 * (cos(eccentricAnomaly) - eccentricity);
  const yv = 60.2666 * Math.sqrt(1 - eccentricity ** 2) * sin(eccentricAnomaly);
  const trueAnomaly = Math.atan2(yv, xv) / DEG;
  const radius = Math.hypot(xv, yv);
  const argument = norm(trueAnomaly + perigee);
  const xh = radius * (cos(node) * cos(argument) - sin(node) * sin(argument) * cos(5.1454));
  const yh = radius * (sin(node) * cos(argument) + cos(node) * sin(argument) * cos(5.1454));
  let longitude = norm(Math.atan2(yh, xh) / DEG);

  const sunPerigee = norm(282.9404 + 0.0000470935 * d);
  const sunAnomaly = norm(356.047 + 0.9856002585 * d);
  const sunLongitude = norm(sunPerigee + sunAnomaly);
  const moonMeanLongitude = norm(meanAnomaly + perigee + node);
  const elongation = norm(moonMeanLongitude - sunLongitude);
  const latitudeArgument = norm(moonMeanLongitude - node);
  longitude += -1.274 * sin(meanAnomaly - 2 * elongation)
    + 0.658 * sin(2 * elongation)
    - 0.186 * sin(sunAnomaly)
    - 0.059 * sin(2 * meanAnomaly - 2 * elongation)
    - 0.057 * sin(meanAnomaly - 2 * elongation + sunAnomaly)
    + 0.053 * sin(meanAnomaly + 2 * elongation)
    + 0.046 * sin(2 * elongation - sunAnomaly)
    + 0.041 * sin(meanAnomaly - sunAnomaly)
    - 0.035 * sin(elongation)
    - 0.031 * sin(meanAnomaly + sunAnomaly)
    - 0.015 * sin(2 * latitudeArgument - 2 * elongation)
    + 0.011 * sin(meanAnomaly - 4 * elongation);
  return norm(longitude);
}

// Linear Chitrapaksha/Lahiri approximation anchored near J2000.
export function lahiriAyanamsha(jd) {
  return 23.8530556 + ((jd - 2451545) / 365.2425) * (50.290966 / 3600);
}

export function moonProfileFromLongitude(longitude) {
  const siderealLongitude = norm(longitude);
  const nakshatraIndex = Math.floor(siderealLongitude / NAKSHATRA_SPAN);
  const withinNakshatra = siderealLongitude - nakshatraIndex * NAKSHATRA_SPAN;
  const pada = Math.min(4, Math.floor(withinNakshatra / PADA_SPAN) + 1);
  const rashiIndex = Math.floor(siderealLongitude / 30);
  return {
    longitude: siderealLongitude,
    nakshatraIndex,
    nakshatra: NAKSHATRAS[nakshatraIndex],
    pada,
    rashiIndex,
    rashi: RASHIS[rashiIndex],
  };
}

const MANGAL_HOUSES = [1, 2, 4, 7, 8, 12];

export function birthProfile({ date, time, utcOffsetMinutes, latitude, longitude }) {
  const jd = julianDay(date, time, Number(utcOffsetMinutes));
  const tropicalLongitude = tropicalMoonLongitude(jd);
  const ayanamsha = lahiriAyanamsha(jd);
  const moon = moonProfileFromLongitude(tropicalLongitude - ayanamsha);
  const marsSidereal = norm(marsLongitude(jd) - ayanamsha);
  const marsRashiIndex = Math.floor(marsSidereal / 30);
  const manglikHouse = ((marsRashiIndex - moon.rashiIndex + 12) % 12) + 1;

  // Navamsha (D9) only needs the Moon's own sidereal longitude, so it's always
  // available, with no birthplace required.
  const navamshaRashiIndex = navamshaIndex(moon.longitude);

  const hasBirthplace = Number.isFinite(latitude) && Number.isFinite(longitude);
  const lagna = hasBirthplace ? moonProfileFromLongitude(ascendantLongitude(jd, latitude, longitude) - ayanamsha) : null;
  const lagnaManglikHouse = lagna ? ((marsRashiIndex - lagna.rashiIndex + 12) % 12) + 1 : null;

  return {
    jd,
    tropicalLongitude,
    ayanamsha,
    ...moon,
    marsRashiIndex,
    marsRashi: RASHIS[marsRashiIndex],
    manglikHouse,
    manglik: MANGAL_HOUSES.includes(manglikHouse),
    navamshaRashiIndex,
    navamshaRashi: RASHIS[navamshaRashiIndex],
    vargottama: navamshaRashiIndex === moon.rashiIndex,
    hasBirthplace,
    lagna,
    lagnaManglikHouse,
    lagnaManglik: lagna ? MANGAL_HOUSES.includes(lagnaManglikHouse) : null,
  };
}

const varnaRanks = { Shudra: 1, Vaishya: 2, Kshatriya: 3, Brahmin: 4 };
const varnaByRashi = ["Kshatriya", "Vaishya", "Shudra", "Brahmin", "Kshatriya", "Vaishya", "Shudra", "Brahmin", "Kshatriya", "Vaishya", "Shudra", "Brahmin"];
const lordsByRashi = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];

function vashyaFor(profile) {
  const position = profile.longitude % 30;
  if ([0, 1].includes(profile.rashiIndex)) return "Chatushpada";
  if ([2, 5, 6, 10].includes(profile.rashiIndex)) return "Manava";
  if ([3, 11].includes(profile.rashiIndex)) return "Jalachara";
  if (profile.rashiIndex === 4) return "Vanachara";
  if (profile.rashiIndex === 7) return "Keeta";
  if (profile.rashiIndex === 8) return position < 15 ? "Manava" : "Chatushpada";
  return position < 15 ? "Chatushpada" : "Jalachara";
}

const vashyaScores = {
  "Chatushpada|Jalachara": 1, "Chatushpada|Manava": 1, "Chatushpada|Vanachara": 0.5,
  "Jalachara|Keeta": 1, "Jalachara|Manava": 0.5, "Jalachara|Vanachara": 0.5,
  "Keeta|Manava": 0, "Keeta|Vanachara": 0, "Manava|Vanachara": 0.5,
};

const planetRelations = {
  Sun: { friend: ["Moon", "Mars", "Jupiter"], enemy: ["Venus", "Saturn"] },
  Moon: { friend: ["Sun", "Mercury"], enemy: [] },
  Mars: { friend: ["Sun", "Moon", "Jupiter"], enemy: ["Mercury"] },
  Mercury: { friend: ["Sun", "Venus"], enemy: ["Moon"] },
  Jupiter: { friend: ["Sun", "Moon", "Mars"], enemy: ["Mercury", "Venus"] },
  Venus: { friend: ["Mercury", "Saturn"], enemy: ["Sun", "Moon"] },
  Saturn: { friend: ["Mercury", "Venus"], enemy: ["Sun", "Moon", "Mars"] },
};

const yoniArchEnemies = [
  ["Horse", "Buffalo"], ["Elephant", "Lion"], ["Sheep", "Monkey"],
  ["Serpent", "Mongoose"], ["Dog", "Deer"], ["Cat", "Rat"], ["Cow", "Tiger"],
];
const yoniFriends = [
  ["Horse", "Elephant"], ["Horse", "Dog"], ["Elephant", "Sheep"], ["Sheep", "Cow"],
  ["Serpent", "Cat"], ["Dog", "Tiger"], ["Cat", "Monkey"], ["Cow", "Buffalo"],
  ["Buffalo", "Deer"], ["Tiger", "Lion"], ["Deer", "Elephant"], ["Monkey", "Lion"],
];

const pairKey = (a, b) => [a, b].sort().join("|");
const pairIn = (pairs, a, b) => pairs.some((pair) => pairKey(...pair) === pairKey(a, b));

function relation(from, to) {
  if (from === to) return "same";
  if (planetRelations[from].friend.includes(to)) return "friend";
  if (planetRelations[from].enemy.includes(to)) return "enemy";
  return "neutral";
}

const detail = (id, name, score, max, note, values) => ({ id, name, score, max, note, values });

function alignmentLabel(score, max) {
  const percent = max === 0 ? 0 : score / max;
  if (percent >= 0.999) return "Fully aligned";
  if (percent >= 0.5) return "Mostly aligned";
  if (percent > 0) return "Partially aligned";
  return "Limited alignment";
}

export function calculateKootas(male, female) {
  const maleVarna = varnaByRashi[male.rashiIndex];
  const femaleVarna = varnaByRashi[female.rashiIndex];
  const varna = varnaRanks[maleVarna] >= varnaRanks[femaleVarna] ? 1 : 0;

  const maleVashya = vashyaFor(male);
  const femaleVashya = vashyaFor(female);
  const vashyaKey = pairKey(maleVashya, femaleVashya);
  const vashya = maleVashya === femaleVashya ? 2 : (vashyaScores[vashyaKey] ?? 0);

  const taraDistance = (a, b) => ((b - a + 27) % 27) + 1;
  const taraGood = (distance) => [0, 2, 4, 6, 8].includes(distance % 9);
  const maleToFemale = taraDistance(male.nakshatraIndex, female.nakshatraIndex);
  const femaleToMale = taraDistance(female.nakshatraIndex, male.nakshatraIndex);
  const tara = (taraGood(maleToFemale) ? 1.5 : 0) + (taraGood(femaleToMale) ? 1.5 : 0);

  const maleYoni = male.nakshatra.yoni;
  const femaleYoni = female.nakshatra.yoni;
  let yoni = 2;
  if (maleYoni === femaleYoni) yoni = 4;
  else if (pairIn(yoniArchEnemies, maleYoni, femaleYoni)) yoni = 0;
  else if (pairIn(yoniFriends, maleYoni, femaleYoni)) yoni = 3;

  const maleLord = lordsByRashi[male.rashiIndex];
  const femaleLord = lordsByRashi[female.rashiIndex];
  const lordRelations = [relation(maleLord, femaleLord), relation(femaleLord, maleLord)];
  let maitri = 0;
  if (maleLord === femaleLord || lordRelations.every((value) => value === "friend")) maitri = 5;
  else if (lordRelations.includes("friend") && lordRelations.includes("neutral")) maitri = 4;
  else if (lordRelations.every((value) => value === "neutral")) maitri = 3;
  else if (lordRelations.includes("friend") && lordRelations.includes("enemy")) maitri = 1;
  else if (lordRelations.includes("neutral") && lordRelations.includes("enemy")) maitri = 0.5;

  const ganaA = male.nakshatra.gana;
  const ganaB = female.nakshatra.gana;
  let gana = 0;
  if (ganaA === ganaB) gana = 6;
  else if (pairKey(ganaA, ganaB) === pairKey("Deva", "Manushya")) gana = 5;
  else if (pairKey(ganaA, ganaB) === pairKey("Deva", "Rakshasa")) gana = 1;

  const rashiDistanceA = ((female.rashiIndex - male.rashiIndex + 12) % 12) + 1;
  const rashiDistanceB = ((male.rashiIndex - female.rashiIndex + 12) % 12) + 1;
  const bhakootFault = [2, 5, 6, 8, 9, 12].includes(rashiDistanceA) || [2, 5, 6, 8, 9, 12].includes(rashiDistanceB);
  const bhakoot = bhakootFault ? 0 : 7;

  const sameNadi = male.nakshatra.nadi === female.nakshatra.nadi;
  const nadi = sameNadi ? 0 : 8;

  const categories = [
    detail("varna", "Mindset & Spirit", varna, 1, "How closely your inner nature and outlook match.", alignmentLabel(varna, 1)),
    detail("vashya", "Mutual Pull", vashya, 2, "A symbolic read on attraction and who tends to lead.", alignmentLabel(vashya, 2)),
    detail("tara", "Wellbeing", tara, 3, "Checks whether your birth stars support each other's luck and health.", alignmentLabel(tara, 3)),
    detail("yoni", "Chemistry", yoni, 4, "A traditional symbol-based read on physical compatibility.", `${maleYoni} & ${femaleYoni}`),
    detail("maitri", "Mental Connection", maitri, 5, "How well your minds and communication styles are likely to click.", `${maleLord} & ${femaleLord}`),
    detail("gana", "Temperament", gana, 6, "Compares your general pace and nature — calm, balanced, or intense.", alignmentLabel(gana, 6)),
    detail("bhakoot", "Love & Family Harmony", bhakoot, 7, "A traditional check for long-term emotional and family harmony.", alignmentLabel(bhakoot, 7)),
    detail("nadi", "Health Compatibility", nadi, 8, "A traditional check historically linked to health and vitality between partners.", alignmentLabel(nadi, 8)),
  ];
  const score = matrixScore(male, female);
  return { score, categories, band: scoreBand(score) };
}

export function scoreBand(score) {
  if (score >= 28) return { label: "A strong match", tone: "high", note: "Many traditional factors align well between you two." };
  if (score >= 21) return { label: "A good match", tone: "good", note: "Most factors align, with a few worth talking through." };
  if (score >= 18) return { label: "A mixed match", tone: "mixed", note: "Some factors align and others don't — a fairly even mix." };
  return { label: "A challenging match", tone: "low", note: "Several traditional factors differ between you two." };
}

// --- Additional traditional checks (outside the 36-point Ashtakoota score) -----------
//
// Mangal Dosha (Manglik status) is checked here from the Moon chart only — the fullest
// traditional version also checks from the Ascendant, which needs a birthplace with
// coordinates, not just a UTC offset, so it's outside this app's current scope.
//
// Rajju groups nakshatras into a repeating Pada/Kati/Nabhi/Kantha/Shira cycle used by
// many traditional guides. Vedha lists a fixed set of mutually afflicting nakshatra
// pairs. Nadi/Bhakoot cancellation (Parihara) rules vary by author; the ones used below
// are commonly cited, not the only versions in circulation.
const RAJJU_BY_NAKSHATRA = [
  "Pada", "Kati", "Nabhi", "Kantha", "Shira", "Kantha", "Nabhi", "Kati", "Pada",
  "Pada", "Kati", "Nabhi", "Kantha", "Shira", "Kantha", "Nabhi", "Kati", "Pada",
  "Pada", "Kati", "Nabhi", "Kantha", "Shira", "Kantha", "Nabhi", "Kati", "Pada",
];

const VEDHA_PAIRS = [
  ["Ashwini", "Jyeshtha"], ["Bharani", "Anuradha"], ["Krittika", "Vishakha"],
  ["Rohini", "Swati"], ["Mrigashira", "Chitra"], ["Ardra", "Shravana"],
  ["Punarvasu", "Uttara Ashadha"], ["Pushya", "Purva Ashadha"], ["Ashlesha", "Mula"],
  ["Magha", "Revati"], ["Purva Phalguni", "Uttara Bhadrapada"], ["Uttara Phalguni", "Purva Bhadrapada"],
  ["Hasta", "Shatabhisha"],
];

function mangalStatus(male, female) {
  const compatible = male.manglik === female.manglik;
  return {
    male: male.manglik, female: female.manglik, compatible,
    note: compatible
      ? (male.manglik ? "Both charts show Mangal Dosha — traditionally considered a balanced pairing." : "Neither chart shows Mangal Dosha.")
      : "Only one chart shows Mangal Dosha — commonly flagged for a closer look; several traditional exceptions can still apply.",
  };
}

function lagnaMangalStatus(male, female) {
  if (!male.hasBirthplace || !female.hasBirthplace) return null;
  const compatible = male.lagnaManglik === female.lagnaManglik;
  return {
    male: male.lagnaManglik, female: female.lagnaManglik, compatible,
    note: compatible
      ? (male.lagnaManglik ? "Both charts show Mangal Dosha from the Ascendant — traditionally considered a balanced pairing." : "Neither chart shows Mangal Dosha from the Ascendant.")
      : "Only one chart shows Mangal Dosha from the Ascendant — this is the fuller, more authoritative version of the check.",
  };
}

function navamshaStatus(male, female) {
  const maleLord = lordsByRashi[male.navamshaRashiIndex];
  const femaleLord = lordsByRashi[female.navamshaRashiIndex];
  const lordRelations = [relation(maleLord, femaleLord), relation(femaleLord, maleLord)];
  const harmonious = maleLord === femaleLord || lordRelations.every((value) => value === "friend" || value === "same");
  const strained = lordRelations.includes("enemy");
  return {
    maleRashi: male.navamshaRashi, femaleRashi: female.navamshaRashi,
    maleVargottama: male.vargottama, femaleVargottama: female.vargottama,
    harmonious, strained,
    note: harmonious
      ? "Your Navamsha (D9) Moon signs share a friendly relationship — a supportive secondary read."
      : strained
        ? "Your Navamsha (D9) Moon signs are traditionally unfriendly — worth weighing alongside the main score, not on its own."
        : "Your Navamsha (D9) Moon signs are traditionally neutral toward each other.",
  };
}

function nadiStatus(male, female) {
  const sameNadi = male.nakshatra.nadi === female.nakshatra.nadi;
  if (!sameNadi) return { present: false, cancelled: false, note: "Different Nadi groups — no dosha." };
  const sameRashi = male.rashiIndex === female.rashiIndex;
  if (!sameRashi) return { present: true, cancelled: true, note: "Same Nadi, but different Moon signs — commonly treated as cancelled." };
  return { present: true, cancelled: false, note: "Same Nadi and same Moon sign — dosha applies." };
}

function bhakootStatus(male, female) {
  const rashiDistanceA = ((female.rashiIndex - male.rashiIndex + 12) % 12) + 1;
  const rashiDistanceB = ((male.rashiIndex - female.rashiIndex + 12) % 12) + 1;
  const fault = [2, 5, 6, 8, 9, 12].includes(rashiDistanceA) || [2, 5, 6, 8, 9, 12].includes(rashiDistanceB);
  if (!fault) return { present: false, cancelled: false, note: "No adverse Moon-sign distance — no dosha." };
  const maleLord = lordsByRashi[male.rashiIndex];
  const femaleLord = lordsByRashi[female.rashiIndex];
  const lordRelations = [relation(maleLord, femaleLord), relation(femaleLord, maleLord)];
  const cancelled = maleLord === femaleLord || lordRelations.every((value) => value === "friend" || value === "same");
  return {
    present: true, cancelled,
    note: cancelled ? "Adverse Moon-sign distance, but the sign lords are friendly — commonly treated as cancelled." : "Adverse Moon-sign distance — dosha applies.",
  };
}

function rajjuStatus(male, female) {
  const maleGroup = RAJJU_BY_NAKSHATRA[male.nakshatraIndex];
  const femaleGroup = RAJJU_BY_NAKSHATRA[female.nakshatraIndex];
  const present = maleGroup === femaleGroup;
  return {
    present, group: maleGroup,
    note: present ? `Both birth stars fall in the ${maleGroup} Rajju group — traditionally flagged.` : "Different Rajju groups — no dosha.",
  };
}

function vedhaStatus(male, female) {
  const present = pairIn(VEDHA_PAIRS, male.nakshatra.name, female.nakshatra.name);
  return { present, note: present ? "These two birth stars are a traditionally listed afflicting pair." : "No traditional affliction listed between these birth stars." };
}

export function additionalChecks(male, female) {
  return {
    mangal: mangalStatus(male, female),
    lagnaMangal: lagnaMangalStatus(male, female),
    nadi: nadiStatus(male, female),
    bhakoot: bhakootStatus(male, female),
    rajju: rajjuStatus(male, female),
    vedha: vedhaStatus(male, female),
    navamsha: navamshaStatus(male, female),
  };
}
// ---------------------------------------------------------------------------------------

export function recommendNakshatras(male, limit = 8) {
  const boyCol = matrixColumnForPada(male.nakshatraIndex, male.pada);
  return NAKSHATRAS.map((nakshatra) => {
    const entry = NAKSHATRA_COLUMNS[nakshatra.index];
    const options = entry.cols.map((col, i) => {
      const pada = entry.cols.length === 1 ? 1 : (i === 0 ? 1 : 4);
      const longitude = nakshatra.index * NAKSHATRA_SPAN + (pada - 0.5) * PADA_SPAN;
      return { pada, rashi: moonProfileFromLongitude(longitude).rashi, score: MARRIAGE_POINTS_MATRIX[col][boyCol] };
    });
    const best = options.sort((a, b) => b.score - a.score)[0];
    return { nakshatra, score: best.score, pada: best.pada, rashi: best.rashi };
  }).sort((a, b) => b.score - a.score || a.nakshatra.index - b.nakshatra.index).slice(0, limit);
}
