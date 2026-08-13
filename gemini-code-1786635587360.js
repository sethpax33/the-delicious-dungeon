// Game State & Save Variables
let activeSaveSlot = null;
let playerName = "Senshi";
let hp = 100;
let hunger = 100;
let currentActiveFloor = 1;
let maxUnlockedFloor = 1;
let gold = 0;
let armor = 0;
let inventory = {};
let cookedMeals = [];
let pot = [];
let draggedDropName = null;

// Recipe Filter Setting (1, 2, 3, 4, or 5 Items)
let activeRecipeFilter = 1;
let currentlyInspectedIngredient = null;

// 50 Monsters & Drops
const monsterDB = [
  // Floor 1
  { floor: 1, name: "Walking Mushroom", icon: "🍄", drop: "Mushroom", hp: 8, hunger: 15, val: 10 },
  { floor: 1, name: "Giant Bat", icon: "🦇", drop: "Bat Wing", hp: 12, hunger: 18, val: 14 },
  { floor: 1, name: "Cave Snail", icon: "🐌", drop: "Snail Meat", hp: 10, hunger: 16, val: 12 },
  { floor: 1, name: "Dungeon Beetle", icon: "🪲", drop: "Beetle Shell", hp: 14, hunger: 12, val: 15 },
  { floor: 1, name: "Mud Frog", icon: "🐸", drop: "Frog Leg", hp: 11, hunger: 20, val: 13 },

  // Floor 2
  { floor: 2, name: "Living Armor", icon: "🦴", drop: "Marrow", hp: 18, hunger: 22, val: 24 },
  { floor: 2, name: "Man-Eater Plant", icon: "🌱", drop: "Vine Fruit", hp: 16, hunger: 25, val: 20 },
  { floor: 2, name: "Giant Scorpion", icon: "🦂", drop: "Scorpion Tail", hp: 20, hunger: 20, val: 26 },
  { floor: 2, name: "Cave Crab", icon: "🦀", drop: "Crab Claw", hp: 22, hunger: 28, val: 30 },
  { floor: 2, name: "Grave Worm", icon: "🪱", drop: "Worm Meat", hp: 15, hunger: 30, val: 18 },

  // Floor 3
  { floor: 3, name: "Basilisk", icon: "🥚", drop: "Basilisk Egg", hp: 25, hunger: 32, val: 38 },
  { floor: 3, name: "Mimic", icon: "📦", drop: "Mimic Tongue", hp: 28, hunger: 30, val: 45 },
  { floor: 3, name: "Giant Viper", icon: "🐍", drop: "Viper Flesh", hp: 24, hunger: 28, val: 36 },
  { floor: 3, name: "Cave Spider", icon: "🕷️", drop: "Spider Sac", hp: 22, hunger: 26, val: 34 },
  { floor: 3, name: "Harpy", icon: "🦅", drop: "Harpy Meat", hp: 30, hunger: 35, val: 48 },

  // Floor 4
  { floor: 4, name: "Kraken Tentacle", icon: "🦑", drop: "Tentacle", hp: 35, hunger: 42, val: 65 },
  { floor: 4, name: "Gazer", icon: "👁️", drop: "Gazer Eyeball", hp: 32, hunger: 38, val: 60 },
  { floor: 4, name: "Treant", icon: "🪵", drop: "Treant Bark", hp: 30, hunger: 45, val: 55 },
  { floor: 4, name: "Cockatrice", icon: "🐓", drop: "Cockatrice Tail", hp: 38, hunger: 40, val: 72 },
  { floor: 4, name: "Rock Golem", icon: "🧱", drop: "Core Powder", hp: 28, hunger: 50, val: 58 },

  // Floor 5
  { floor: 5, name: "Minotaur", icon: "🐂", drop: "Minotaur Steak", hp: 48, hunger: 55, val: 95 },
  { floor: 5, name: "Slime Core", icon: "🦠", drop: "Slime Jelly", hp: 25, hunger: 60, val: 50 },
  { floor: 5, name: "Shadow Hound", icon: "🐕", drop: "Hound Flank", hp: 42, hunger: 48, val: 85 },
  { floor: 5, name: "Cave Troll", icon: "🧌", drop: "Troll Liver", hp: 52, hunger: 50, val: 105 },
  { floor: 5, name: "Gargoyle", icon: "🗿", drop: "Gargoyle Heart", hp: 45, hunger: 45, val: 90 },

  // Floor 6
  { floor: 6, name: "Wyvern", icon: "🐉", drop: "Wyvern Tail", hp: 58, hunger: 62, val: 130 },
  { floor: 6, name: "Manticore", icon: "🦁", drop: "Manticore Rib", hp: 62, hunger: 65, val: 145 },
  { floor: 6, name: "Deep Hydra", icon: "🐍", drop: "Hydra Meat", hp: 65, hunger: 70, val: 160 },
  { floor: 6, name: "Charybdis Fish", icon: "🐟", drop: "Abyssal Scale", hp: 50, hunger: 75, val: 120 },
  { floor: 6, name: "Banshee", icon: "👻", drop: "Ethereal Dust", hp: 40, hunger: 80, val: 110 },

  // Floor 7
  { floor: 7, name: "Behemoth", icon: "🦣", drop: "Behemoth Horn", hp: 72, hunger: 78, val: 190 },
  { floor: 7, name: "Chimera", icon: "🐺", drop: "Chimera Heart", hp: 75, hunger: 75, val: 200 },
  { floor: 7, name: "Hellhound", icon: "🔥", drop: "Flame Tongue", hp: 68, hunger: 72, val: 180 },
  { floor: 7, name: "Storm Drake", icon: "⚡", drop: "Drake Talon", hp: 78, hunger: 80, val: 220 },
  { floor: 7, name: "Iron Golem", icon: "🛡️", drop: "Iron Marrow", hp: 60, hunger: 85, val: 170 },

  // Floor 8
  { floor: 8, name: "Arch Demon", icon: "👿", drop: "Demon Tail", hp: 82, hunger: 85, val: 260 },
  { floor: 8, name: "Frost Worm", icon: "❄️", drop: "Ice Meat", hp: 80, hunger: 88, val: 250 },
  { floor: 8, name: "Phoenix", icon: "🐦", drop: "Phoenix Wing", hp: 90, hunger: 90, val: 300 },
  { floor: 8, name: "Kraken Lord", icon: "🦑", drop: "Lord Eye", hp: 85, hunger: 92, val: 280 },
  { floor: 8, name: "Dread Knight", icon: "⚔️", drop: "Soul Essence", hp: 75, hunger: 95, val: 240 },

  // Floor 9
  { floor: 9, name: "Ancient Wyrm", icon: "🐲", drop: "Wyrm Scale Meat", hp: 95, hunger: 95, val: 350 },
  { floor: 9, name: "Titan", icon: "🗿", drop: "Titan Tendon", hp: 92, hunger: 98, val: 330 },
  { floor: 9, name: "Void Walker", icon: "🌌", drop: "Void Essence", hp: 88, hunger: 100, val: 310 },
  { floor: 9, name: "Obsidian Golem", icon: "⬛", drop: "Obsidian Shard", hp: 85, hunger: 90, val: 300 },
  { floor: 9, name: "Lich", icon: "🧙‍♂️", drop: "Lich Bone Powder", hp: 90, hunger: 92, val: 340 },

  // Floor 10
  { floor: 10, name: "Red Dragon", icon: "🐲", drop: "Red Dragon Meat", hp: 100, hunger: 100, val: 450 },
  { floor: 10, name: "Dungeon Master", icon: "👑", drop: "Master Crown Fruit", hp: 100, hunger: 100, val: 500 },
  { floor: 10, name: "Leviathan", icon: "🌊", drop: "Leviathan Fin", hp: 100, hunger: 100, val: 480 },
  { floor: 10, name: "Golden Sphinx", icon: "🦁", drop: "Sphinx Meat", hp: 100, hunger: 100, val: 460 },
  { floor: 10, name: "Beelzebub", icon: "🪰", drop: "Demon Honey", hp: 100, hunger: 100, val: 470 }
];

let floorQuests = {
  1: { dishName: "Sautéed Mushroom", reqCount: 2, currentCount: 0 },
  2: { dishName: "Marrow", reqCount: 2, currentCount: 0 },
  3: { dishName: "Basilisk Egg", reqCount: 2, currentCount: 0 },
  4: { dishName: "Tentacle", reqCount: 2, currentCount: 0 },
  5: { dishName: "Minotaur Steak", reqCount: 3, currentCount: 0 },
  6: { dishName: "Wyvern Tail", reqCount: 3, currentCount: 0 },
  7: { dishName: "Behemoth Horn", reqCount: 3, currentCount: 0 },
  8: { dishName: "Phoenix Wing", reqCount: 3, currentCount: 0 },
  9: { dishName: "Wyrm Scale Meat", reqCount: 3, currentCount: 0 },
  10: { dishName: "Red Dragon Meat", reqCount: 4, currentCount: 0 }
};

const armorItems = [
  { name: "Padded Leather", cost: 35, def: 3, reqItem: "Beetle Shell" },
  { name: "Chainmail Vest", cost: 80, def: 7, reqItem: "Marrow" },
  { name: "Iron Plate", cost: 180, def: 13, reqItem: "Crab Claw" },
  { name: "Knight Shield", cost: 320, def: 20, reqItem: "Mimic Tongue" },
  { name: "Mithril Cuirass", cost: 500, def: 28, reqItem: "Core Powder" },
  { name: "Adamantite Plate", cost: 750, def: 38, reqItem: "Gargoyle Heart" },
  { name: "Dragon Scale Mail", cost: 1100, def: 50, reqItem: "Abyssal Scale" },
  { name: "Titan Guard Shield", cost: 1600, def: 65, reqItem: "Iron Marrow" },
  { name: "Aegis Armor", cost: 2300, def: 80, reqItem: "Soul Essence" },
  { name: "God-Slayer Plate", cost: 3200, def: 100, reqItem: "Obsidian Shard" }
];

// Initialize Inventory Count
monsterDB.forEach(m => inventory[m.drop] = 0);

// --- SAVE SYSTEM (MAX 5 FILES) ---
function renderSaveSlots() {
  const container = document.getElementById('save-slots-container');
  container.innerHTML = '';

  for (let i = 1; i <= 5; i++) {
    const rawData = localStorage.getItem(`dungeon_meshi_save_${i}`);
    if (rawData) {
      const data = JSON.parse(rawData);
      container.innerHTML += `
        <div class="save-slot-card" onclick="loadSaveSlot(${i})">
          <div class="save-slot-info">
            <div class="save-slot-title">Slot ${i}: ${data.playerName}'s Party</div>
            <div>Floor Unlocked: ${data.maxUnlockedFloor}/10 | Gold: ${data.gold}🪙</div>
          </div>
          <button class="btn-sm btn-clear" onclick="deleteSaveSlot(event, ${i})">Delete</button>
        </div>
      `;
    } else {
      container.innerHTML += `
        <div class="save-slot-card" onclick="promptNewSave(${i})">
          <div class="save-slot-info">
            <div class="save-slot-title" style="color:#aaa;">Slot ${i}: [ Empty Save File ]</div>
            <div>Click to create a new adventure!</div>
          </div>
          <button class="btn-sm btn-cook">+ New Game</button>
        </div>
      `;
    }
  }
}

function promptNewSave(slot) {
  activeSaveSlot = slot;
  document.getElementById('name-input-box').style.display = 'block';
  document.getElementById('player-name-input').focus();
}

function cancelNameInput() {
  document.getElementById('name-input-box').style.display = 'none';
  document.getElementById('player-name-input').value = '';
}

function confirmNewSave() {
  const nameInput = document.getElementById('player-name-input').value.trim();
  playerName = nameInput.length > 0 ? nameInput : `Chef Senshi`;

  // Reset Stats
  hp = 100; hunger = 100; gold = 0; armor = 0;
  currentActiveFloor = 1; maxUnlockedFloor = 1;
  monsterDB.forEach(m => inventory[m.drop] = 0);
  cookedMeals = []; pot = [];

  saveGameData();
  cancelNameInput();
  launchGameScreen();
}

function loadSaveSlot(slot) {
  const rawData = localStorage.getItem(`dungeon_meshi_save_${slot}`);
  if (rawData) {
    activeSaveSlot = slot;
    const data = JSON.parse(rawData);
    playerName = data.playerName || "Chef";
    hp = data.hp; hunger = data.hunger; gold = data.gold; armor = data.armor;
    currentActiveFloor = data.currentActiveFloor;
    maxUnlockedFloor = data.maxUnlockedFloor;
    inventory = data.inventory;
    cookedMeals = data.cookedMeals || [];
    floorQuests = data.floorQuests || floorQuests;
    
    launchGameScreen();
  }
}

function deleteSaveSlot(event, slot) {
  event.stopPropagation();
  localStorage.removeItem(`dungeon_meshi_save_${slot}`);
  renderSaveSlots();
}

function saveGameData() {
  if (!activeSaveSlot) return;
  const data = {
    playerName, hp, hunger, gold, armor,
    currentActiveFloor, maxUnlockedFloor,
    inventory, cookedMeals, floorQuests
  };
  localStorage.setItem(`dungeon_meshi_save_${activeSaveSlot}`, JSON.stringify(data));
}

function launchGameScreen() {
  document.getElementById('main-menu-overlay').style.display = 'none';
  document.getElementById('main-wrapper').style.display = 'block';

  // Dynamic Pot and Name Display Updates
  document.getElementById('player-display-name').innerText = playerName;
  document.getElementById('pot-title-name').innerText = `${playerName}`;

  addLog(`Welcome to the Dungeon, <b>${playerName}</b>! Your pot is hot and ready.`, "log-gold");
  updateUI();
}

function openMainMenu() {
  saveGameData();
  document.getElementById('main-wrapper').style.display = 'none';
  document.getElementById('main-menu-overlay').style.display = 'flex';
  renderSaveSlots();
}

// --- DYNAMIC 500+ RECIPE COMPOSER ---
const culinaryStyles2 = ["Fricassee", "Tartare", "Confit", "Goulash", "Bisque", "Gratin", "Braise", "Fondue", "Glaze", "Ragout"];
const culinaryStyles3 = ["Pot Pie", "Chowder", "Dumpling Medley", "Savory Stew", "Roast Platter", "Curry", "Stir-Fry", "Bouillabaisse"];
const culinaryStyles4 = ["Abyssal Paella", "Royal Casserole", "Dungeon Feast", "Grand Roast", "Warlock Consommé"];

function generateRecipeName(items) {
  const sorted = [...items].sort();
  const count = items.length;
  const unique = [...new Set(sorted)];

  if (count === 1) return `Sautéed ${items[0]}`;
  if (unique.length === 1) return `Rich ${items[0]} Reduction (x${count})`;

  if (count === 2) {
    const styleIdx = (sorted[0].length + sorted[1].length) % culinaryStyles2.length;
    return `${sorted[0]} & ${sorted[1]} ${culinaryStyles2[styleIdx]}`;
  }

  if (count === 3) {
    const styleIdx = (sorted[0].length + sorted[2].length) % culinaryStyles3.length;
    return `${sorted[0]}-Infused ${sorted[1]} & ${sorted[2]} ${culinaryStyles3[styleIdx]}`;
  }

  if (count === 4) {
    const styleIdx = (sorted[0].length + sorted[3].length) % culinaryStyles4.length;
    return `${sorted[0]} & ${sorted[1]} ${culinaryStyles4[styleIdx]} w/ ${sorted[2]}`;
  }

  if (count === 5) {
    return `${playerName}'s Grand 5-Star Banquet of ${sorted[0]} & ${sorted[1]}`;
  }

  return `Dungeon Medley of ${items.join(', ')}`;
}

// --- RECIPE FINDER & FILTER BUTTONS ---
function setRecipeFilter(count) {
  activeRecipeFilter = count;
  for (let i = 1; i <= 5; i++) {
    document.getElementById(`filter-btn-${i}`).classList.toggle('active', i === count);
  }
  if (currentlyInspectedIngredient) {
    inspectRecipeIngredient(currentlyInspectedIngredient);
  }
}

function inspectRecipeIngredient(dropName) {
  currentlyInspectedIngredient = dropName;
  const mTarget = monsterDB.find(x => x.drop === dropName);
  document.getElementById('recipe-inspector-header').innerText = `Recipes with ${mTarget.icon} ${dropName} (${activeRecipeFilter}-Item Category):`;
  
  const resultsBox = document.getElementById('recipe-results-list');
  resultsBox.innerHTML = '';

  const unlockedMonsters = monsterDB.filter(m => m.floor <= maxUnlockedFloor);

  if (activeRecipeFilter === 1) {
    resultsBox.innerHTML += `
      <div class="recipe-card">
        <b>Sautéed ${dropName}</b><br>
        • Ingredients: ${mTarget.icon} ${dropName}<br>
        • Benefits: +${mTarget.hp} HP / +${mTarget.hunger} Fullness
      </div>
    `;
    return;
  }

  // Generate combos for 2, 3, 4, 5 ingredients
  let comboCount = 0;
  const targetCount = activeRecipeFilter - 1;

  function buildCombos(startIndex, currentCombo) {
    if (comboCount >= 8) return; // Limit display to top 8 clean cards
    if (currentCombo.length === targetCount) {
      comboCount++;
      const fullSet = [dropName, ...currentCombo.map(m => m.drop)];
      const dishName = generateRecipeName(fullSet);
      
      let totalHp = mTarget.hp;
      let totalHunger = mTarget.hunger;
      let totalVal = mTarget.val;
      currentCombo.forEach(m => { totalHp += m.hp; totalHunger += m.hunger; totalVal += m.val; });

      const mult = 1.0 + (activeRecipeFilter * 0.25);
      const recipeIcons = fullSet.map(d => monsterDB.find(m => m.drop === d).icon).join(' + ');

      resultsBox.innerHTML += `
        <div class="recipe-card">
          <b>${dishName}</b><br>
          • Ingredients: ${recipeIcons}<br>
          • Benefits: +${Math.floor(totalHp * mult)} HP / +${Math.floor(totalHunger * mult)} Fullness (${Math.floor(totalVal * mult)}🪙)
        </div>
      `;
      return;
    }

    for (let i = startIndex; i < unlockedMonsters.length; i++) {
      buildCombos(i, [...currentCombo, unlockedMonsters[i]]);
    }
  }

  buildCombos(0, []);

  if (comboCount === 0) {
    resultsBox.innerHTML = `<div style="font-size:10px; color:#aaa;">Unlock higher floor monsters to reveal ${activeRecipeFilter}-ingredient combos!</div>`;
  }
}

// Drag & Drop Handlers
function handleDragStart(e, dropName) {
  draggedDropName = dropName;
  e.dataTransfer.setData("text/plain", dropName);
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function handlePotDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');

  if (pot.length >= 5) {
    addLog(`<b>${playerName}'s Pot is full!</b> (Maximum 5 ingredients allowed).`, "log-damage");
    return;
  }

  if (draggedDropName && inventory[draggedDropName] > 0) {
    inventory[draggedDropName]--;
    pot.push(draggedDropName);
    updateUI();
  }
}

function handleRecipeMenuDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (draggedDropName) {
    inspectRecipeIngredient(draggedDropName);
  }
}

function addLog(msg, type = "") {
  const logBox = document.getElementById('log');
  const entry = document.createElement('div');
  if (type) entry.className = type;
  entry.innerHTML = `> ${msg}`;
  logBox.appendChild(entry);
  logBox.scrollTop = logBox.scrollHeight;
}

function updateUI() {
  hp = Math.max(0, Math.min(100, hp));
  hunger = Math.max(0, Math.min(100, hunger));

  document.getElementById('hp-text').innerText = `${hp} / 100`;
  document.getElementById('hunger-text').innerText = `${hunger} / 100`;
  document.getElementById('hp-bar').style.width = `${hp}%`;
  document.getElementById('hunger-bar').style.width = `${hunger}%`;
  
  document.getElementById('gold-val').innerText = gold;
  document.getElementById('armor-val').innerText = armor;
  document.getElementById('pot-count-indicator').innerText = `(${pot.length}/5 Items)`;

  // Render Floor List
  const floorCol = document.getElementById('floor-selector-column');
  floorCol.innerHTML = '';
  for (let f = 1; f <= 10; f++) {
    const q = floorQuests[f];
    const isUnlocked = f <= maxUnlockedFloor;
    const isActive = f === currentActiveFloor;
    const floorMonsters = monsterDB.filter(m => m.floor === f);
    const monsterIcons = floorMonsters.map(m => m.icon).join(' ');

    let questStatusText = !isUnlocked 
      ? `<span style="color:#888;">🔒 Locked</span>` 
      : (q.currentCount >= q.reqCount 
          ? `<span style="color:#55ff55;">✅ Floor Complete</span>` 
          : `<span style="color:#f4c430;">Quest: ${q.currentCount}/${q.reqCount} ${q.dishName}</span>`);

    floorCol.innerHTML += `
      <div class="floor-card ${isActive ? 'active' : ''} ${!isUnlocked ? 'disabled' : ''}" onclick="selectFloor(${f})">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <b>Floor ${f}</b> 
          <span style="font-size:10px;">${questStatusText}</span>
        </div>
        <div class="monster-icons-preview">${monsterIcons}</div>
      </div>
    `;
  }

  // Ingredient Shelf
  const shelf = document.getElementById('ingredient-shelf-display');
  shelf.innerHTML = '';
  let hasItems = false;
  monsterDB.forEach(m => {
    if (inventory[m.drop] > 0) {
      hasItems = true;
      shelf.innerHTML += `
        <div class="ingredient-card" draggable="true" ondragstart="handleDragStart(event, '${m.drop}')">
          <span class="ingredient-icon">${m.icon}</span>
          <div class="ingredient-name">${m.drop}</div>
          <span class="ingredient-count">x${inventory[m.drop]}</span>
        </div>
      `;
    }
  });
  if (!hasItems) shelf.innerHTML = '<span style="font-size:10px; color:#666;">No raw ingredients. Explore to hunt monsters!</span>';

  // Pot Display
  const potDisplay = document.getElementById('pot-display');
  potDisplay.innerHTML = pot.length === 0 ? "Empty" : pot.map(drop => `${monsterDB.find(x => x.drop === drop).icon} ${drop}`).join(' + ');

  // Meals Pantry
  const mealsList = document.getElementById('meals-inventory-list');
  mealsList.innerHTML = cookedMeals.length === 0 ? '<div style="color:#666;">No prepared meals in the pantry.</div>' : '';
  cookedMeals.forEach((meal, idx) => {
    const q = floorQuests[currentActiveFloor];
    const isQuestTarget = meal.name.includes(q.dishName) && q.currentCount < q.reqCount;
    mealsList.innerHTML += `
      <div class="meal-row">
        <div style="display:flex; justify-content:space-between;">
          <b>${meal.name}</b>
          <span style="color:#aaa;">(+${meal.hp}HP / +${meal.hunger}F)</span>
        </div>
        <div style="display:flex; gap:4px; justify-content:flex-end;">
          ${isQuestTarget ? `<button class="btn-sm" style="background:#f4c430; color:#000;" onclick="submitQuestMeal(${idx})">Turn In Quest</button>` : ''}
          <button class="btn-sm btn-cook" onclick="eatMeal(${idx})">Eat</button>
          <button class="btn-sm" onclick="sellMeal(${idx})">Sell (${meal.value}🪙)</button>
        </div>
      </div>
    `;
  });

  // Merchant Shop
  const shopList = document.getElementById('shop-armor-list');
  shopList.innerHTML = '';
  armorItems.forEach((item, idx) => {
    const discountedCost = Math.floor(item.cost * 0.5);
    const hasReqItem = inventory[item.reqItem] > 0;
    const reqIcon = monsterDB.find(m => m.drop === item.reqItem)?.icon || "📦";

    shopList.innerHTML += `
      <div class="shop-item">
        <div style="display:flex; justify-content:space-between;">
          <b>${item.name}</b> <span style="color:#6495ed;">+${item.def} Def</span>
        </div>
        <div style="font-size:9px; color:#aaa;">Discount Trade: ${reqIcon} <b>${item.reqItem}</b> (50% OFF)</div>
        <div style="display:flex; gap:4px; justify-content:flex-end;">
          <button class="btn-sm" onclick="buyArmor(${idx}, false)">Buy (${item.cost}🪙)</button>
          <button class="btn-sm btn-discount" ${!hasReqItem ? 'disabled' : ''} onclick="buyArmor(${idx}, true)">
            Trade (${discountedCost}🪙 + 1x ${item.reqItem})
          </button>
        </div>
      </div>
    `;
  });

  saveGameData();
}

function selectFloor(f) {
  if (f <= maxUnlockedFloor) {
    currentActiveFloor = f;
    addLog(`Switched to <b>Floor ${f}</b>.`, "log-event");
    updateUI();
  }
}

function explore() {
  hunger -= 8;
  const floorMonsters = monsterDB.filter(m => m.floor === currentActiveFloor);
  const m = floorMonsters[Math.floor(Math.random() * floorMonsters.length)];

  const baseDmg = (m.floor * 6) + 3;
  const takenDmg = Math.max(1, baseDmg - armor);

  hp -= takenDmg;
  inventory[m.drop]++;

  addLog(`Fought a <b>${m.name}</b> on Floor ${currentActiveFloor}! Dropped ${m.icon} <b>${m.drop}</b> (Took ${takenDmg} DMG).`, "log-damage");
  updateUI();
}

function clearPot() {
  pot.forEach(drop => inventory[drop]++);
  pot = [];
  updateUI();
}

function cookPot() {
  if (pot.length === 0) return;

  let baseHP = 0, baseHunger = 0, baseVal = 0;
  pot.forEach(drop => {
    const m = monsterDB.find(x => x.drop === drop);
    baseHP += m.hp; baseHunger += m.hunger; baseVal += m.val;
  });

  const dishName = generateRecipeName(pot);
  const multiplier = 1.0 + (pot.length * 0.25);

  const dish = {
    name: dishName,
    hp: Math.floor(baseHP * multiplier),
    hunger: Math.floor(baseHunger * multiplier),
    value: Math.floor(baseVal * multiplier)
  };

  cookedMeals.push(dish);
  addLog(`Cooked <b>${dish.name}</b>! Added to pantry.`, "log-heal");

  pot = [];
  updateUI();
}

function submitQuestMeal(index) {
  const q = floorQuests[currentActiveFloor];
  if (q.currentCount < q.reqCount) {
    q.currentCount++;
    cookedMeals.splice(index, 1);
    addLog(`Submitted 1x dish for Floor ${currentActiveFloor} Quest! (${q.currentCount}/${q.reqCount})`, "log-event");
    
    if (q.currentCount >= q.reqCount && currentActiveFloor === maxUnlockedFloor && maxUnlockedFloor < 10) {
      maxUnlockedFloor++;
      addLog(`🎉 Gatekeeper satisfied! <b>Floor ${maxUnlockedFloor}</b> is now UNLOCKED!`, "log-gold");
    }
    updateUI();
  }
}

function eatMeal(index) {
  const meal = cookedMeals[index];
  hp += meal.hp; hunger += meal.hunger;
  cookedMeals.splice(index, 1);
  addLog(`Ate <b>${meal.name}</b>! (+${meal.hp} HP, +${meal.hunger} Fullness)`, "log-heal");
  updateUI();
}

function sellMeal(index) {
  const meal = cookedMeals[index];
  gold += meal.value;
  cookedMeals.splice(index, 1);
  addLog(`Sold <b>${meal.name}</b> for <b>${meal.value} 🪙 Gold</b>!`, "log-gold");
  updateUI();
}

function buyArmor(index, withTrade) {
  const item = armorItems[index];
  const finalCost = withTrade ? Math.floor(item.cost * 0.5) : item.cost;

  if (withTrade) {
    if (inventory[item.reqItem] > 0 && gold >= finalCost) {
      inventory[item.reqItem]--;
      gold -= finalCost;
      armor += item.def;
      addLog(`Traded 1x <b>${item.reqItem}</b> & paid <b>${finalCost}🪙 Gold</b> for <b>${item.name}</b>!`, "log-gold");
      updateUI();
    } else {
      addLog(`Missing trade item or gold!`, "log-damage");
    }
  } else {
    if (gold >= finalCost) {
      gold -= finalCost;
      armor += item.def;
      addLog(`Bought <b>${item.name}</b> for <b>${finalCost}🪙 Gold</b>! Armor defense is now ${armor}.`, "log-gold");
      updateUI();
    } else {
      addLog(`Not enough gold!`, "log-damage");
    }
  }
}

// Initial Launch
renderSaveSlots();