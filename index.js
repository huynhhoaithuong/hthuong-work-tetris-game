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

// 0 là ô trống, lưu khối đã đặt
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

function render(){
    for(let row = 0; row < ROWS; row++) {
        for(let col = 0; col < COLS; col++) {
            cells[row][col].style.backgroundColor = COLORS[board[row][col]] || '';
        }
    }
}

let piece=null

// tạo 1 khối ngẫu nhiên
function randomPiece(){
    const types = Object.keys(SHAPES);
    const type = types[Math.floor(math.random() * types.length)];
    const shape = SHAPES[type];

    return{
        shape: shape,
        color: COLORS[type],
        row: 0,
        col: Math.floor((COLS - shape[0].length) / 2)
    };
}

function collide(shape, row, col){
    for(let r = 0; r < shape.length; r++) {

    }
}

createGrid();
render();