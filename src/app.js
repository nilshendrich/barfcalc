// ------------------ app.js ------------------

let meats = [];
let totalWeightInput, targetFatInput, resultDiv, resultTable;
let translations = {};
let currentLang = 'de';

// Initialize application
function init() {
  totalWeightInput = document.getElementById("totalWeight");
  targetFatInput = document.getElementById("targetFat");
  resultDiv = document.getElementById("result");
  resultTable = document.getElementById("resultTable").querySelector("tbody");

  loadConfig();

  document.getElementById("addMeatBtn").addEventListener("click", addMeat);
  document.getElementById("calcBtn").addEventListener("click", calculate);
}

// Load default meat types from config.json
async function loadConfig() {
  try {
    const savedMeats = localStorage.getItem("meats");
    if (savedMeats) {
      meats = JSON.parse(savedMeats);
      renderMeats();
      return;
    }
    const response = await fetch("config.json");
    meatsFromConfig = await response.json();
    meats = meatsFromConfig.defaultMeats;
    renderMeats();
  } catch (err) {
    console.error("Error loading config:", err);
  }
}

// Render meat input fields
function renderMeats() {
  const container = document.getElementById("meat-list");
  container.innerHTML = "";

  meats.forEach((meat, index) => {
    const div = document.createElement("div");
    div.className = "meat-item";

    div.innerHTML = `
      <label>
        <input type="checkbox" ${meat.active !== false ? 'checked' : ''} 
               onchange="toggleMeat(${index}, this.checked)">
        <input type="text" value="${meat.name}" 
               onchange="updateMeat(${index}, 'name', this.value)" 
               data-i18n-placeholder="labels.namePlaceholder" placeholder="Meat name">
      </label>
      <label>
        <span data-i18n="labels.fat">Fat content (%):</span>
        <input type="number" value="${meat.fat}" step="0.1" min="0" max="100" 
               onchange="updateMeat(${index}, 'fat', this.value)">
      </label>
      <button onclick="removeMeat(${index})" data-i18n="buttons.remove">❌ Remove</button>
    `;

    container.appendChild(div);
  });

  saveMeats();
  applyTranslations();
}

// Add a new meat type
function addMeat() {
  meats.push({ name: "", fat: 0, active: true });
  renderMeats();
}

// Update meat properties
function updateMeat(index, key, value) {
  meats[index][key] = key === 'fat' ? parseFloat(value) : value;
  saveMeats();
}

// Toggle meat activation
function toggleMeat(index, isActive) {
  meats[index].active = isActive;
  saveMeats();
}

// Remove meat type
function removeMeat(index) {
  meats.splice(index, 1);
  renderMeats();
}

// Save meats to localStorage
function saveMeats() {
  localStorage.setItem("meats", JSON.stringify(meats));
}

// Perform fat calculation
function calculate() {
  const totalWeight = parseFloat(totalWeightInput.value);
  const targetFat = parseFloat(targetFatInput.value);
  const activeMeats = meats.filter(m => m.active !== false);

  if (!totalWeight || !targetFat || activeMeats.length < 2) {
    alert(translations.alerts?.inputMissing || "Please provide valid input.");
    return;
  }

  const minFat = Math.min(...activeMeats.map(m => m.fat));
  const maxFat = Math.max(...activeMeats.map(m => m.fat));
  let exactPossible = targetFat >= minFat && targetFat <= maxFat;

  // Start with minimum 10% allocation
  const minShare = 0.1 * totalWeight;
  let portions = Array(activeMeats.length).fill(minShare);
  let remaining = totalWeight - minShare * activeMeats.length;

  // Iteratively distribute remaining weight
  for (let iter = 0; iter < 1000 && remaining > 0.01; iter++) {
    // Current fat average
    let achievedFat = portions.reduce((sum, p, i) => sum + p * activeMeats[i].fat, 0) / totalWeight;

    // Difference to target
    let diff = targetFat - achievedFat;

    if (Math.abs(diff) < 0.01) break; // Done

    // Choose meats depending on direction
    let candidates = diff > 0
      ? activeMeats.map((m, i) => ({ idx: i, fat: m.fat })).filter(m => m.fat > achievedFat)
      : activeMeats.map((m, i) => ({ idx: i, fat: m.fat })).filter(m => m.fat < achievedFat);

    if (candidates.length === 0) break; // No more improvement possible

    // Add small portion to best candidate
    let best = diff > 0
      ? candidates.reduce((a, b) => a.fat < b.fat ? b : a) // fattest meat
      : candidates.reduce((a, b) => a.fat > b.fat ? b : a); // leanest meat

    let add = Math.min(remaining, totalWeight * 0.01); // add up to 1% each step
    portions[best.idx] += add;
    remaining -= add;
  }

  // Final achieved fat
  let achievedFat = portions.reduce((sum, p, i) => sum + (p * activeMeats[i].fat), 0) / totalWeight;

  // Display results
  resultDiv.innerHTML = `
    <div data-i18n="resultText.targetFat">${translations.resultText?.targetFat || "Target fat"}:</div><div> ${targetFat}%</div>
    <div data-i18n="resultText.avgFat">${translations.resultText?.avgFat || "Estimated average fat"}:</div><div> ${achievedFat.toFixed(2)}%</div>
    ${!exactPossible ? `<p><em>⚠️ Target outside possible range (min ${minFat}%, max ${maxFat}%).</em></p>` : ""}
  `;

  resultTable.innerHTML = "";
  activeMeats.forEach((meat, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${meat.name}</td>
      <td>${meat.fat}%</td>
      <td>${portions[i].toFixed(1)} g</td>
    `;
    resultTable.appendChild(row);
  });
}

// ------------------ Language Support ------------------

async function loadLanguage(lang) {
  try {
    const response = await fetch(`./lang/${lang}.json`);
    translations = await response.json();
    currentLang = lang;
    localStorage.setItem('language', lang);
    applyTranslations();
  } catch (err) {
    console.error("Error loading language file:", err);
  }
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const keys = key.split('.');
    let value = translations;
    keys.forEach(k => { value = value?.[k]; });
    if (value) el.textContent = value;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    const keys = key.split('.');
    let value = translations;
    keys.forEach(k => { value = value?.[k]; });
    if (value) el.setAttribute("placeholder", value);
  });
}

function initLanguage() {
  const savedLang = localStorage.getItem('language');
  const browserLang = navigator.language.startsWith('de') ? 'de' : 'en';
  loadLanguage(savedLang || browserLang);
}

function switchLanguage() {
  const newLang = currentLang === 'en' ? 'de' : 'en';
  loadLanguage(newLang);
}

// ------------------ Init ------------------

window.onload = () => {
  initLanguage();
  init();
};