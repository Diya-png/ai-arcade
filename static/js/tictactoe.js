let board = ["", "", "", "", "", "", "", "", ""];
let gameOver = false;

window.onload = function () {
    initBoard();
};

function initBoard() {
    const boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.id = "cell" + i;
        cell.addEventListener("click", () => handleClick(i));
        boardDiv.appendChild(cell);
    }
    updateScoreboard();
}

function handleClick(index) {
    if (board[index] === "" && !gameOver) {
        board[index] = "X";
        document.getElementById("cell" + index).textContent = "X";
        checkWinner();

        if (!gameOver) {
            setTimeout(aiMove, 300);
        }
    }
}

function aiMove() {
    fetch('/solve-tic-tac-toe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board })
    })
    .then(res => res.json())
    .then(data => {
        if (data.move !== -1) {
            board = data.board;
            document.getElementById("cell" + data.move).textContent = "O";
        }
        checkWinner();
    });
}

function checkWinner() {
    const winCombos = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];

    for (const combo of winCombos) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            gameOver = true;
            const winner = board[a] === "X" ? "You win!" : "AI wins!";
            document.getElementById("message").textContent = winner;
            updateScoreboard(board[a]);
            return;
        }
    }

    if (!board.includes("")) {
        gameOver = true;
        document.getElementById("message").textContent = "It's a draw!";
        updateScoreboard("draw");
    }
}

function restartGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    gameOver = false;
    document.getElementById("message").textContent = "";
    initBoard();
}

let playerScore = 0;
let aiScore = 0;
let drawScore = 0;

function updateScoreboard(winner = null) {
    if (winner === "X") playerScore++;
    else if (winner === "O") aiScore++;
    else if (winner === "draw") drawScore++;

    document.getElementById("playerScore").textContent = playerScore;
    document.getElementById("aiScore").textContent = aiScore;
    document.getElementById("drawScore").textContent = drawScore;
}
