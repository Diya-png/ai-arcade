let startTiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
let goalTiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];

function renderBoard(id, tiles, editable = true) {
    const board = document.getElementById(id);
    board.innerHTML = '';
    tiles.forEach((num, idx) => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.textContent = num !== 0 ? num : '';
        tile.draggable = editable;
        tile.dataset.index = idx;
        board.appendChild(tile);
    });
}

function swapTiles(tiles, fromIdx, toIdx) {
    const temp = tiles[fromIdx];
    tiles[fromIdx] = tiles[toIdx];
    tiles[toIdx] = temp;
}

document.getElementById('start-board').addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
});

document.getElementById('start-board').addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.getElementById('start-board').addEventListener('drop', (e) => {
    const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
    const toIdx = parseInt(e.target.dataset.index);
    swapTiles(startTiles, fromIdx, toIdx);
    renderBoard('start-board', startTiles);
});

function shuffleBoard() {
    for (let i = startTiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        swapTiles(startTiles, i, j);
    }
    renderBoard('start-board', startTiles);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function animateSolution(steps) {
    for (let i = 0; i < steps.length; i++) {
        await sleep(400);
        startTiles = steps[i].state;
        renderBoard('start-board', startTiles, false);
    }
}

function solvePuzzle() {
    fetch('/solve-8-puzzle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: startTiles, goal: goalTiles })
    })
    .then(res => res.json())
    .then(data => {
        if (data.steps.length === 0) {
            alert("No solution found!");
            return;
        }
        animateSolution(data.steps);
    });
}

// Initial render
renderBoard('start-board', startTiles);
renderBoard('goal-board', goalTiles, false);
