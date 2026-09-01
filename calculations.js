const DEG = Math.PI / 180;
const NAKSHATRA_SPAN = 360 / 27;
const PADA_SPAN = NAKSHATRA_SPAN / 4;

export const RASHIS = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena",
];

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

const norm = (value) => ((value % 360) + 360) % 360;
const sin = (degrees) => Math.sin(degrees * DEG);
const cos = (degrees) => Math.cos(degrees * DEG);

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

export function birthProfile({ date, time, utcOffsetMinutes }) {
  const jd = julianDay(date, time, Number(utcOffsetMinutes));
  const tropicalLongitude = tropicalMoonLongitude(jd);
  return {
    jd,
    tropicalLongitude,
    ayanamsha: lahiriAyanamsha(jd),
    ...moonProfileFromLongitude(tropicalLongitude - lahiriAyanamsha(jd)),
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
    detail("varna", "Varna", varna, 1, "Traditional social/spiritual classification by Moon sign.", `${maleVarna} · ${femaleVarna}`),
    detail("vashya", "Vashya", vashya, 2, "A symbolic affinity between five sign-natures.", `${maleVashya} · ${femaleVashya}`),
    detail("tara", "Tara", tara, 3, "Counts each birth star through a repeating nine-star cycle.", `${maleToFemale} / ${femaleToMale} steps`),
    detail("yoni", "Yoni", yoni, 4, "Compares traditional animal emblems assigned to the stars.", `${maleYoni} · ${femaleYoni}`),
    detail("maitri", "Graha Maitri", maitri, 5, "Uses the conventional natural relations of the Moon-sign lords.", `${maleLord} · ${femaleLord}`),
    detail("gana", "Gana", gana, 6, "Compares Deva, Manushya, and Rakshasa temperament groups.", `${ganaA} · ${ganaB}`),
    detail("bhakoot", "Bhakoot", bhakoot, 7, "Tests the traditional 2/12, 5/9, and 6/8 Moon-sign distances.", `${rashiDistanceA} / ${rashiDistanceB} relationship`),
    detail("nadi", "Nadi", nadi, 8, "Compares the three traditional nakshatra groupings; no health inference is made.", `${male.nakshatra.nadi} · ${female.nakshatra.nadi}`),
  ];
  const score = categories.reduce((total, category) => total + category.score, 0);
  return { score, categories, band: scoreBand(score) };
}

export function scoreBand(score) {
  if (score >= 28) return { label: "Strong alignment in this method", tone: "high", note: "The traditional table finds many aligned factors. Treat this as a conversation prompt, not a forecast." };
  if (score >= 21) return { label: "Many supportive factors", tone: "good", note: "Several categories align, with some differences worth discussing in real life." };
  if (score >= 18) return { label: "A mixed traditional result", tone: "mixed", note: "The total combines supportive and contrasting categories; the details matter more than the threshold." };
  return { label: "Several symbolic differences", tone: "low", note: "This method flags differences, but cannot measure care, consent, safety, values, or relationship health." };
}

export function recommendNakshatras(male, limit = 8) {
  return NAKSHATRAS.map((nakshatra) => {
    const padas = [1, 2, 3, 4].map((pada) => {
      const longitude = nakshatra.index * NAKSHATRA_SPAN + (pada - 0.5) * PADA_SPAN;
      const candidate = moonProfileFromLongitude(longitude);
      return { pada, candidate, match: calculateKootas(male, candidate) };
    });
    const best = padas.sort((a, b) => b.match.score - a.match.score || a.pada - b.pada)[0];
    return {
      nakshatra,
      score: best.match.score,
      pada: best.pada,
      rashi: best.candidate.rashi,
      supportive: best.match.categories.filter((category) => category.score === category.max).slice(-3).map((category) => category.name),
    };
  }).sort((a, b) => b.score - a.score || a.nakshatra.index - b.nakshatra.index).slice(0, limit);
}
