// dựng khunh
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
    I: '#00f0f0',
    O: '#f0f000',
    T: '#a000f0',
    S: '#00f000',
    Z: '#f00000',
    J: '#0000f0',
    L: '#f0a000'
};

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

let piece=null

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

//rơi khối, nếu không thể rơi tiếp thì lock khối đó, tạo khối mới và render
function drop(){
    if(!collide(piece.shape, piece.row + 1, piece.col)){
        piece.row++;
    } else {
        lockPiece();
        spawnPiece();
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

//bắt phím
document.addEventListener('keydown', function (event){
    switch(event.key){
        case 'ArrowLeft':
            movePiece(0, -1);
            break;
        case 'ArrowRight':
            movePiece(0, 1);
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
})

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
    spawnPiece();
    render();
    setInterval(drop, 500);
}

init();