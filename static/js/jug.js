function solve() {
    const jugA = parseInt(document.getElementById("jugA").value);
    const jugB = parseInt(document.getElementById("jugB").value);
    const goal = parseInt(document.getElementById("goal").value);

    fetch('/solve-water-jug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jugA, jugB, goal })
    })
    .then(res => res.json())
    .then(data => {
        const stepsDiv = document.getElementById("steps");
        stepsDiv.innerHTML = "<h3>Steps:</h3>";

        const steps = data.steps;
        if (!steps.length) {
            stepsDiv.innerHTML += "<p>No solution found.</p>";
            return;
        }

        let i = 0;
        function animate() {
            if (i >= steps.length) return;

            const [a, b] = steps[i];
            const heightA = (a / jugA) * 100;
            const heightB = (b / jugB) * 100;

            document.getElementById("water-a").style.height = heightA + "%";
            document.getElementById("water-b").style.height = heightB + "%";

            stepsDiv.innerHTML += `<p>Step ${i}: Jug A = ${a}, Jug B = ${b}</p>`;
            i++;
            setTimeout(animate, 1000);
        }

        animate();
    });
}
