// dựng khung
const table = document.getElementById('board')
const COLS = 10;
const ROWS = 20;

const SHAPES = {
    I:[
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
    ],

    O: [
        [1, 1],
        [1, 1]
    ],

    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],

    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],

    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],

    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],

    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ]
}

const COLORS = {
    I: '#4fa3a8',
    O: '#b8a13a',
    T: '#8a5fa8',
    S: '#5a9a5a',
    Z: '#b05555',
    J: '#5a6fb0',
    L: '#c08a45'
};

//màn 1: xóa 10 hàng thì hao2n thành
const L1_GOAL = 10;
const L1_DROP = 500;

//màn 2
const L2_GOAL = 15;
const L2_TIME = 120;
const L2_START_DROP = 350;
const L2_UP_EVERY = 20;
const L2_UP_STEP = 40;

//màn 3
const L3_GOAL = 10;
const L3_TIME = 120;
const L3_START_DROP = 500;
const L3_UP_EVERY = 30;
const L3_UP_STEP = 100;

//màn 4
const L4_TIME = 90;
const L4_START_DROP = 500;
const L4_UP_EVERY = 10;
const L4_UP_STEP = 50;
const L4_MIN_DROP = 150;
const L4_GARBAGE_EVERY = 15;
const L4_WARN_TIME = 2;

const LAST_LEVEL = 4;

//ô đá nằm ở 4 hàng cuối cùng
const STONE_COLOR = '#6b6b6b';
const STONES = [
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 0, 0, 1, 0, 1, 0, 0, 1]
];

//hàng rac1
const GARBAGE_COLOR = '#6e5f5f';

// 0 là ô trống, ô đã lock sẽ lưu màu khối
const board = [];
for(let row = 0; row < ROWS; row++) {
    board.push(new Array(COLS).fill(0));
}

// tạo bản
const cells = [];
function createGrid(){
    for(let row = 0; row < ROWS; row++) {
        const tr = table.insertRow();
        cells.push([]);
        for(let col = 0; col < COLS; col++) {
            cells[row].push(tr.insertCell());
        }
    }
}

let piece=null;

const levelTitle = document.getElementById('level-title');
const gameBoard = document.getElementById('game-board');
const nextBtn = document.getElementById('btn-next');
const restartBtn = document.getElementById('btn-restart');
const scoreText = document.getElementById('score');
const linesText = document.getElementById('lines');
const extraInfo = document.getElementById('extra-info');
const message = document.getElementById('message');
const mission1 = document.getElementById('mission-1');
const mission2 = document.getElementById('mission-2');
const mission3 = document.getElementById('mission-3');
const mission4 = document.getElementById('mission-4');
const timeText = document.getElementById('time-left');
const speedText = document.getElementById('speed-level');
const levelBtn = document.getElementsByClassName('level-btn');

let level = 1;
let goalLines = L1_GOAL;
let score = 0;
let totalLines = 0;
let gameOver = false;
let paused = false;
let dropTime = L1_DROP;
let minDrop = 0;
let timeLeft = 0;
let speedLevel = 1;
let speedEvery = 0;
let speedStep = 0;
let timer = null;
let clockTimer = null;

// tạo 1 khối ngẫu nhiên
function randomPiece(){
    const types = Object.keys(SHAPES);
    const type = types[Math.floor(Math.random() * types.length)];
    const shape = SHAPES[type];

    return{
        shape: shape,
        color: COLORS[type],
        row: 0,
        col: Math.floor((COLS - shape[0].length) / 2)
    };
}

//đưa khối moi71 vừa tạo vào
function spawnPiece(){
    piece = randomPiece();
    //khối mới tạo dụng khối khác và hết chồ thì game over
    if(collide(piece.shape, piece.row, piece.col)){
        gameOver=true;
        clearInterval(timer);
        clearInterval(clockTimer);
        message.innerHTML = 'GAME OVER';
        piece = null;
    }
}

//tô khối đè lên bảng (chưa lock vẫn đg di chuyển)
function drawPiece(){
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if(piece.shape[r][c]){
                cells[piece.row + r][piece.col + c].style.backgroundColor = piece.color;
            }
        }
    }
}

// check va chạm với tường, đáy và ô đã đc lock trước đó
function collide(shape, row, col){
    for(let r = 0; r < shape.length; r++) {
        for(let c = 0; c < shape[r].length; c++){
            if(!shape[r][c]) continue;
            const newRow = row + r;
            const newCol = col + c;
            if(newCol < 0 || newCol >= COLS || newRow >= ROWS)
                return true;
            if(newRow >= 0 && board[newRow][newCol])
                return true;
        }
    }
    return false;
}

// lock khối vào board
function lockPiece(){
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if(piece.shape[r][c]){
                board[piece.row + r][piece.col + c] = piece.color;
            }
        }
    }
}

//màn 3 đặt các ô đá vào các hàng cuối
function putStones() {
    for (let r = 0; r < STONES.length; r++) {
        for (let c = 0; c < COLS; c++) {
            if (STONES[r][c] === 1) {
                board[ROWS - STONES.length + r][c] = STONE_COLOR;
            }
        }
    }
}

//màn 4 1 hàng được đẩy từ dưới lên
function addGarbageRow(){
    gameBoard.style.borderColor = '';
    let lose = false;

    for (let col = 0; col < COLS; col++) {
        if (board[0][col] !== 0) {
            lose = true;
        }
    }

    if (!lose) {
        for (let row = 0; row < ROWS - 1; row++) {
            board[row] = board[row + 1];
        }
        //hàng rác chỉ chừa 1 ô trống ngẫu nhiên
        const garbageRow = new Array(COLS).fill(GARBAGE_COLOR);
        garbageRow[Math.floor(Math.random() * COLS)] = 0;
        board[ROWS - 1] = garbageRow;

        // khối đang rơi bị đè lên thì đẩy nó lên 1 hàng theo bàn chơi
        if (collide(piece.shape, piece.row, piece.col)) {
            piece.row--;
            if (piece.row < 0 || collide(piece.shape, piece.row, piece.col)) {
                lose = true;
            }
        }
    }
    if (lose) {
        gameOver = true;
        clearInterval(timer);
        clearInterval(clockTimer);
        message.innerHTML = 'GAME OVER';
        piece = null;
    }
    render();

}

//hàng đầy
function isFullRow(row){
    for(let col = 0; col < COLS; col++){
        if(board[row][col]===0) return false;
    }
    return true;
}

//qua màn
function winLevel(){
    gameOver=true;
    clearInterval(timer);
    clearInterval(clockTimer);
    message.innerHTML= 'HOÀN THÀNH MÀN ' + level + '!';
    message.style.color = '#6fae6f';

    if (level < LAST_LEVEL) {
        nextBtn.style.display = 'block';
    }

}
//xóa hàng đã đấy, mỗi hàng xóa được cộng 100đ
function clearLines(){
    let cleared = 0;
    for(let row = ROWS - 1; row >= 0; row--){
        if(isFullRow(row)){
            for(let r = row; r > 0; r--){
                board[r]=board[r-1]
            }
            board[0] = new Array(COLS).fill(0);
            cleared++;
            row++;
        }
    }
    if(cleared>0){
        totalLines += cleared;
        score += cleared * 100;
        scoreText.innerHTML = score;
        linesText.innerHTML = totalLines;

        if (level !== 4 && totalLines >= goalLines) {
            winLevel();
        }
    }
}

//rơi khối, nếu không thể rơi tiếp thì lock khối đó, tạo khối mới và render
function drop(){
    if(!collide(piece.shape, piece.row + 1, piece.col)){
        piece.row++;
    } else {
        lockPiece();
        clearLines();
        if(gameOver) {
            piece = null;
        }else{
            spawnPiece();
        }
    }
    render();
}

//di chuyển khối nêu vị trí mới kh bị va chạm
function movePiece(dRow, dCol){
    if(!collide(piece.shape, piece.row + dRow, piece.col + dCol)){
        piece.row += dRow;
        piece.col += dCol;
        render();
    }
}

//rơi ngay
function hardDrop(){
    while(!collide(piece.shape, piece.row + 1, piece.col)){
        piece.row++;
    }
    drop();
}
// xoay khối 90 độ
function rotate(shape){
    const newShape = [];
    for(let col = 0; col < shape.length; col++){
        const newRow =[];
        for(let row = shape.length-1; row >= 0; row--){
            newRow.push(shape[row][col]);
        }
        newShape.push(newRow);
    }
    return newShape;
}

function rotatePiece(){
    const newShape = rotate(piece.shape);
    if(!collide(newShape, piece.row, piece.col)){
        piece.shape = newShape;
        render();
    }
}

//tăng tốc
function speedUp() {
    if(dropTime<=minDrop) return;

    dropTime = dropTime - speedStep;
    if (dropTime < minDrop) {
        dropTime = minDrop;
    }

    speedLevel++;
    speedText.innerHTML = speedLevel;
    clearInterval(timer);
    timer = setInterval(drop, dropTime);
}

//đếm ngược thời gian
function tickClock() {
    timeLeft--;
    timeText.innerHTML = timeLeft;

    //cứ 15 giây tăng tốc 1 lần
    if (timeLeft > 0 && timeLeft % speedEvery === 0) {
        speedUp();
    }

    if (level === 4) {
        if (timeLeft - L4_WARN_TIME > 0 && (timeLeft - L4_WARN_TIME) % L4_GARBAGE_EVERY === 0) {
            message.innerHTML = 'CẢNH BÁO: hàng rác sắp xuất hiện!';
            gameBoard.style.borderColor = '#b05555';
        }
        if (timeLeft > 0 && timeLeft % L4_GARBAGE_EVERY === 0) {
            message.innerHTML = '';
            addGarbageRow();
        }
    }

    //hết giờ
    if (timeLeft <= 0) {
        if (level === 4) {
            winLevel();
        }else {
            gameOver = true;
            clearInterval(timer);
            clearInterval(clockTimer);
            message.innerHTML = 'HẾT GIỜ!';
        }
    }
}


//nút tạm dừng và chơi tiếp game
function togglePause(){
    if(paused){
        paused = false;
        message.innerHTML = '';
        timer = setInterval(drop, dropTime);
        if (level >= 2) {
            clockTimer = setInterval(tickClock, 1000);
        }
    }else {
        paused = true;
        message.innerHTML = 'TẠM DỪNG';
        clearInterval(timer);
        clearInterval(clockTimer);
    }
}

//bắt đầu/ bđ lại màn hiện tại
function startLevel() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            board[row][col] = 0;
        }
    }
    score = 0;
    totalLines = 0;
    gameOver = false;
    paused = false;
    minDrop=0;
    scoreText.innerHTML = 0;
    linesText.innerHTML = 0;
    message.innerHTML = '';
    message.style.color = '';
    gameBoard.style.borderColor = '';
    nextBtn.style.display = 'none';
    clearInterval(timer);
    clearInterval(clockTimer);
    restartBtn.blur();
    nextBtn.blur();

    for (let i = 0; i < levelBtn.length; i++) {
        levelBtn[i].setAttribute('class', 'level-btn');
        levelBtn[i].blur();
    }
    levelBtn[level - 1].setAttribute('class', 'level-btn active');

    mission1.style.display = 'none';
    mission2.style.display = 'none';
    mission3.style.display = 'none';
    mission4.style.display = 'none';
    extraInfo.style.display = 'none';

    if (level === 1) {
        levelTitle.innerHTML = 'Màn 1: Chế độ cổ điển';
        mission1.style.display = 'block';
        dropTime = L1_DROP;
        goalLines = L1_GOAL;
    } else if(level === 2){
        levelTitle.innerHTML = 'Màn 2: Thử thách tốc độ';
        mission2.style.display = 'block';
        dropTime = L2_START_DROP;
        goalLines = L2_GOAL;
        timeLeft = L2_TIME;
        speedEvery = L2_UP_EVERY;
        speedStep = L2_UP_STEP;
    }else if(level === 3){
        levelTitle.innerHTML = 'Màn 3: Vượt chướng ngại vật';
        mission3.style.display = 'block';
        dropTime = L3_START_DROP;
        goalLines = L3_GOAL;
        timeLeft = L3_TIME;
        speedEvery = L3_UP_EVERY;
        speedStep = L3_UP_STEP;
        putStones();
    }else{
        levelTitle.innerHTML = 'Màn 4: Sống sót cuối cùng';
        mission4.style.display = 'block';
        dropTime = L4_START_DROP;
        timeLeft = L4_TIME;
        speedEvery = L4_UP_EVERY;
        speedStep = L4_UP_STEP;
        minDrop = L4_MIN_DROP;
    }

    if (level >= 2) {
        extraInfo.style.display = 'block';
        speedLevel = 1;
        timeText.innerHTML = timeLeft;
        speedText.innerHTML = speedLevel;
        clockTimer = setInterval(tickClock, 1000);
    }

    spawnPiece();
    render();
    timer = setInterval(drop, dropTime);
}

//chơi lại game
function restart(){
    startLevel();
}
//nút màn tiếp theo
function nextLevel() {
    level++;
    startLevel();
}

//cho màn
function selectLevel(n){
    level=n;
    startLevel();
}
//bắt phím
document.onkeydown=function(event){
    if(gameOver) return;
    if(event.key==='p' || event.key==='P'){
        togglePause();
        return;
    }

    if(paused) return;
    switch(event.key){
        case 'ArrowLeft':
            movePiece(0, -1);
            break;
        case 'ArrowRight':
            movePiece(0, 1);
            break;
        case 'ArrowUp':
            event.preventDefault();
            rotatePiece();
            break;
        case 'ArrowDown':
            event.preventDefault();
            movePiece(1, 0);
            break;
        case ' ':
            event.preventDefault();
            hardDrop();
            break;
    }
};

function render(){
    for(let row = 0; row < ROWS; row++) {
        for(let col = 0; col < COLS; col++) {
            cells[row][col].style.backgroundColor = board[row][col] || '';
        }
    }
    if (piece) drawPiece();
}

function init(){
    createGrid();
    startLevel()
}

init();