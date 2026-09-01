import test from "node:test";
import assert from "node:assert/strict";
import { birthProfile, calculateKootas, julianDay, moonProfileFromLongitude, recommendNakshatras } from "../calculations.js";

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
  assert.equal(result.score, 25); // Janma Tara and same Nadi score zero; no cancellation rules are applied.
});

test("birth calculation is deterministic and bounded", () => {
  const result = birthProfile({ date: "1992-08-14", time: "07:45", utcOffsetMinutes: 330 });
  assert.ok(result.longitude >= 0 && result.longitude < 360);
  assert.ok(result.nakshatraIndex >= 0 && result.nakshatraIndex < 27);
  assert.ok(result.pada >= 1 && result.pada <= 4);
});

test("recommendations rank eight unique nakshatras on the 36-point scale", () => {
  const male = moonProfileFromLongitude(25);
  const recommendations = recommendNakshatras(male);
  assert.equal(recommendations.length, 8);
  assert.equal(new Set(recommendations.map((item) => item.nakshatra.name)).size, 8);
  assert.ok(recommendations.every((item) => item.score >= 0 && item.score <= 36));
  assert.ok(recommendations.every((item, index, list) => index === 0 || list[index - 1].score >= item.score));
});
