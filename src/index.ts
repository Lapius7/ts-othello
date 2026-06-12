type Cell = 0 | 1 | 2;
type Board = Cell[][];
let currentTurn: Cell = 1;
let systemMessage = "";
let isGameOver = false;

function initializeBoard(): Board {
  const grid: Board = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];

  grid[3][3] = 1;
  grid[4][4] = 1;
  grid[3][4] = 2;
  grid[4][3] = 2;

  return grid;
}

const DIRECTIONS = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
];

function getFlippableStones(x: number, y: number, grid: Board, turn: Cell) {
  let flipList: { x: number; y: number }[] = [];
  for (const [dx, dy] of DIRECTIONS) {
    let checkX = x + dx;
    let checkY = y + dy;
    let temp: { x: number; y: number }[] = [];
    while (checkX >= 0 && checkX < 8 && checkY >= 0 && checkY < 8) {
      if (grid[checkY][checkX] === 0) {
        break;
      }
      if (grid[checkY][checkX] === turn) {
        flipList.push(...temp);
        break;
      }
      temp.push({ x: checkX, y: checkY });
      checkX += dx;
      checkY += dy;
    }
  }
  return flipList;
}

function hasValidMove(grid: Board, turn: Cell): boolean {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (grid[y][x] === 0) {
        const stones = getFlippableStones(x, y, grid, turn);
        if (stones.length > 0) return true;
      }
    }
  }
  return false;
}

function renderBoard(grid: Board) {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = "";
  let blackCount = 0;
  let whiteCount = 0;

  const boardDiv = document.createElement("div");
  boardDiv.style.display = "grid";
  boardDiv.style.gridTemplateColumns = "repeat(8, 50px)";
  boardDiv.style.width = "fit-content";

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const val = grid[y][x];
      if (val === 1) blackCount++;
      if (val === 2) whiteCount++;

      const box = document.createElement("div");
      box.style.backgroundColor = "green";
      box.style.display = "flex";
      box.style.justifyContent = "center";
      box.style.alignItems = "center";

      box.style.width = "50px";
      box.style.height = "50px";
      box.style.border = "1px solid black";

      if (val === 1 || val === 2) {
        const stone = document.createElement("div");
        stone.style.width = "40px";
        stone.style.height = "40px";
        stone.style.borderRadius = "50%";
        if (val === 1) {
          stone.style.backgroundColor = "black";
        } else if (val === 2) {
          stone.style.backgroundColor = "white";
        }

        box.appendChild(stone);
      }
      boardDiv.appendChild(box);
      box.addEventListener("click", () => {
        if (isGameOver) return;
        if (val !== 0) return;
        const flippableStones = getFlippableStones(x, y, grid, currentTurn);
        if (flippableStones.length === 0) return;

        for (const stone of flippableStones) {
          grid[stone.y][stone.x] = currentTurn;
        }
        grid[y][x] = currentTurn;
        currentTurn = currentTurn === 1 ? 2 : 1;
        systemMessage = "";

        if (!hasValidMove(grid, currentTurn)) {
          const nextTurn = currentTurn === 1 ? 2 : 1;
          if (!hasValidMove(grid, nextTurn)) {
            isGameOver = true;
          } else {
            const passColor = currentTurn === 1 ? "黒" : "白";
            systemMessage = `${passColor}は置ける場所がないためパスしました！`;
            currentTurn = nextTurn;
          }
        }

        renderBoard(grid);
      });
    }
  }
  const infoDiv = document.createElement("div");
  infoDiv.style.color = "white";
  infoDiv.style.marginBottom = "20px";
  infoDiv.style.fontSize = "20px";
  if (isGameOver) {
    if (blackCount > whiteCount) systemMessage = "ゲーム終了！ 黒の勝ち！🎉";
    else if (whiteCount > blackCount)
      systemMessage = "ゲーム終了！ 白の勝ち！🎉";
    else systemMessage = "ゲーム終了！ 引き分け！";
  }

  const turnText = currentTurn === 1 ? "黒(●)" : "白(◯)";
  infoDiv.innerHTML = `
    <h3 style="height: 24px; color: yellow; margin: 0;">${systemMessage}</h3>
    <h2>現在のターン: ${turnText}</h2>
    <div style="display: flex;gap: 20px;">
      <h3>黒: ${blackCount}</h3>
      <h3>白: ${whiteCount}</h3>
    </div>
  `;
  app.appendChild(infoDiv);
  app.appendChild(boardDiv);
}

const myBoard = initializeBoard();
renderBoard(myBoard);
