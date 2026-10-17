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
}function calculate() {
    if (!expression) return;

    try {
        const value = evaluate(expression);

        result.textContent = formatIndian(value);
        words.textContent = bigIntToWords(value);

        expression = value.toString();
        expressionBox.textContent = "Result";
    } catch (error) {
        result.textContent = "Error";
        words.textContent = error.message;
    }
}

function evaluate(str) {
    const tokens = tokenize(str);
    let position = 0;

    function peek() {
        return tokens[position];
    }

    function consume() {
        return tokens[position++];
    }

    function primary() {
        const token = peek();

        if (token === "(") {
            consume();

            const value = addition();

            if (consume() !== ")") {
                throw new Error("Missing )");
            }

            return value;
        }

        if (/^-?\d+$/.test(token)) {
            consume();
            return BigInt(token);
        }

        throw new Error("Invalid number");
    }

    function multiplication() {
        let value = primary();

        while (
            peek() === "*" ||
            peek() === "/" ||
            peek() === "%"
        ) {
            const op = consume();
            const right = primary();

            if (op === "*") {
                value = value * right;
            }

            if (op === "/") {
                if (right === 0n) {
                    throw new Error("Cannot divide by zero");
                }

                value = value / right;
            }

            if (op === "%") {
                if (right === 0n) {
                    throw new Error("Cannot divide by zero");
                }

                value = value % right;
            }
        }

        return value;
    }

    function addition() {
        let value = multiplication();

        while (
            peek() === "+" ||
            peek() === "-"
        ) {
            const op = consume();
            const right = multiplication();

            if (op === "+") {
                value = value + right;
            } else {
                value = value - right;
            }
        }

        return value;
    }

    const answer = addition();

    if (position < tokens.length) {
        throw new Error("Invalid expression");
    }

    return answer;
}
function tokenize(str) {
    const tokens = [];
    let i = 0;

    while (i < str.length) {
        const c = str[i];

        if (/\s/.test(c)) {
            i++;
            continue;
        }

        if ("()+-*/%".includes(c)) {

            if (
                c === "-" &&
                (i === 0 || "+-*/%(".includes(str[i - 1]))
            ) {
                let number = "-";
                i++;

                while (
                    i < str.length &&
                    /\d/.test(str[i])
                ) {
                    number += str[i++];
                }

                tokens.push(number);
            } else {
                tokens.push(c);
                i++;
            }

            continue;
        }

        if (/\d/.test(c)) {
            let number = "";

            while (
                i < str.length &&
                /\d/.test(str[i])
            ) {
                number += str[i++];
            }

            tokens.push(number);
            continue;
        }

        throw new Error("Invalid character");
    }

    return tokens;
}
function formatIndian(value) {
    let negative = value < 0n;

    if (negative) {
        value = -value;
    }

    const number = value.toString();

    if (number.length <= 3) {
        return (negative ? "-" : "") + number;
    }

    const lastThree = number.slice(-3);
    let remaining = number.slice(0, -3);
    const parts = [];

    while (remaining.length > 2) {
        parts.unshift(remaining.slice(-2));
        remaining = remaining.slice(0, -2);
    }

    if (remaining) {
        parts.unshift(remaining);
    }

    return (
        (negative ? "-" : "") +
        parts.join(",") +
        "," +
        lastThree
    );
}
