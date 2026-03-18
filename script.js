let allData = [];
let currentRadical = "all";

const csvFile = document.getElementById("csvFile");
const loadStatus = document.getElementById("loadStatus");
const loadArea = document.getElementById("loadArea");
const filterArea = document.getElementById("filterArea");
const radicalBtns = document.getElementById("radicalButtons");
const cardsGrid = document.getElementById("cardsGrid");
const emptyState = document.getElementById("emptyState");
const resultCount = document.getElementById("resultCount");

csvFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const text = ev.target.result;
    parseCSV(text);
  };
  reader.readAsText(file, "UTF-8");
});

function parseCSV(text) {
  // 改行コード統一
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const data = [];

  // 1行目はヘッダーとして飛ばす
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // カンマ区切りをパース（ダブルクォート対応）
    const cols = parseCSVLine(line);
    if (cols.length < 4) continue;

    data.push({
      word: cols[0].trim(),
      reading: cols[1].trim(),
      radical: cols[2].trim(),
      desc: cols[3].trim(),
    });
  }

  if (data.length === 0) {
    loadStatus.textContent =
      "⚠️ データが読み込めなかったよ。形式を確認してね。";
    loadStatus.className = "load-status";
    return;
  }

  allData = data;
  currentRadical = "all";

  loadStatus.textContent = `✅ ${data.length}件 読み込んだよ！`;
  loadStatus.className = "load-status ok";
  loadArea.classList.add("has-data");

  buildRadicalButtons();
  renderCards();
}

// CSVの1行をパース（ダブルクォート囲み対応）
function parseCSVLine(line) {
  const result = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuote && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQuote = !inQuote;
    } else if (c === "," && !inQuote) {
      result.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

function buildRadicalButtons() {
  // 部首の一覧を取得（重複なし・出現順）
  const radicals = [...new Set(allData.map((d) => d.radical).filter(Boolean))];

  radicalBtns.innerHTML = "";

  // 「すべて」ボタン
  const allBtn = document.createElement("button");
  allBtn.className = "radical-btn all-btn";
  allBtn.textContent = "すべて";
  allBtn.addEventListener("click", () => setRadical("all"));
  radicalBtns.appendChild(allBtn);

  // 各部首ボタン
  radicals.forEach((r) => {
    const btn = document.createElement("button");
    btn.className = "radical-btn";
    btn.textContent = r;
    btn.dataset.radical = r;
    btn.addEventListener("click", () => setRadical(r));
    radicalBtns.appendChild(btn);
  });

  filterArea.style.display = "block";
  updateActiveButton();
}

function setRadical(r) {
  currentRadical = r;
  updateActiveButton();
  renderCards();
}

function updateActiveButton() {
  const btns = radicalBtns.querySelectorAll(".radical-btn");
  btns.forEach((btn) => {
    if (btn.classList.contains("all-btn")) {
      btn.classList.toggle("active", currentRadical === "all");
    } else {
      btn.classList.toggle("active", btn.dataset.radical === currentRadical);
    }
  });
}

function renderCards() {
  const filtered =
    currentRadical === "all"
      ? allData
      : allData.filter((d) => d.radical === currentRadical);

  emptyState.style.display =
    filtered.length === 0 && allData.length === 0 ? "block" : "none";
  resultCount.style.display = allData.length > 0 ? "block" : "none";
  resultCount.textContent = `${filtered.length} 件表示中`;

  cardsGrid.innerHTML = "";

  if (filtered.length === 0 && allData.length > 0) {
    cardsGrid.innerHTML =
      '<div style="grid-column:1/-1;text-align:center;color:var(--brown-light);padding:40px">該当する単語が見つからなかったよ🦫</div>';
    return;
  }

  filtered.forEach((item, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.animationDelay = `${Math.min(i * 30, 300)}ms`;
    card.innerHTML = `
        <div class="card-word">${escHtml(item.word)}</div>
        <div class="card-reading">${escHtml(item.reading)}</div>
        ${item.radical ? `<span class="card-radical">部首：${escHtml(item.radical)}</span>` : ""}
        <div class="card-desc">${escHtml(item.desc)}</div>
      `;
    cardsGrid.appendChild(card);
  });
}

function escHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
