const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

let isPaused = false;

// ==========================================
// 1. UI 및 타이머, 점수 설정
// ==========================================
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');

let score = 0;
let survivalTime = 0;

setInterval(() => {
    if (isPaused) return; 

    survivalTime++;
    const minutes = String(Math.floor(survivalTime / 60)).padStart(2, '0');
    const seconds = String(survivalTime % 60).padStart(2, '0');
    timerElement.innerText = `${minutes}:${seconds}`;
}, 1000);

function addScore(points) {
    score += points;
    scoreElement.innerText = `점수: ${score}`;
}

// ==========================================
// 2. 주인공(Player) 설정
// ==========================================
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15,
    color: '#4da6ff',
    speed: 5,
    dx: 0,
    dy: 0
};

// ==========================================
// 3. 🌟 총알(Projectile) 클래스 및 자동 발사
// ==========================================
const projectiles = [];

class Projectile {
    constructor(x, y, velocity, radius, color) {
        this.x = x;
        this.y = y;
        this.velocity = velocity; // x, y 이동 속도를 담은 객체
        this.radius = radius;
        this.color = color;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

// 0.5초마다 가장 가까운 적을 향해 총알 발사
function autoShoot() {
    setInterval(() => {
        if (isPaused || enemies.length === 0) return;

        // 1. 가장 가까운 적 찾기
        let closestEnemy = enemies[0];
        let minDistance = Math.hypot(player.x - enemies[0].x, player.y - enemies[0].y);

        for (let i = 1; i < enemies.length; i++) {
            const dist = Math.hypot(player.x - enemies[i].x, player.y - enemies[i].y);
            if (dist < minDistance) {
                minDistance = dist;
                closestEnemy = enemies[i];
            }
        }

        // 2. 적을 향하는 각도 계산
        const angle = Math.atan2(closestEnemy.y - player.y, closestEnemy.x - player.x);
        
        // 3. 총알 속도 및 방향 설정 (속도 7)
        const velocity = {
            x: Math.cos(angle) * 7,
            y: Math.sin(angle) * 7
        };

        // 4. 총알 생성 (노란색, 크기 5)
        projectiles.push(new Projectile(player.x, player.y, velocity, 5, 'yellow'));
    }, 500); // 500ms = 0.5초
}

// ==========================================
// 4. 적(Enemy) 클래스 및 스폰 설정
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

    update() {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

function spawnEnemies() {
    setInterval(() => {
        if (isPaused) return; 

        const radius = 15;
        let x, y;

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
    }, 1000); // 1초마다 적 생성
}

// ==========================================
// 5. 키보드 조작 이벤트
// ==========================================
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') isPaused = !isPaused;
    if (isPaused) return;

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
// 6. 메인 게임 루프 (초당 60프레임 실행)
// ==========================================
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isPaused) {
        // 플레이어 이동
        player.x += player.dx;
        player.y += player.dy;

        // 화면 밖으로 못 나가게 막기
        if (player.x < player.radius) player.x = player.radius;
        if (player.x > canvas.width - player.radius) player.x = canvas.width - player.radius;
        if (player.y < player.radius) player.y = player.radius;
        if (player.y > canvas.height - player.radius) player.y = canvas.height - player.radius;

        // 총알 이동 및 화면 밖으로 나간 총알 제거
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const p = projectiles[i];
            p.update();
            
            if (p.x + p.radius < 0 || p.x - p.radius > canvas.width || p.y + p.radius < 0 || p.y - p.radius > canvas.height) {
                projectiles.splice(i, 1);
            }
        }

        // 적 이동
        enemies.forEach((enemy) => enemy.update());

        // 🌟 충돌 판정 (총알이 적을 맞췄는지 확인)
        // 배열의 요소를 지울 때는 뒤에서부터(역순으로) 검사해야 오류가 없습니다.
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            for (let j = projectiles.length - 1; j >= 0; j--) {
                const projectile = projectiles[j];

                // 두 원의 중심점 사이의 거리 계산 (피타고라스의 정리)
                const dist = Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y);

                // 거리가 두 원의 반지름을 합친 것보다 작으면 = 부딪힘!
                if (dist - enemy.radius - projectile.radius < 0) {
                    enemies.splice(i, 1);       // 적을 화면에서 제거
                    projectiles.splice(j, 1);   // 맞춘 총알도 화면에서 제거
                    addScore(10);               // 점수 10점 추가
                    break;                      // 이미 죽은 적은 더 이상 검사 안 함
                }
            }
        }
    }

    // 그리기 (플레이어, 총알, 적)
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();

    projectiles.forEach((p) => p.draw());
    enemies.forEach((enemy) => enemy.draw());

    // 일시정지 UI
    if (isPaused) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "white";
        ctx.font = "bold 50px Arial";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
    }

    requestAnimationFrame(gameLoop);
}

// ==========================================
// 7. 게임 최초 실행
// ==========================================
spawnEnemies(); // 적 생성 시작
autoShoot();    // 자동 공격 시작
gameLoop();     // 게임 화면 렌더링 시작