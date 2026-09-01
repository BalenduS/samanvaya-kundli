import { birthProfile, calculateKootas, recommendNakshatras } from "./calculations.js";

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

const offsetValues = [
  -720, -660, -600, -570, -540, -480, -420, -360, -300, -240, -210, -180, -120, -60,
  0, 60, 120, 180, 210, 240, 270, 300, 330, 345, 360, 390, 420, 480, 540, 570, 600, 660, 720, 765, 780, 840,
];

function formatOffset(minutes) {
  const sign = minutes >= 0 ? "+" : "−";
  const absolute = Math.abs(minutes);
  return `UTC${sign}${String(Math.floor(absolute / 60)).padStart(2, "0")}:${String(absolute % 60).padStart(2, "0")}`;
}

function populateOffsets() {
  document.querySelectorAll("select[id$='Timezone']").forEach((select) => {
    select.innerHTML = offsetValues.map((minutes) => `<option value="${minutes}" ${minutes === 330 ? "selected" : ""}>${formatOffset(minutes)}</option>`).join("");
  });
}

function setMode(tab) {
  const match = tab === "match";
  $("#matchTab").setAttribute("aria-selected", String(match));
  $("#matchTab").tabIndex = match ? 0 : -1;
  $("#recommendTab").setAttribute("aria-selected", String(!match));
  $("#recommendTab").tabIndex = match ? -1 : 0;
  $("#matchPanel").hidden = !match;
  $("#recommendPanel").hidden = match;
}

function readBirth(prefix) {
  return {
    name: $(`#${prefix}Name`)?.value.trim() || "",
    date: $(`#${prefix}Date`).value,
    time: $(`#${prefix}Time`).value,
    utcOffsetMinutes: Number($(`#${prefix}Timezone`).value),
  };
}

function validBirth(input) {
  if (!input.date || !input.time || !Number.isFinite(input.utcOffsetMinutes)) return false;
  const [year] = input.date.split("-").map(Number);
  return year >= 1900 && year <= 2100;
}

const formatNumber = (value) => Number.isInteger(value) ? String(value) : value.toFixed(1);

function moonChip(label, name, profile) {
  return `<div class="moon-chip"><small>${escapeHtml(label)}</small><b>${escapeHtml(name)} · ${profile.nakshatra.name}</b><span>${profile.rashi} · pada ${profile.pada} · ${profile.longitude.toFixed(2)}°</span></div>`;
}

function renderMatch(maleInput, femaleInput, male, female, match) {
  const maleName = maleInput.name || "Male profile";
  const femaleName = femaleInput.name || "Female profile";
  const percent = (match.score / 36) * 100;
  const categories = match.categories.map((category, index) => `
    <div class="koota-row">
      <span class="koota-index">${String(index + 1).padStart(2, "0")}</span>
      <div class="koota-name"><b>${category.name}</b><small>${escapeHtml(category.values)}</small></div>
      <div class="koota-note">${category.note}</div>
      <div class="koota-score"><b>${formatNumber(category.score)}</b> / ${category.max}</div>
    </div>`).join("");

  $("#matchResults").innerHTML = `
    <div class="result-hero">
      <div class="score-orbit" style="--score:${percent.toFixed(2)}" aria-label="${formatNumber(match.score)} points out of 36">
        <div class="score-inner"><span class="score-number">${formatNumber(match.score)}</span><small>out of 36</small></div>
      </div>
      <div class="result-copy">
        <p class="eyebrow">Ashtakoota result · ${escapeHtml(maleName)} &amp; ${escapeHtml(femaleName)}</p>
        <h3>${match.band.label}</h3>
        <p>${match.band.note}</p>
        <div class="birth-moons">
          ${moonChip("Male Moon", maleName, male)}
          ${moonChip("Female Moon", femaleName, female)}
        </div>
      </div>
    </div>
    <div class="breakdown">
      <div class="breakdown-head"><h4>The eight-kūṭa ledger</h4><p>Each row shows this app’s exact table result.</p></div>
      <div class="koota-list">${categories}</div>
      <p class="result-footnote">No cancellation rules or full-chart judgments are included. If either Moon lies near a boundary, verify the nakshatra with a professional ephemeris before interpreting the table.</p>
    </div>`;
  $("#matchResults").hidden = false;
  $("#matchResults").scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}

function renderRecommendations(input, male, recommendations) {
  const name = input.name || "This profile";
  const cards = recommendations.map((result, index) => `
    <article class="star-card">
      <span class="star-rank">ALIGNMENT ${String(index + 1).padStart(2, "0")}</span>
      <h5>${result.nakshatra.name}</h5>
      <small>${result.nakshatra.deity} · ${result.nakshatra.gana} gana</small>
      <div class="star-score"><b>${formatNumber(result.score)}<small>/36</small></b><span>best at pada ${result.pada}<br>${result.rashi}</span></div>
    </article>`).join("");
  $("#recommendResults").innerHTML = `
    <div class="recommend-head">
      <div><p class="eyebrow">A symbolic shortlist—not a search filter</p><h4>Stars with the strongest table alignment</h4><p>For ${escapeHtml(name)}, we tested the midpoint of every pada. Scores are only a way to inspect traditional categories; they do not rank people.</p></div>
      <div class="recommend-moon"><small>Starting Moon</small><b>${male.nakshatra.name}, pada ${male.pada}</b><br>${male.rashi}</div>
    </div>
    <div class="recommend-grid">${cards}</div>
    <p class="result-footnote">A person’s nakshatra is not their personality, values, readiness, or capacity for a healthy relationship. A full traditional consultation would consider both complete charts and local interpretive rules.</p>`;
  $("#recommendResults").hidden = false;
  $("#recommendResults").scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}

function showError(element, message) {
  element.textContent = message;
  element.hidden = false;
}

$("#matchTab").addEventListener("click", () => setMode("match"));
$("#recommendTab").addEventListener("click", () => setMode("recommend"));
document.querySelector(".mode-tabs").addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  event.preventDefault();
  const next = $("#matchTab").getAttribute("aria-selected") === "true" ? "recommend" : "match";
  setMode(next);
  $(next === "match" ? "#matchTab" : "#recommendTab").focus();
});

$("#demoButton").addEventListener("click", () => {
  const demo = {
    maleName: "Arjun", malePlace: "Jaipur, India", maleDate: "1992-08-14", maleTime: "07:45", maleTimezone: "330",
    femaleName: "Meera", femalePlace: "Pune, India", femaleDate: "1994-11-02", femaleTime: "18:20", femaleTimezone: "330",
  };
  Object.entries(demo).forEach(([id, value]) => { $(`#${id}`).value = value; });
});

$("#matchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  $("#matchError").hidden = true;
  const maleInput = readBirth("male");
  const femaleInput = readBirth("female");
  if (!validBirth(maleInput) || !validBirth(femaleInput)) {
    showError($("#matchError"), "Enter a birth date between 1900 and 2100, local time, and UTC offset for both profiles.");
    return;
  }
  const male = birthProfile(maleInput);
  const female = birthProfile(femaleInput);
  renderMatch(maleInput, femaleInput, male, female, calculateKootas(male, female));
});

$("#recommendForm").addEventListener("submit", (event) => {
  event.preventDefault();
  $("#recommendError").hidden = true;
  const input = readBirth("guide");
  if (!validBirth(input)) {
    showError($("#recommendError"), "Enter a birth date between 1900 and 2100, local time, and UTC offset.");
    return;
  }
  const male = birthProfile(input);
  renderRecommendations(input, male, recommendNakshatras(male));
});

populateOffsets();

let installPrompt;
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  $("#installButton").hidden = false;
});
$("#installButton").addEventListener("click", async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = undefined;
  $("#installButton").hidden = true;
});
window.addEventListener("appinstalled", () => {
  installPrompt = undefined;
  $("#installButton").hidden = true;
});

const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent)
  || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
let iosGuideDismissed = false;
try { iosGuideDismissed = sessionStorage.getItem("ios-install-guide-dismissed") === "true"; } catch {}
if (isIos && !isStandalone && !iosGuideDismissed) $("#iosInstallGuide").hidden = false;
$("#dismissIosGuide").addEventListener("click", () => {
  $("#iosInstallGuide").hidden = true;
  try { sessionStorage.setItem("ios-install-guide-dismissed", "true"); } catch {}
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
