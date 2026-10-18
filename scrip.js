let expression = "";

const resultEl = document.getElementById("result");
const expressionEl = document.getElementById("expression");
const wordsEl = document.getElementById("words");

function add(value) {
    expression += value;
    update();
}

function clearAll() {
    expression = "";
    update();
}

function backspace() {
    expression = expression.slice(0, -1);
    update();
}

function update() {
    expressionEl.textContent = expression
        .replace(/\*/g, " × ")
        .replace(/\//g, " ÷ ")
        .replace(/\+/g, " + ")
        .replace(/-/g, " − ");

    if (!expression) {
        resultEl.textContent = "0";
        wordsEl.textContent = "Zero";
        return;
    }

    try {
        const value = evaluate(expression);

        resultEl.textContent = formatIndian(value);
        wordsEl.textContent = bigIntToWords(value);
    } catch (error) {
        resultEl.textContent = "…";
        wordsEl.textContent = "";
    }
}

function calculate() {
    if (!expression) return;

    try {
        const value = evaluate(expression);

        resultEl.textContent = formatIndian(value);
        wordsEl.textContent = bigIntToWords(value);

        expression = value.toString();
        expressionEl.textContent = "Result";
    } catch (error) {
        resultEl.textContent = "Error";
        wordsEl.textContent = error.message;
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
            } else if (op === "/") {
                if (right === 0n) {
                    throw new Error("Cannot divide by zero");
                }

                value = value / right;
            } else {
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

                if (number === "-") {
                    tokens.push("-");
                } else {
                    tokens.push(number);
                }
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

    const s = value.toString();

    if (s.length <= 3) {
        return (negative ? "-" : "") + s;
    }

    const lastThree = s.slice(-3);
    let remaining = s.slice(0, -3);
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

const ones = [
    "Zero",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen"
];

const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety"
];

const scales = [
    "",
    "Thousand",
    "Lakh",
    "Crore",
    "Arab",
    "Kharab",
    "Neel",
    "Padma",
    "Shankh",
    "Mahashankh"
];

function twoDigits(n) {
    n = Number(n);

    if (n < 20) {
        return ones[n];
    }

    return (
        tens[Math.floor(n / 10)] +
        (n % 10 ? " " + ones[n % 10] : "")
    );
}

function threeDigits(n) {
    n = Number(n);

    let text = "";

    if (n >= 100) {
        text =
            ones[Math.floor(n / 100)] +
            " Hundred";

        n %= 100;

        if (n) {
            text += " ";
        }
    }

    if (n) {
        text += twoDigits(n);
    }

    return text;
}

function bigIntToWords(value) {
    if (value === 0n) {
        return "Zero";
    }

    if (value < 0n) {
        return "Minus " + bigIntToWords(-value);
    }

    const groups = [];
    let temp = value;

    groups.push(Number(temp % 1000n));
    temp /= 1000n;

    while (temp > 0n) {
        groups.push(Number(temp % 100n));
        temp /= 100n;
    }

    const result = [];

    for (let i = groups.length - 1; i >= 0; i--) {
        const group = groups[i];

        if (group === 0) {
            continue;
        }

        const text =
            i === 0
                ? threeDigits(group)
                : twoDigits(group);

        const scale = scales[i] || "";

        result.push(
            text + (scale ? " " + scale : "")
        );
    }

    return result.join(" ");
}

document.addEventListener("keydown", function (e) {
    if (
        (e.key >= "0" && e.key <= "9") ||
        "+-*/%()".includes(e.key)
    ) {
        add(e.key);
    } else if (
        e.key === "Enter" ||
        e.key === "="
    ) {
        calculate();
    } else if (e.key === "Backspace") {
        backspace();
    } else if (e.key === "Escape") {
        clearAll();
    }
});

update();
