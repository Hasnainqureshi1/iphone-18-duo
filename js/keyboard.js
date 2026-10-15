/* ============================================================
   keyboard.js — custom on-screen keyboard (letters + numbers/symbols)
   ============================================================ */
(function () {
  "use strict";

  const LETTERS = [
    ["q","w","e","r","t","y","u","i","o","p"],
    ["a","s","d","f","g","h","j","k","l"],
    ["shift","z","x","c","v","b","n","m","delete"],
    ["123","emoji","space",".","return"]
  ];
  const NUMBERS = [
    ["1","2","3","4","5","6","7","8","9","0"],
    ["-","/",":",";","(",")","$","&","@","\""],
    ["#sym","_",".",",","?","!","'","delete"],
    ["ABC","emoji","space",".","return"]
  ];
  const SYMBOLS = [
    ["[","]","{","}","#","%","^","*","+","="],
    ["_","\\","|","~","<",">","€","£","¥","·"],
    ["#num",".",",","?","!","'","delete"],
    ["ABC","emoji","space",".","return"]
  ];

  const SAFE_CLASS_KEYS = new Set(["shift", "delete", "space", "return", "123", "ABC", "emoji"]);

  const LABELS = {
    shift: "⇧", delete: "⌫", space: "space", return: "return",
    "123": "123", ABC: "ABC", "#sym": "#+=", "#num": "123"
  };

  let activeTarget = null; // {getValue, setValue, onEnter}
  let shift = false;
  let side = "left";
  let mode = "letters"; // letters | numbers | symbols

  function build() {
    document.getElementById("keyboard-layer");
  }

  function rowsForMode() {
    if (mode === "numbers") return NUMBERS;
    if (mode === "symbols") return SYMBOLS;
    return LETTERS;
  }

  function render() {
    const layer = document.getElementById("keyboard-layer");
    if (!layer) return;
    layer.dataset.side = side;

    const kb = document.createElement("div");
    kb.className = "keyboard";
    rowsForMode().forEach((row) => {
      const rowEl = document.createElement("div");
      rowEl.className = "kb-row";
      row.forEach((key) => {
        const k = document.createElement("button");
        k.type = "button";
        k.className = "kb-key" + (SAFE_CLASS_KEYS.has(key) ? " kb-" + key : "");
        k.dataset.key = key;
        if (LABELS[key]) k.innerHTML = LABELS[key];
        else if (key === "emoji") k.innerHTML = OS.icons.glyph("smiley");
        else k.textContent = mode === "letters" && shift ? key.toUpperCase() : key;
        if (key === "shift" && shift) k.classList.add("active");
        k.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          handleKey(key);
        });
        rowEl.appendChild(k);
      });
      kb.appendChild(rowEl);
    });

    const moveBtn = document.createElement("button");
    moveBtn.className = "kb-move";
    moveBtn.type = "button";
    moveBtn.title = "Move keyboard to other screen";
    moveBtn.innerHTML = "⇄ Move keyboard";
    moveBtn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      moveToOtherScreen();
    });

    layer.innerHTML = "";
    layer.appendChild(kb);
    layer.appendChild(moveBtn);
  }

  function handleKey(key) {
    if (!activeTarget) return;
    let val = activeTarget.getValue();
    if (key === "shift") { shift = !shift; render(); return; }
    if (key === "123") { mode = "numbers"; render(); return; }
    if (key === "#sym") { mode = "symbols"; render(); return; }
    if (key === "#num") { mode = "numbers"; render(); return; }
    if (key === "ABC") { mode = "letters"; render(); return; }
    if (key === "emoji") return;
    if (key === "delete") {
      val = val.slice(0, -1);
    } else if (key === "space") {
      val += " ";
    } else if (key === "return") {
      if (activeTarget.onEnter) activeTarget.onEnter();
      return;
    } else {
      val += mode === "letters" && shift ? key.toUpperCase() : key;
      if (mode === "letters" && shift) { shift = false; render(); }
    }
    activeTarget.setValue(val);
  }

  function open(target, forSide) {
    activeTarget = target;
    side = forSide || side;
    mode = "letters";
    render();
    const layer = document.getElementById("keyboard-layer");
    layer.classList.add("open");
    document.body.classList.add("keyboard-open");
    applySpacing();
  }

  function close() {
    activeTarget = null;
    const layer = document.getElementById("keyboard-layer");
    if (layer) layer.classList.remove("open");
    document.body.classList.remove("keyboard-open");
    clearSpacing();
  }

  function applySpacing() {
    clearSpacing();
    const content = document.getElementById("content-" + side);
    if (content) content.classList.add("kb-space");
  }
  function clearSpacing() {
    ["left", "right"].forEach((s) => {
      const c = document.getElementById("content-" + s);
      if (c) c.classList.remove("kb-space");
    });
  }

  function moveToOtherScreen() {
    side = side === "left" ? "right" : "left";
    const layer = document.getElementById("keyboard-layer");
    layer.dataset.side = side;
    if (activeTarget) applySpacing();
  }

  function isOpen() {
    return !!activeTarget;
  }

  window.OS = window.OS || {};
  window.OS.keyboard = { open, close, isOpen, build };
})();
