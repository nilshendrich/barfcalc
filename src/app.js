let meats = JSON.parse(localStorage.getItem('meats')) || [];
const meatList = document.getElementById('meatList');

// Load default values from config.json on first load
window.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('meats') || meats.length === 0) {
        try {
            const response = await fetch('config.json');
            const data = await response.json();
            meats = data.defaultMeats;
            localStorage.setItem('meats', JSON.stringify(meats));
        } catch (err) {
            console.error('Error loading configuration file:', err);
        }
    }
    renderMeats();
});

function renderMeats() {
    meatList.innerHTML = '';
    meats.forEach((meat, index) => {
        const div = document.createElement('div');
        div.className = 'input-group';
        div.innerHTML = `
            <label>
                <input type="checkbox" ${meat.active !== false ? 'checked' : ''} 
                    onchange="toggleMeat(${index}, this.checked)">
                <input type="text" value="${meat.name}" 
                    onchange="updateMeat(${index}, 'name', this.value)" 
                    placeholder="Meat name">
            </label>
            <label>
                Fat content (%): 
                <input type="number" value="${meat.fat}" step="0.1" min="0" max="100" 
                    onchange="updateMeat(${index}, 'fat', this.value)">
            </label>
            <button onclick="removeMeat(${index})">❌ Remove</button>
        `;
        meatList.appendChild(div);
    });
    localStorage.setItem('meats', JSON.stringify(meats));
}

function addMeat() {
    meats.push({ name: '', fat: 0, active: true });
    renderMeats();
}

function updateMeat(index, field, value) {
    meats[index][field] = field === 'fat' ? parseFloat(value) : value;
    localStorage.setItem('meats', JSON.stringify(meats));
}

function toggleMeat(index, checked) {
    meats[index].active = checked;
    localStorage.setItem('meats', JSON.stringify(meats));
}

function removeMeat(index) {
    meats.splice(index, 1);
    renderMeats();
}

function calculate() {
    const totalWeight = parseFloat(document.getElementById('totalWeight').value);
    const targetFat = parseFloat(document.getElementById('targetFat').value);
    const activeMeats = meats.filter(m => m.active);

    if (!totalWeight || !targetFat || activeMeats.length < 2) {
        alert('Please enter total weight, target fat, and at least 2 active meat types.');
        return;
    }

    // Simplified calculation for multiple meat types: equal distribution approximation
    const avgFat = activeMeats.reduce((sum, m) => sum + m.fat, 0) / activeMeats.length;
    const resultHTML = `<table>
      <tr><th>Meat</th><th>Fat (%)</th><th>Amount (g)</th></tr>
      ${activeMeats.map(m => `<tr><td>${m.name}</td><td>${m.fat}</td><td>${(totalWeight / activeMeats.length).toFixed(1)}</td></tr>`).join('')}
    </table>
    <p>Target fat: ${targetFat}%. Estimated average fat: ${avgFat.toFixed(1)}%</p>`;

    document.getElementById('result').innerHTML = resultHTML;
}