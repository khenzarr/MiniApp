import { sdk } from 'https://esm.sh/@farcaster/frame-sdk';
sdk.actions.ready();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Canvas boyutunu ayarla
const GRID_SIZE = 20;
const CELL_SIZE = 16;
const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;

canvas.width = GRID_WIDTH * CELL_SIZE;
canvas.height = GRID_HEIGHT * CELL_SIZE;

// Kripto coin simgeleri
const COINS = ['$BTC', '$ETH', '$SOL', '$LTC'];
let currentCoin = COINS[0];

// Oyun durumu
let snake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 15, y: 15 };
let score = 0;
let gameRunning = true;

// Rastgele coin seç
function getRandomCoin() {
    return COINS[Math.floor(Math.random() * COINS.length)];
}

// Rastgele yemek pozisyonu
function generateFood() {
    food = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT)
    };
    currentCoin = getRandomCoin();
    
    // Yılanın üzerinde olmamalı
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

// Yön kontrolü
function changeDirection(newDir) {
    // Ters yöne gitmeyi engelle
    if (newDir.x === -direction.x && newDir.y === -direction.y) {
        return;
    }
    nextDirection = newDir;
}

// Klavye kontrolleri
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
            e.preventDefault();
            changeDirection({ x: 0, y: -1 });
            break;
        case 'ArrowDown':
            e.preventDefault();
            changeDirection({ x: 0, y: 1 });
            break;
        case 'ArrowLeft':
            e.preventDefault();
            changeDirection({ x: -1, y: 0 });
            break;
        case 'ArrowRight':
            e.preventDefault();
            changeDirection({ x: 1, y: 0 });
            break;
    }
});

// Buton kontrolleri
document.getElementById('btnUp').addEventListener('click', () => changeDirection({ x: 0, y: -1 }));
document.getElementById('btnDown').addEventListener('click', () => changeDirection({ x: 0, y: 1 }));
document.getElementById('btnLeft').addEventListener('click', () => changeDirection({ x: -1, y: 0 }));
document.getElementById('btnRight').addEventListener('click', () => changeDirection({ x: 1, y: 0 }));

// Touch kontrolleri
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Yatay kaydırma
        if (diffX > 0) {
            changeDirection({ x: -1, y: 0 }); // Sol
        } else {
            changeDirection({ x: 1, y: 0 }); // Sağ
        }
    } else {
        // Dikey kaydırma
        if (diffY > 0) {
            changeDirection({ x: 0, y: -1 }); // Yukarı
        } else {
            changeDirection({ x: 0, y: 1 }); // Aşağı
        }
    }
    
    touchStartX = 0;
    touchStartY = 0;
});

// Çizim fonksiyonları
function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function drawSnake() {
    ctx.fillStyle = '#fff';
    snake.forEach((segment, index) => {
        drawCell(segment.x, segment.y, '#fff');
        
        // Gözler (baş için)
        if (index === 0) {
            ctx.fillStyle = '#000';
            const eyeSize = 2;
            const eyeOffset = 4;
            if (direction.x === 1) { // Sağ
                ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeSize - 2, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeSize - 2, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (direction.x === -1) { // Sol
                ctx.fillRect(segment.x * CELL_SIZE + 2, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * CELL_SIZE + 2, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (direction.y === -1) { // Yukarı
                ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + 2, eyeSize, eyeSize);
                ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + 2, eyeSize, eyeSize);
            } else if (direction.y === 1) { // Aşağı
                ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + CELL_SIZE - eyeSize - 2, eyeSize, eyeSize);
                ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + CELL_SIZE - eyeSize - 2, eyeSize, eyeSize);
            }
            ctx.fillStyle = '#fff';
        }
    });
}

function drawFood() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    
    // Coin sembolünü yaz
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentCoin, food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + CELL_SIZE / 2);
}

function draw() {
    // Ekranı temizle
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Yılanı çiz
    drawSnake();
    
    // Yemeği çiz
    drawFood();
}

// Oyun güncelleme
function update() {
    if (!gameRunning) return;
    
    direction = nextDirection;
    
    // Yeni baş pozisyonu
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };
    
    // Duvar geçişi (sonsuz oyun)
    if (head.x < 0) head.x = GRID_WIDTH - 1;
    if (head.x >= GRID_WIDTH) head.x = 0;
    if (head.y < 0) head.y = GRID_HEIGHT - 1;
    if (head.y >= GRID_HEIGHT) head.y = 0;
    
    snake.unshift(head);
    
    // Yemek yendi mi?
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
    
    // Kendine çarpma kontrolü (sonsuz oyun için devre dışı)
    // Oyun sonsuz olduğu için çarpma kontrolü yok
}

// Oyun döngüsü
function gameLoop() {
    update();
    draw();
}

// İlk yemeği oluştur
generateFood();

// Oyunu başlat
setInterval(gameLoop, 150);

// İlk çizim
draw();

