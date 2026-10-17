let expression = "";

const result = document.getElementById("result");
const words = document.getElementById("words");
const expressionBox = document.getElementById("expression");

function add(value) {
    expression += value;
    show();
}

function clearAll() {
    expression = "";
    show();
}

function backspace() {
    expression = expression.slice(0, -1);
    show();
}

function show() {
    expressionBox.textContent = expression || "";
    result.textContent = expression || "0";
    words.textContent = "";
}
