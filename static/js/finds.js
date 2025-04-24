function addExample() {
    const inputs = document.querySelectorAll(".feature-inputs input");
    const values = Array.from(inputs).map(input => input.value.trim());

    if (values.includes("")) {
        alert("Please fill in all fields.");
        return;
    }

    const table = document.getElementById("training-table").querySelector("tbody");
    const row = document.createElement("tr");

    values.forEach(val => {
        const cell = document.createElement("td");
        cell.textContent = val;
        row.appendChild(cell);
    });

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.onclick = () => row.remove();

    const removeCell = document.createElement("td");
    removeCell.appendChild(removeBtn);
    row.appendChild(removeCell);

    table.appendChild(row);

    // Clear inputs
    inputs.forEach(input => input.value = "");
}

function updateFeatureHeaders() {
    const f1 = document.getElementById("feature1-name").value || "Feature 1";
    const f2 = document.getElementById("feature2-name").value || "Feature 2";
    const f3 = document.getElementById("feature3-name").value || "Feature 3";
    const labelName = document.getElementById("labelName").value || "Label"; // Get label name

    // Update input placeholders
    document.querySelectorAll(".feature-inputs input")[0].placeholder = f1;
    document.querySelectorAll(".feature-inputs input")[1].placeholder = f2;
    document.querySelectorAll(".feature-inputs input")[2].placeholder = f3;
    document.querySelector("#label-input").placeholder = labelName;

    // Update table headers
    const headers = document.querySelectorAll("#training-table thead th");
    headers[0].innerText = f1;
    headers[1].innerText = f2;
    headers[2].innerText = f3;
    headers[3].innerText = labelName; // Update label header
}

function runFindS() {
    const rows = document.querySelectorAll("#training-table tbody tr");
    const data = [];

    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        const rowData = Array.from(cells).slice(0, -1).map(td => td.textContent.trim()); // Exclude Remove button column
        data.push(rowData);
    });

    if (data.length === 0) {
        alert("Please add at least one training example.");
        return;
    }

    fetch("/solve-find-s", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: data })
    })
    .then(res => res.json())
    .then(result => {
        document.getElementById("output").innerHTML =
            `<p><strong>Final Hypothesis:</strong> [${result.hypothesis.join(", ")}]</p>`;
    });
}
