const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 캔버스 해상도 설정
canvas.width = 800;
canvas.height = 600;

// ==========================================
// 1. UI 및 타이머 설정
// ==========================================
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');

let score = 0;
let survivalTime = 0;

// 1초마다 생존 시간을 1씩 올리고 화면에 표시
setInterval(() => {
    survivalTime++;
    const minutes = String(Math.floor(survivalTime / 60)).padStart(2, '0');
    const seconds = String(survivalTime % 60).padStart(2, '0');
    timerElement.innerText = `${minutes}:${seconds}`;
}, 1000);

// 점수를 올리는 함수 (적 처치 시 사용할 예정)
function addScore(points) {
    score += points;
    scoreElement.innerText = `점수: ${score}`;
}

// ==========================================
// 2. 주인공(Player) 설정
// ==========================================
const player = {
    x: canvas.width / 2, // 정중앙에서 시작
    y: canvas.height / 2,
    radius: 15,          // 캐릭터 크기
    color: '#4da6ff',    // 파란색
    speed: 5,            // 이동 속도
    dx: 0,
    dy: 0
};

// ==========================================
// 3. 적(Enemy) 클래스 및 스폰 설정
// ==========================================
const enemies = [];

class Enemy {
    constructor(x, y, radius, color, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
    }

    // 플레이어를 향해 다가오는 로직
    update() {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
    }

    // 화면에 적 그리기
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

// 1초마다 화면 밖에서 적을 생성하는 함수
function spawnEnemies() {
    setInterval(() => {
        const radius = 15;
        let x, y;

        // 화면 밖 랜덤한 위치 계산
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = 'red';
        const speed = 1.5;

        enemies.push(new Enemy(x, y, radius, color, speed));
    }, 1000);
}

// ==========================================
// 4. 키보드 조작 이벤트
// ==========================================
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w') player.dy = -player.speed;
    if (e.key === 'ArrowDown' || e.key === 's') player.dy = player.speed;
    if (e.key === 'ArrowLeft' || e.key === 'a') player.dx = -player.speed;
    if (e.key === 'ArrowRight' || e.key === 'd') player.dx = player.speed;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w') player.dy = 0;
    if (e.key === 'ArrowDown' || e.key === 's') player.dy = 0;
    if (e.key === 'ArrowLeft' || e.key === 'a') player.dx = 0;
    if (e.key === 'ArrowRight' || e.key === 'd') player.dx = 0;
});

// ==========================================
// 5. 메인 게임 루프 (초당 60프레임 실행)
// ==========================================
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 플레이어 이동 로직
    player.x += player.dx;
    player.y += player.dy;

    // 맵 밖으로 나가지 못하게 막기
    if (player.x < player.radius) player.x = player.radius;
    if (player.x > canvas.width - player.radius) player.x = canvas.width - player.radius;
    if (player.y < player.radius) player.y = player.radius;
    if (player.y > canvas.height - player.radius) player.y = canvas.height - player.radius;

    // 주인공 그리기
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();

    // 적 이동 및 그리기
    enemies.forEach((enemy) => {
        enemy.update();
        enemy.draw();
    });

    requestAnimationFrame(gameLoop);
}

// ==========================================
// 6. 게임 최초 실행
// ==========================================
spawnEnemies(); // 적 생성기 가동
gameLoop();     // 게임 화면 렌더링 시작