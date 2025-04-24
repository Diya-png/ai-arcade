let canvas = document.getElementById("networkCanvas");
let ctx = canvas.getContext("2d");

let inputNodes = 2;
let hiddenNodes = 2;
let outputNodes = 1;

let weights_input_hidden = [];
let weights_hidden_output = [];
let bias_hidden = [];
let bias_output = [];

let logBox = document.getElementById("logBox");

let inputValues = [];
let hiddenValues = [];
let outputValues = [];

let currentEpoch = 0;
let epochs = 5000;
let learningRate = 0.1;
let trainingData = [
    { input: [0, 0], output: [0] },
    { input: [0, 1], output: [1] },
    { input: [1, 0], output: [1] },
    { input: [1, 1], output: [0] }
];

function initializeNetwork() {
    inputNodes = parseInt(document.getElementById("inputNodes").value);
    hiddenNodes = parseInt(document.getElementById("hiddenNodes").value);
    outputNodes = parseInt(document.getElementById("outputNodes").value);

    weights_input_hidden = Array.from({ length: hiddenNodes }, () =>
        Array.from({ length: inputNodes }, () => Math.random() * 2 - 1)
    );

    weights_hidden_output = Array.from({ length: outputNodes }, () =>
        Array.from({ length: hiddenNodes }, () => Math.random() * 2 - 1)
    );

    bias_hidden = Array.from({ length: hiddenNodes }, () => Math.random() * 2 - 1);
    bias_output = Array.from({ length: outputNodes }, () => Math.random() * 2 - 1);

    drawNetwork();
    log("Network initialized.");
}

function drawNetwork() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const layerSpacing = canvas.width / 4;
    const nodeSpacing = 60;
    const radius = 20;

    const drawLayer = (count, xOffset) => {
        let positions = [];
        const top = (canvas.height - (count * nodeSpacing)) / 2;
        for (let i = 0; i < count; i++) {
            let y = top + i * nodeSpacing;
            ctx.beginPath();
            ctx.arc(xOffset, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = "#C5705D";
            ctx.fill();
            ctx.stroke();
            positions.push({ x: xOffset, y });
        }
        return positions;
    };

    const inputs = drawLayer(inputNodes, layerSpacing);
    const hiddens = drawLayer(hiddenNodes, layerSpacing * 2);
    const outputs = drawLayer(outputNodes, layerSpacing * 3);

    // Connect layers
    const connect = (from, to) => {
        from.forEach(f => {
            to.forEach(t => {
                ctx.beginPath();
                ctx.moveTo(f.x, f.y);
                ctx.lineTo(t.x, t.y);
                ctx.strokeStyle = "#D0B8A8";
                ctx.stroke();
            });
        });
    };

    connect(inputs, hiddens);
    connect(hiddens, outputs);
}

function log(msg) {
    const p = document.createElement("p");
    p.textContent = msg;
    logBox.appendChild(p);
    logBox.scrollTop = logBox.scrollHeight;
}

// Forward pass animation
function animateForwardPass(inputs, hiddenOutputs, finalOutputs) {
    const speed = 50; // Adjust speed of the animation
    let currentStep = 0;

    function stepForward() {
        if (currentStep < inputs.length) {
            // Animate connections from inputs to hidden
            ctx.beginPath();
            ctx.moveTo(inputs[currentStep].x, inputs[currentStep].y);
            ctx.lineTo(hiddenOutputs[currentStep].x, hiddenOutputs[currentStep].y);
            ctx.strokeStyle = "#FF6347"; // Red for forward pass animation
            ctx.stroke();
            currentStep++;
            requestAnimationFrame(stepForward);
        }
    }

    stepForward();
}

// Animate weight updates during backpropagation
function animateWeightUpdates() {
    const weightSpeed = 0.5;
    let currentUpdate = 0;

    function stepUpdate() {
        if (currentUpdate < weights_input_hidden.length) {
            // Animate weight update between layers
            for (let i = 0; i < weights_input_hidden[currentUpdate].length; i++) {
                ctx.beginPath();
                ctx.moveTo(weights_input_hidden[currentUpdate][i].x, weights_input_hidden[currentUpdate][i].y);
                ctx.lineTo(weights_hidden_output[currentUpdate][i].x, weights_hidden_output[currentUpdate][i].y);
                ctx.strokeStyle = "#32CD32"; // Green for backpropagation
                ctx.lineWidth = weightSpeed;
                ctx.stroke();
            }
            currentUpdate++;
            requestAnimationFrame(stepUpdate);
        }
    }

    stepUpdate();
}

// Sigmoid activation function
function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

// Sigmoid derivative for backpropagation
function sigmoidDerivative(x) {
    return x * (1 - x);
}

// Main train function
function trainNetwork() {
    log("Training started...");
    let totalError = 0;

    // For each epoch, perform forward pass, backpropagation, and weight updates
    for (let epoch = 0; epoch < epochs; epoch++) {
        totalError = 0;
        for (let data of trainingData) {
            let inputs = data.input;
            let expectedOutput = data.output;

            // Forward pass
            let hiddenInputs = new Array(hiddenNodes);
            let hiddenOutputs = new Array(hiddenNodes);
            for (let i = 0; i < hiddenNodes; i++) {
                hiddenInputs[i] = 0;
                for (let j = 0; j < inputNodes; j++) {
                    hiddenInputs[i] += inputs[j] * weights_input_hidden[i][j];
                }
                hiddenInputs[i] += bias_hidden[i];
                hiddenOutputs[i] = sigmoid(hiddenInputs[i]);
            }

            let finalInputs = new Array(outputNodes);
            let finalOutputs = new Array(outputNodes);
            for (let i = 0; i < outputNodes; i++) {
                finalInputs[i] = 0;
                for (let j = 0; j < hiddenNodes; j++) {
                    finalInputs[i] += hiddenOutputs[j] * weights_hidden_output[i][j];
                }
                finalInputs[i] += bias_output[i];
                finalOutputs[i] = sigmoid(finalInputs[i]);
            }

            // Calculate error
            let error = 0;
            for (let i = 0; i < outputNodes; i++) {
                error += Math.pow(expectedOutput[i] - finalOutputs[i], 2);
            }

            totalError += error;

            // Backpropagation
            let outputDeltas = new Array(outputNodes);
            for (let i = 0; i < outputNodes; i++) {
                outputDeltas[i] = (expectedOutput[i] - finalOutputs[i]) * sigmoidDerivative(finalOutputs[i]);
            }

            let hiddenDeltas = new Array(hiddenNodes);
            for (let i = 0; i < hiddenNodes; i++) {
                hiddenDeltas[i] = 0;
                for (let j = 0; j < outputNodes; j++) {
                    hiddenDeltas[i] += outputDeltas[j] * weights_hidden_output[j][i];
                }
                hiddenDeltas[i] *= sigmoidDerivative(hiddenOutputs[i]);
            }

            // Update weights and biases
            for (let i = 0; i < outputNodes; i++) {
                for (let j = 0; j < hiddenNodes; j++) {
                    weights_hidden_output[i][j] += learningRate * outputDeltas[i] * hiddenOutputs[j];
                }
                bias_output[i] += learningRate * outputDeltas[i];
            }

            for (let i = 0; i < hiddenNodes; i++) {
                for (let j = 0; j < inputNodes; j++) {
                    weights_input_hidden[i][j] += learningRate * hiddenDeltas[i] * inputs[j];
                }
                bias_hidden[i] += learningRate * hiddenDeltas[i];
            }

            // Animate weight updates
            animateWeightUpdates();

            // Forward pass animation
            animateForwardPass(inputs, hiddenOutputs, finalOutputs);
        }

        log(`Epoch ${epoch + 1}, Error: ${totalError}`);
    }
}
