let cities = [];
let canvas = document.getElementById("tspCanvas");
let ctx = canvas.getContext("2d");

// Reset the board before starting a new computation
function resetBoard() {
    // Clear canvas (removes both cities and paths)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw cities without redrawing the path
    drawCities();

    // Reset the steps container if necessary
    const stepsContainer = document.getElementById("steps-container");
    if (stepsContainer) {
        stepsContainer.innerHTML = '';
    }
}

// Generate random cities based on user input (6-8 cities)
function generateCities() {
    let cityCount = parseInt(document.getElementById("cityCount").value);

    // Ensure valid city count (between 6-8)
    if (cityCount < 6 || cityCount > 8) {
        alert("Please choose between 6 and 8 cities.");
        return;
    }

    resetBoard(); // Reset board before generating new cities
    cities = [];
    
    // Generate random cities
    for (let i = 0; i < cityCount; i++) {
        cities.push({
            x: Math.random() * (canvas.width - 50) + 25,
            y: Math.random() * (canvas.height - 50) + 25,
            id: i + 1
        });
    }
    drawCities();
}

// Draw cities and edges on the canvas
function drawCities() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cities
    cities.forEach(city => {
        ctx.beginPath();
        ctx.arc(city.x, city.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = "#C5705D";
        ctx.fill();
        ctx.stroke();
        ctx.fillText(city.id, city.x + 12, city.y);
    });

    // Draw all edges (lines between cities)
    ctx.beginPath();
    for (let i = 0; i < cities.length; i++) {
        for (let j = i + 1; j < cities.length; j++) {
            ctx.moveTo(cities[i].x, cities[i].y);
            ctx.lineTo(cities[j].x, cities[j].y);
        }
    }
    ctx.strokeStyle = '#D0B8A8';
    ctx.stroke();
}


// DFS implementation
function dfs(cityIdx, path, visited) {
    visited.add(cityIdx);
    path.push(cityIdx);

    if (path.length === cities.length) {
        path.push(path[0]); // Complete the cycle
        return path;
    }

    for (let i = 0; i < cities.length; i++) {
        if (!visited.has(i)) {
            let result = dfs(i, path, visited);
            if (result) return result;
        }
    }

    return null;
}


// BFS implementation
function bfs() {
    let queue = [[0]];  // Each element is a path (array of city indices)

    while (queue.length > 0) {
        let path = queue.shift();
        let lastCity = path[path.length - 1];

        if (path.length === cities.length) {
            path.push(path[0]); // Complete the cycle
            return path;
        }

        for (let i = 0; i < cities.length; i++) {
            if (!path.includes(i)) {  // Check path-local visit instead of global
                queue.push([...path, i]);
            }
        }
    }

    return null;
}

function solveTSP(algorithm) {
    resetBoard();

    fetch('/solve-tsp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cities: cities, algorithm: algorithm })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.path) {
            alert("No solution found!");
        } else {
            animatePath(data.path);
        }
    });
}

function runDFS() {
    solveTSP('dfs');
}

function runBFS() {
    solveTSP('bfs');
}



// Animate the path (drawing the travel route)
function animatePath(path) {
    if (!path) {
        alert("No solution found!");
        return;
    }

    let step = 0;
    function animateStep() {
        if (step >= path.length - 1) return;

        let fromCity = cities[path[step]];
        let toCity = cities[path[step + 1]];

        ctx.beginPath();
        ctx.moveTo(fromCity.x, fromCity.y);
        ctx.lineTo(toCity.x, toCity.y);
        ctx.strokeStyle = '#5b3a29';
        ctx.lineWidth = 3;
        ctx.stroke();

        step++;
        setTimeout(animateStep, 500); // Delay for better visualization
    }

    animateStep();
}

// Initial setup
window.onload = function () {
    document.getElementById("generateCitiesBtn").addEventListener("click", generateCities);
    document.getElementById("runDFSBtn").addEventListener("click", runDFS);
    document.getElementById("runBFSBtn").addEventListener("click", runBFS);
}
