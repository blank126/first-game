const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 캔버스 해상도 설정 (800x600)
canvas.width = 800;
canvas.height = 600;

// 플레이어 초기 상태 설정
const player = {
    x: canvas.width / 2, // 정중앙에서 시작
    y: canvas.height / 2,
    radius: 15,          // 캐릭터 크기
    color: '#4da6ff',    // 파란색
    speed: 5,            // 이동 속도
    dx: 0,               // x축 이동 방향
    dy: 0                // y축 이동 방향
};

// 키보드를 눌렀을 때 (이동 시작)
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w') player.dy = -player.speed;
    if (e.key === 'ArrowDown' || e.key === 's') player.dy = player.speed;
    if (e.key === 'ArrowLeft' || e.key === 'a') player.dx = -player.speed;
    if (e.key === 'ArrowRight' || e.key === 'd') player.dx = player.speed;
});

// 키보드에서 손을 뗐을 때 (이동 멈춤)
window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w') player.dy = 0;
    if (e.key === 'ArrowDown' || e.key === 's') player.dy = 0;
    if (e.key === 'ArrowLeft' || e.key === 'a') player.dx = 0;
    if (e.key === 'ArrowRight' || e.key === 'd') player.dx = 0;
});

// 메인 게임 루프 (1초에 60번씩 실행되며 화면을 다시 그림)
function gameLoop() {
    // 1. 이전 프레임의 잔상 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. 플레이어 위치 업데이트 (이동)
    player.x += player.dx;
    player.y += player.dy;

    // 플레이어가 캔버스 밖으로 나가지 못하게 막기
    if (player.x < player.radius) player.x = player.radius;
    if (player.x > canvas.width - player.radius) player.x = canvas.width - player.radius;
    if (player.y < player.radius) player.y = player.radius;
    if (player.y > canvas.height - player.radius) player.y = canvas.height - player.radius;

    // 3. 플레이어 화면에 그리기
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();

    // 4. 다음 프레임 요청 (무한 반복)
    requestAnimationFrame(gameLoop);
}

// 게임 최초 실행!
gameLoop();