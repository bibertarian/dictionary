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

// ===== 部首グループ対応表 =====
// ここに「部首 → グループ名」を追加していく
// ここにない部首は自動で「未分類」になる
const RADICAL_GROUP_MAP = {
  // 偏（へん）- 漢字の左側につく部首
  亻: "偏",
  氵: "偏",
  冫: "偏",
  扌: "偏",
  忄: "偏",
  阝: "偏",
  土: "偏",
  女: "偏",
  口: "偏",
  彳: "偏",
  犭: "偏",
  弓: "偏",
  山: "偏",
  巾: "偏",
  子: "偏",
  工: "偏",
  木: "偏",
  月: "偏",
  日: "偏",
  火: "偏",
  方: "偏",
  歹: "偏",
  牜: "偏",
  月: "偏",
  片: "偏",
  爿: "偏",
  禾: "偏",
  石: "偏",
  衤: "偏",
  目: "偏",
  田: "偏",
  矢: "偏",
  立: "偏",
  白: "偏",
  矛: "偏",
  瓦: "偏",
  糸: "偏",
  米: "偏",
  舟: "偏",
  虫: "偏",
  耳: "偏",
  耒: "偏",
  至: "偏",
  缶: "偏",
  舌: "偏",
  血: "偏",
  訁: "偏",
  言: "偏",
  貝: "偏",
  酉: "偏",
  車: "偏",
  角: "偏",
  釆: "偏",
  豸: "偏",
  身: "偏",
  里: "偏",
  赤: "偏",
  豆: "偏",
  谷: "偏",
  臣: "偏",
  豕: "偏",
  釒: "偏",
  金: "偏",
  青: "偏",
  長: "偏",
  革: "偏",
  音: "偏",
  面: "偏",
  首: "偏",
  香: "偏",
  馬: "偏",
  骨: "偏",
  韋: "偏",
  魚: "偏",
  鹿: "偏",
  麥: "偏",
  鳥: "偏",
  // 旁（つくり）- 漢字の右側につく部首
  乚: "旁",
  刂: "旁",
  力: "旁",
  又: "旁",
  卩: "旁",
  彡: "旁",
  寸: "旁",
  攵: "旁",
  欠: "旁",
  殳: "旁",
  斗: "旁",
  戈: "旁",
  斤: "旁",
  月: "旁",
  犬: "旁",
  皮: "旁",
  瓦: "旁",
  聿: "旁",
  艮: "旁",
  瓜: "旁",
  見: "旁",
  隹: "旁",
  隶: "旁",
  頁: "旁",
  韋: "旁",
  鳥: "旁",
  // 冠（かんむり）- 漢字の上につく部首
  人: "冠",
  入: "冠",
  亠: "冠",
  冖: "冠",
  八: "冠",
  宀: "冠",
  大: "冠",
  山: "冠",
  夂: "冠",
  耂: "冠",
  爫: "冠",
  戸: "冠",
  穴: "冠",
  罒: "冠",
  癶: "冠",
  覀: "冠",
  虍: "冠",
  羊: "冠",
  髟: "冠",
  麻: "冠",
  鼓: "冠",
  // 脚（あし）- 漢字の下につく部首
  儿: "脚",
  八: "脚",
  廾: "脚",
  心: "脚",
  灬: "脚",
  曰: "脚",
  皿: "脚",
  氺: "脚",
  舛: "脚",
  衣: "脚",
  貝: "脚",
  鳥: "脚",
  // 構（かまえ）- 漢字を囲む部首
  匚: "構",
  勹: "構",
  冂: "構",
  囗: "構",
  弋: "構",
  戈: "構",
  气: "構",
  行: "構",
  門: "構",
  鬥: "構",
  // 垂（たれ） - 漢字の上側から下側に垂れる部首
  厂: "垂",
  尸: "垂",
  广: "垂",
  戸: "垂",
  疒: "垂",
  凵: "垂",
  // 繞（にょう）- 漢字の左側から下側にかけて位置する部首
  廴: "繞",
  爪: "繞",
  毛: "繞",
  走: "繞",
  風: "繞",
  鬼: "繞",
};

// グループの表示順
const GROUP_ORDER = ["偏", "旁", "冠", "脚", "構", "垂", "繞", "未分類"];

// 部首からグループ名を返す
function getGroup(radical) {
  return RADICAL_GROUP_MAP[radical] || "未分類";
}

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
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const data = [];

  // 1行目はヘッダーとして飛ばす
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);
    if (cols.length < 4) continue;

    data.push({
      word: cols[0].trim(),
      reading: cols[1].trim(),
      radical: cols[2].trim(),
      desc: cols[3].trim(),
      image: cols[4] ? cols[4].trim() : "",
    });
  }

  if (data.length === 0) {
    loadStatus.textContent = "データが読み込めなかったよ。形式を確認してね。";
    loadStatus.className = "load-status";
    return;
  }

  allData = data;
  currentRadical = "all";

  loadStatus.textContent = `${data.length}件 読み込んだよ！`;
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
  // CSVに含まれる部首だけ取得（重複なし・出現順）
  const radicals = [...new Set(allData.map((d) => d.radical).filter(Boolean))];

  // グループ → 部首リスト のマップを作る
  const groupMap = {};
  GROUP_ORDER.forEach((g) => (groupMap[g] = []));

  radicals.forEach((r) => {
    const group = getGroup(r);
    if (!groupMap[group]) groupMap[group] = [];
    groupMap[group].push(r);
  });

  radicalBtns.innerHTML = "";

  // 「すべて」ボタンを最初の行に単独で置く
  const allGroup = document.createElement("div");
  allGroup.className = "radical-group";
  const allBtn = document.createElement("button");
  allBtn.className = "radical-btn all-btn";
  allBtn.textContent = "すべて";
  allBtn.addEventListener("click", () => setRadical("all"));
  allGroup.appendChild(allBtn);
  radicalBtns.appendChild(allGroup);

  // グループごとに行を作る（部首が1件もないグループは表示しない）
  GROUP_ORDER.forEach((groupName) => {
    const members = groupMap[groupName];
    if (!members || members.length === 0) return;

    const row = document.createElement("div");
    row.className = "radical-group";

    const label = document.createElement("span");
    label.className = "radical-group-label";
    label.textContent = groupName;
    row.appendChild(label);

    members.forEach((r) => {
      const btn = document.createElement("button");
      btn.className = "radical-btn";
      btn.textContent = r;
      btn.dataset.radical = r;
      btn.addEventListener("click", () => setRadical(r));
      row.appendChild(btn);
    });

    radicalBtns.appendChild(row);
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
      '<div style="grid-column:1/-1;text-align:center;color:var(--brown-light);padding:40px">該当する単語が見つからなかったよ</div>';
    return;
  }

  filtered.forEach((item, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.animationDelay = `${Math.min(i * 30, 300)}ms`;

    const imageHTML = item.image
      ? `<div class="card-image-wrap">
           <img
             class="card-image"
             src="${escHtml(item.image)}"
             alt="${escHtml(item.word)}"
             onerror="this.parentElement.classList.add('img-error'); this.parentElement.innerHTML='<span class=\\'img-error-msg\\'>画像が見つからなかったよ</span>'"
           />
         </div>`
      : "";

    card.innerHTML = `
        ${imageHTML}
        <div class="card-word">${escHtml(item.word)}</div>
        <div class="card-reading">${escHtml(item.reading)}</div>
        ${item.radical ? `<span class="card-radical">部首：${escHtml(item.radical)}</span>` : ""}
        <div class="card-desc">${escHtmlWithBr(item.desc)}</div>
      `;
    cardsGrid.appendChild(card);
  });

  // 画像クリックイベント
  const zoomback = document.getElementById("zoomback");
  const zoomimg = document.getElementById("zoomimg");

  if (zoomback && zoomimg) {
    document.querySelectorAll(".card-image").forEach(function (img) {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", function (e) {
        zoomimg.setAttribute("src", e.target.getAttribute("src"));
        zoomback.style.display = "flex";
      });
    });

    zoomback.onclick = function () {
      zoomback.style.display = "none";
    };
  }
}

function escHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escHtmlWithBr(str) {
  return escHtml(str).replace(/\n/g, "<br>");
}
