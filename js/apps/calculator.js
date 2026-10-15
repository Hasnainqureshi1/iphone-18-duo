/* ============================================================
   apps/calculator.js — functional calculator
   ============================================================ */
(function () {
  "use strict";

  let display = "0";
  let stored = null;
  let pendingOp = null;
  let justEvaluated = false;

  const BUTTONS = [
    ["AC", "±", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "−"],
    ["1", "2", "3", "+"],
    ["0", ".", "="]
  ];

  function mount(container, opts) {
    render(container);
  }

  function render(container) {
    const el = document.createElement("div");
    el.className = "calculator-app";
    el.innerHTML = `<div class="calc-display">${formatDisplay()}</div>
      <div class="calc-grid"></div>`;
    container.appendChild(el);
    const grid = el.querySelector(".calc-grid");
    BUTTONS.forEach((row) => {
      row.forEach((label) => {
        const btn = document.createElement("button");
        btn.className = "calc-btn" + (["÷", "×", "−", "+", "="].includes(label) ? " op" : "") + (["AC", "±", "%"].includes(label) ? " fn" : "") + (label === "0" ? " zero" : "");
        btn.textContent = label;
        btn.addEventListener("click", () => { press(label); refresh(container); });
        grid.appendChild(btn);
      });
    });
  }

  function refresh(container) {
    container.innerHTML = "";
    render(container);
  }

  function formatDisplay() {
    if (display.length > 9) {
      const num = parseFloat(display);
      return num.toExponential(3);
    }
    return display;
  }

  function press(label) {
    if (/[0-9]/.test(label)) {
      if (display === "0" || justEvaluated) { display = label; justEvaluated = false; }
      else display += label;
      return;
    }
    if (label === ".") {
      if (justEvaluated) { display = "0."; justEvaluated = false; return; }
      if (!display.includes(".")) display += ".";
      return;
    }
    if (label === "AC") { display = "0"; stored = null; pendingOp = null; justEvaluated = false; return; }
    if (label === "±") { display = String(parseFloat(display) * -1); return; }
    if (label === "%") { display = String(parseFloat(display) / 100); return; }
    if (["÷", "×", "−", "+"].includes(label)) {
      if (stored !== null && pendingOp && !justEvaluated) evaluate();
      stored = parseFloat(display);
      pendingOp = label;
      justEvaluated = true;
      return;
    }
    if (label === "=") { evaluate(); return; }
  }

  function evaluate() {
    if (stored === null || !pendingOp) return;
    const b = parseFloat(display);
    let result = b;
    switch (pendingOp) {
      case "÷": result = b === 0 ? NaN : stored / b; break;
      case "×": result = stored * b; break;
      case "−": result = stored - b; break;
      case "+": result = stored + b; break;
    }
    display = Number.isFinite(result) ? String(Math.round(result * 1e10) / 1e10) : "Error";
    stored = null;
    pendingOp = null;
    justEvaluated = true;
  }

  OS.multitasking.registerApp({
    id: "calculator",
    name: "Calculator",
    icon: OS.icons.svg("calculator"),
    color: "#ff9500",
    duoCapable: false,
    mount
  });
})();
