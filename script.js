let score = 0;
let misses = 0;
let level = 1;
let gameRunning = true;
let paused = false; 
let keyLeft = false;
let keyRight = false;
const binSpeed = 600; 
let waterHeight = 0;
const waterLowerAmount = 15; 
const waterRiseAmount = 15; 
const maxWaterHeight = 360; 
let trashCollectedCount = 0; 
const trashToLowerWater = 5;
const bombWaterRiseAmount = 60;
let trashTypes = [
    { emoji: '🥤', type: 'plastic', name: 'Botol Plastik', isTrash: true },
    { emoji: '📄', type: 'paper', name: 'Kertas', isTrash: true },
    { emoji: '🍌', type: 'organic', name: 'Kulit Pisang', isTrash: true },
    { emoji: '🥫', type: 'metal', name: 'Kaleng', isTrash: true },
    { emoji: '🍎', type: 'organic', name: 'Sisa Buah', isTrash: true },
    { emoji: '📰', type: 'paper', name: 'Koran', isTrash: true },
    { emoji: '🧴', type: 'plastic', name: 'Botol Shampo', isTrash: true },
    { emoji: '⚙️', type: 'metal', name: 'Logam', isTrash: true },
    { emoji: '💩', type: 'fertilizer', name: 'Pupuk', isTrash: false }, // <-- KOMMA SUDAH DITAMBAHKAN
    { emoji: '💣', type: 'bomb', name: 'BOM', isTrash: false, isBomb: true }
];

let binPosition = 50; // percentage from left
let binBaseY = 0;
const catchSound = document.getElementById('catchSound');
const waterRiseSound = document.getElementById('waterRiseSound'); 
const gameOverSound = document.getElementById('gameOverSound');

function createFallingItem() {
    if (!gameRunning || paused) return; 

    const gameArea = document.getElementById('gameArea');
    
    let itemData;
    const bombChance = 0.05; // 5% kemungkinan muncul bom

    if (Math.random() < bombChance) {
        // Pilih item BOM
        itemData = trashTypes.find(item => item.isBomb); 
        // Fallback jika tidak ditemukan
        if (!itemData) {
            itemData = trashTypes[Math.floor(Math.random() * trashTypes.length)];
        }
    } else {
        // Pilih item sampah/pupuk secara acak (filter BOM)
        const nonBombItems = trashTypes.filter(item => !item.isBomb);
        const randomIndex = Math.floor(Math.random() * nonBombItems.length);
        itemData = nonBombItems[randomIndex];
    }
    
    const item = document.createElement('div');
    item.className = `trash-item ${itemData.type}`;
    item.innerHTML = itemData.emoji;
    item.title = itemData.name;
    
    if (itemData.isBomb) { 
        item.dataset.isBomb = true;
    }
    item.dataset.isTrash = itemData.isTrash; 

    const randomX = Math.random() * (window.innerWidth - 80) + 40;
    item.style.left = randomX + 'px';
    item.style.top = '-50px';

    const fallDuration = 3;
    item.style.animationDuration = fallDuration + 's';

    gameArea.appendChild(item);

    const checkCollision = setInterval(() => {
        if (paused) return; 

        if (!item.parentNode) {
            clearInterval(checkCollision);
            return;
        }
        
        const itemRect = item.getBoundingClientRect();
        const binRect = document.getElementById('trashBin').getBoundingClientRect();

        if (itemRect.bottom >= binRect.top && 
            itemRect.left < binRect.right && 
            itemRect.right > binRect.left &&
            itemRect.top < binRect.bottom) {

            if (itemData.isTrash) {
                scoreTrash(); 
                createStarEffect(itemRect.left + itemRect.width/2, itemRect.top + itemRect.height/2);
                if (catchSound) {
                    catchSound.currentTime = 0;
                    catchSound.play().catch(()=>{});
                }
            } 
            else if (itemData.isBomb) {
                bombExplosion(); 
            }
            else {
                // Item non-sampah (Pupuk) - tidak terjadi apa-apa
            }

            item.remove();
            clearInterval(checkCollision);
            return;
        }

        if (itemRect.top > window.innerHeight) {
            if (itemData.isTrash) {
                missTrash();
            }
            item.remove();
            clearInterval(checkCollision);
        }
    }, 50);
}

function moveBin(e) {
    if (!gameRunning || paused) return; 

    const gameArea = document.getElementById('gameArea');
    const bin = document.getElementById('trashBin');
    const rect = gameArea.getBoundingClientRect();

    let mouseX = e.clientX - rect.left;

    const binWidth = 100;
    mouseX = Math.max(binWidth/2, Math.min(mouseX, rect.width - binWidth/2));

    binPosition = (mouseX / rect.width) * 100;
    bin.style.left = binPosition + '%';
}

document.addEventListener('mousemove', moveBin);
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    moveBin(touch);
});

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") keyLeft = true;
    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") keyRight = true;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") keyLeft = false;
    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") keyRight = false;
});


document.getElementById('restartBtn').addEventListener('click', restartGame);

/* ===================== PAUSE SYSTEM ====================== */

document.getElementById("pauseBtn").addEventListener("click", togglePause);
document.getElementById("resumeBtn").addEventListener("click", togglePause);

document.getElementById("restartBtnPause").addEventListener("click", () => {
    togglePause();
    restartGame();
});

function togglePause() {
    paused = !paused;

    const pauseMenu = document.getElementById("pauseMenu");

    if (paused) {
        gameRunning = false;
        pauseMenu.style.display = "flex";
    } else {
        gameRunning = true;
        pauseMenu.style.display = "none";
        startGame();
    }
}

/* ========================================================= */

function updateBackground(currentLevel) {
    const body = document.body;
    
    const levelIndex = Math.floor((currentLevel - 1) / 6); 
    
    const timeCycle = levelIndex % 3; 

    let newBackgroundUrl = '';

    switch (timeCycle) {
        case 0: 
            newBackgroundUrl = 'cityscene.jpg';
            break;
        case 1: 
            newBackgroundUrl = 'sunsetview.jpg';
            break;
        case 2: 
            newBackgroundUrl = 'nightview.jpg';
            break;
        default:
            newBackgroundUrl = 'cityscene.jpg';
    }

    const currentStyle = body.style.backgroundImage;
    if (!currentStyle.includes(newBackgroundUrl)) {
        body.style.backgroundImage = `url("${newBackgroundUrl}")`;
    }
}

/* ========================================================= */

function scoreTrash() {
    score += 10 * level;
    updateDisplay();

   trashCollectedCount++;

   if (trashCollectedCount > 0 && trashCollectedCount % trashToLowerWater === 0) {
        lowerWaterLevel();
    }

    if (score > 0 && score % 50 === 0) {
        level++;
        updateDisplay();
	  updateBackground(level);

    }
}

function missTrash() {
    misses++;
    waterHeight += waterRiseAmount; 

    const waterLevel = document.getElementById('waterLevel');
    const trashBin = document.getElementById('trashBin');
    
    waterLevel.style.height = waterHeight + 'px';

    if (waterRiseSound) {
        waterRiseSound.currentTime = 0;
        waterRiseSound.play().catch(() => {});

        const floatOffset = (waterHeight / maxWaterHeight) * maxWaterHeight;
        trashBin.style.bottom = floatOffset + 'px';
    }

    updateDisplay();

    if (waterHeight >= maxWaterHeight) { 
        gameOver();
    }
}

function lowerWaterLevel(amount = waterLowerAmount) {
    waterHeight = Math.max(0, waterHeight - amount);

    const waterLevel = document.getElementById('waterLevel');
    const trashBin = document.getElementById('trashBin');
    
    waterLevel.style.height = waterHeight + 'px';
    
    const floatOffset = (waterHeight / maxWaterHeight) * maxWaterHeight;
    trashBin.style.bottom = floatOffset + 'px';

    // Jika Anda ingin menambahkan efek pohon bersinar di sini, 
    // Anda harus menambahkan fungsi triggerTreeShine()
    // dan elemen HTML-nya.
}

// === FUNGSI BOM BARU: TELAH DITAMBAHKAN DENGAN LENGKAP ===
function bombExplosion() {
    // Kenaikan air yang drastis akibat bom
    waterHeight = Math.min(maxWaterHeight, waterHeight + bombWaterRiseAmount);

    const waterLevel = document.getElementById('waterLevel');
    const trashBin = document.getElementById('trashBin');
    
    // Terapkan kenaikan air
    waterLevel.style.height = waterHeight + 'px';

    // Hitung posisi bin baru
    const floatOffset = (waterHeight / maxWaterHeight) * maxWaterHeight;
    trashBin.style.bottom = floatOffset + 'px';
    
    // Panggil efek visual ombak besar dan getaran layar
    triggerBombEffect(); 

    // Mainkan suara banjir
    if (waterRiseSound) {
        waterRiseSound.currentTime = 0;
        waterRiseSound.play().catch(() => {});
    }

    if (waterHeight >= maxWaterHeight) {
        gameOver();
    }
}

function triggerBombEffect() {
    const gameArea = document.getElementById('gameArea');
    const waterWave = document.querySelector('.water-wave');

    // 1. Efek Getaran Layar
    gameArea.classList.add('bomb-shake');
    setTimeout(() => {
        gameArea.classList.remove('bomb-shake');
    }, 500); 

    // 2. Efek Ombak Besar
    if (waterWave) { // Cek agar tidak error jika elemen tidak ditemukan
        waterWave.classList.add('big-wave');
        setTimeout(() => {
            waterWave.classList.remove('big-wave');
        }, 1000); 
    }
}
// ======================================================

function createStarEffect(x, y) {
    const stars = ['⭐', '✨', '🌟', '💫'];

    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const star = document.createElement('div');
            star.className = 'star';
            star.innerHTML = stars[Math.floor(Math.random() * stars.length)];

            const angle = (i * 72) * Math.PI / 180;
            const distance = 100;

            star.style.left = (x + Math.cos(angle) * distance) + 'px';
            star.style.top = (y + Math.sin(angle) * distance) + 'px';

            document.getElementById('gameArea').appendChild(star);

            setTimeout(() => star.remove(), 1000);
        }, i * 100);
    }
}

function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('misses').textContent = misses;
    document.getElementById('level').textContent = level;
}

function gameOver() {
    gameRunning = false;
    paused = false;

    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';

    if (gameOverSound) {
        gameOverSound.currentTime = 0;
        gameOverSound.play().catch(() => {});
    }

    document.querySelectorAll('.trash-item').forEach(trash => trash.remove());
}

function restartGame() {
    gameRunning = true;
    paused = false;

    score = 0;
    misses = 0;
    level = 1;
    waterHeight = 0;
    trashCollectedCount = 0;

    document.getElementById('waterLevel').style.height = '0px';
    document.getElementById('trashBin').style.bottom = '0px';
    document.getElementById('gameOver').style.display = 'none';
    document.querySelectorAll('.trash-item').forEach(trash => trash.remove());
    document.querySelectorAll('.star').forEach(star => star.remove());
  
    updateDisplay();
    startGame();
}

function startGame() {
const gameArea = document.getElementById("gameArea");
const bin = document.getElementById("trashBin");
const rect = gameArea.getBoundingClientRect();

function keyboardMoveLoop() {
    if (!gameRunning || paused) return;

    const binWidth = 100;
    let currentLeft = (binPosition / 100) * rect.width;

    if (keyLeft) currentLeft -= binSpeed * 0.016; // 60 FPS
    if (keyRight) currentLeft += binSpeed * 0.016;

    currentLeft = Math.max(binWidth/2, Math.min(currentLeft, rect.width - binWidth/2));

    binPosition = (currentLeft / rect.width) * 100;
    bin.style.left = binPosition + "%";

    requestAnimationFrame(keyboardMoveLoop);
}

requestAnimationFrame(keyboardMoveLoop);

    const spawnInterval = setInterval(() => {
        if (!gameRunning || paused) { 
            clearInterval(spawnInterval);
            return;
        }
        createFallingItem();
    }, 1200);
}

document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" || e.key.toLowerCase() === "p") {
        togglePause();
    }
});

updateDisplay();
startGame();