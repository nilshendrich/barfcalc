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

  const avgFat = activeMeats.reduce((sum, m) => sum + m.fat, 0) / activeMeats.length;
  const portion = totalWeight / activeMeats.length;

  resultDiv.innerHTML = `
    <p>${translations.resultText?.targetFat || "Target fat"}: ${targetFat}%</p>
    <p>${translations.resultText?.avgFat || "Estimated average fat"}: ${avgFat.toFixed(2)}%</p>
  `;

  resultTable.innerHTML = "";
  activeMeats.forEach(meat => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${meat.name}</td>
      <td>${meat.fat}%</td>
      <td>${portion.toFixed(1)} g</td>
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