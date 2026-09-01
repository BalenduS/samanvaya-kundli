import test from "node:test";
import assert from "node:assert/strict";
import { additionalChecks, birthProfile, calculateKootas, julianDay, matrixScore, moonProfileFromLongitude, recommendNakshatras } from "../calculations.js";

test("Julian day conversion respects UTC offsets", () => {
  assert.equal(julianDay("2000-01-01", "17:30", 330), 2451545);
});

test("nakshatra and pada boundaries map consistently", () => {
  const start = moonProfileFromLongitude(0);
  assert.equal(start.nakshatra.name, "Ashwini");
  assert.equal(start.pada, 1);
  assert.equal(start.rashi, "Mesha");
  const end = moonProfileFromLongitude(359.99);
  assert.equal(end.nakshatra.name, "Revati");
  assert.equal(end.pada, 4);
  assert.equal(end.rashi, "Meena");
});

test("identical Moon profiles produce a valid 36-point-scale result", () => {
  const profile = moonProfileFromLongitude(42);
  const result = calculateKootas(profile, profile);
  assert.equal(result.categories.length, 8);
  assert.equal(result.categories.reduce((sum, category) => sum + category.max, 0), 36);
  assert.ok(result.score >= 0 && result.score <= 36);
  // Score comes from the reference marriage-points table, not a sum of the categories below.
  assert.equal(result.score, matrixScore(profile, profile));
  assert.equal(result.score, 28); // Same-star pairing per the reference table (source chart, Ashwini x Ashwini).
});

test("matrix score is bounded, asymmetric, and picks up split-nakshatra padas", () => {
  const ashwini = moonProfileFromLongitude(1.6);
  const bharani = moonProfileFromLongitude(15);
  assert.equal(matrixScore(ashwini, bharani), 34);
  assert.equal(matrixScore(bharani, ashwini), 33); // not symmetric — matches the source chart.

  const span = 360 / 27, padaSpan = span / 4, krittikaIndex = 2;
  const krittikaPada1 = moonProfileFromLongitude(krittikaIndex * span + 0.5 * padaSpan);
  const krittikaPada3 = moonProfileFromLongitude(krittikaIndex * span + 2.5 * padaSpan);
  const rohini = moonProfileFromLongitude(3 * span + 0.5 * padaSpan);
  assert.equal(matrixScore(rohini, krittikaPada1), 9); // Krittika pada 1 falls in Mesha.
  assert.equal(matrixScore(rohini, krittikaPada3), 19); // Krittika pada 3 falls in Vrishabha — different column.
});

test("birth calculation is deterministic and bounded", () => {
  const result = birthProfile({ date: "1992-08-14", time: "07:45", utcOffsetMinutes: 330 });
  assert.ok(result.longitude >= 0 && result.longitude < 360);
  assert.ok(result.nakshatraIndex >= 0 && result.nakshatraIndex < 27);
  assert.ok(result.pada >= 1 && result.pada <= 4);
});

test("birth profile includes a bounded Mars-based Mangal Dosha read", () => {
  const result = birthProfile({ date: "1992-08-14", time: "07:45", utcOffsetMinutes: 330 });
  assert.ok(result.marsRashiIndex >= 0 && result.marsRashiIndex < 12);
  assert.ok(result.manglikHouse >= 1 && result.manglikHouse <= 12);
  assert.equal(typeof result.manglik, "boolean");
  assert.equal(result.manglik, [1, 2, 4, 7, 8, 12].includes(result.manglikHouse));
});

test("additional checks are internally consistent and self-pairs never flag Mangal or Vedha", () => {
  const male = birthProfile({ date: "1992-08-14", time: "07:45", utcOffsetMinutes: 330 });
  const female = birthProfile({ date: "1994-11-02", time: "18:20", utcOffsetMinutes: 330 });
  const checks = additionalChecks(male, female);
  assert.equal(checks.mangal.compatible, male.manglik === female.manglik);
  assert.equal(checks.nadi.present, male.nakshatra.nadi === female.nakshatra.nadi);
  if (checks.nadi.cancelled) assert.equal(checks.nadi.present, true);
  if (checks.bhakoot.cancelled) assert.equal(checks.bhakoot.present, true);

  const selfChecks = additionalChecks(male, male);
  assert.equal(selfChecks.mangal.compatible, true); // identical charts can't disagree on Manglik status.
  assert.equal(selfChecks.vedha.present, false); // a star is never listed as its own Vedha pair.
  assert.equal(selfChecks.rajju.present, true); // same birth star is always the same Rajju group.
});

test("recommendations rank eight unique nakshatras on the 36-point scale", () => {
  const male = moonProfileFromLongitude(25);
  const recommendations = recommendNakshatras(male);
  assert.equal(recommendations.length, 8);
  assert.equal(new Set(recommendations.map((item) => item.nakshatra.name)).size, 8);
  assert.ok(recommendations.every((item) => item.score >= 0 && item.score <= 36));
  assert.ok(recommendations.every((item, index, list) => index === 0 || list[index - 1].score >= item.score));
});
