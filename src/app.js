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
  loadSavedTargets();

  document.getElementById("addMeatBtn").addEventListener("click", addMeat);
  document.getElementById("calcBtn").addEventListener("click", calculate);
  document.getElementById("targetFat").addEventListener("change", saveTargets);
  document.getElementById("totalWeight").addEventListener("change", saveTargets);

  if (targetFatInput.value && totalWeightInput && meats.length > 1) {
      calculate();
  }
}

// Load default meat types from config.json
function loadSavedTargets() {
  const savedTargetFat = localStorage.getItem("targetFat");
  if (savedTargetFat) {
    targetFatInput.value = savedTargetFat;
  }

  const savedTotalWeight = localStorage.getItem("totalWeight");
  if (savedTotalWeight) {
    totalWeightInput.value = savedTotalWeight;
  }
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

    if (resultTable) {
      div.style.backgroundImage = 'linear-gradient(to bottom, white 1%, indianred 0%)';
    }

    div.innerHTML = `
          <label>
            <input id="meatname" type="text" value="${meat.name}" 
                  onchange="updateMeat(${index}, 'name', this.value)" 
                  data-i18n-placeholder="labels.namePlaceholder" placeholder="Meat name">
          </label>
          <label>
            <span data-i18n="labels.fat">Fat content (%):</span>
            <input type="number" value="${meat.fat}" step="0.1" min="0" max="100" inputmode="decimal" 
                  onchange="updateMeat(${index}, 'fat', this.value)">
          </label>
          <div class="meatitem-actions">
            <input type="checkbox" ${meat.active !== false ? 'checked' : ''} 
                    onchange="toggleMeat(${index}, this.checked)">
            <button onclick="removeMeat(${index})" data-i18n="buttons.remove">❌ Remove</button>
          </div>
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

// Save target values to localStorage
function saveTargets() {
  localStorage.setItem("targetFat", targetFatInput.value);
  localStorage.setItem("totalWeight", totalWeightInput.value);
}

function visalizeMeatPortions(portionresults, activeMeats) {
  let portionSum = portionresults.reduce((sum, p, i) => sum + p.portion, 0);
  let meatItems = document.getElementsByClassName('meat-item');

  for (let i = 0; i < meatItems.length; i++) {
    meatItems[i].style.backgroundImage = 'linear-gradient(to bottom, white 100%, indianred 0%)';
    let temp = meatItems[i];
    temp = temp.querySelector('input').value;
    for (let j = 0; j < activeMeats.length; j++) {
      let tmpName = activeMeats[j].name;
      if (temp.localeCompare(activeMeats[j].name) == 0) {
        meatItems[i].style.backgroundImage = 'linear-gradient(to bottom, white ' + 100 * (1 - portionresults[j]/totalWeightInput.value) + '%, indianred 0%)';
        break;
      }
      else {
        meatItems[i].style.backgroundImage = 'linear-gradient(to bottom, white 100%, indianred 0%)';
      }
    }
  }
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
  const minShare = 1;
  let portions = Array(activeMeats.length).fill(minShare);
  let remaining = totalWeight - minShare * activeMeats.length;

  // Iteratively distribute remaining weight
  for (let iter = 0; iter < 1001 && remaining > 0.0; iter++) {
    // Current fat average
    let achievedFat = 100 * portions.reduce((sum, p, i) => sum + p * activeMeats[i].fat / 100, 0) / (totalWeight-remaining);

    // Difference to target
    let diff = targetFat - achievedFat;

    // Choose meats depending on direction
    let candidates = diff > 0
      ? activeMeats.map((m, i) => ({ idx: i, fat: m.fat, portion: portions[i] })).filter(m => m.fat > achievedFat)
      : activeMeats.map((m, i) => ({ idx: i, fat: m.fat, portion: portions[i] })).filter(m => m.fat < achievedFat);

    if (candidates.length === 0) break; // No more improvement possible

    // Add small portion to best candidate
    // let best = diff > 0
    //   ? candidates.reduce((a, b) => a.fat < b.fat ? b : a) // fattest meat
    //   : candidates.reduce((a, b) => a.fat > b.fat ? b : a); // leanest meat
    let best = candidates.reduce((a, b) => a.portion < b.portion ? a : b); // aim for equal distribution of meats

    let add = Math.max( 1, Math.round( Math.min(remaining, totalWeight * 0.001))); // add up to 0.1% each step
    portions[best.idx] += add;
    remaining -= add;
  }

  // Final achieved fat
  let achievedFat = 100 * portions.reduce((sum, p, i) => sum + (p * activeMeats[i].fat / 100), 0) / (totalWeight-remaining);

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
  visalizeMeatPortions(portions, activeMeats);

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