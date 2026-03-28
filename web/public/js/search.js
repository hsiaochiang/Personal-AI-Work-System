/* ─── Global Search ─── */

let allSearchData = null;

document.addEventListener('DOMContentLoaded', async () => {
  const input = document.getElementById('global-search-input');
  const clearBtn = document.getElementById('global-search-clear');

  // Load all data upfront
  await preloadData();

  input.addEventListener('input', () => {
    const q = input.value.trim();
    clearBtn.classList.toggle('hidden', !q);
    runSearch(q);
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.add('hidden');
    runSearch('');
  });
});

async function preloadData() {
  const status = document.getElementById('search-status');
  status.style.display = 'block';
  status.textContent = '正在載入所有資料…';
  try {
    const [memData, decData, rulesData, roadmapData] = await Promise.all([
      apiFetch('/api/memory').catch(() => null),
      apiFetch('/api/decisions').catch(() => null),
      apiFetch('/api/rules').catch(() => null),
      apiFetch('/api/roadmap').catch(() => null),
    ]);
    allSearchData = { memData, decData, rulesData, roadmapData };
    status.textContent = '資料已載入，請輸入關鍵字搜尋';
  } catch {
    status.textContent = '部分資料載入失敗，搜尋範圍可能不完整';
    allSearchData = {};
  }
}

function runSearch(query) {
  const resultsEl = document.getElementById('search-results');
  const status = document.getElementById('search-status');

  if (!query) {
    resultsEl.innerHTML = '';
    status.textContent = '資料已載入，請輸入關鍵字搜尋';
    return;
  }

  const q = query.toLowerCase();
  const groups = [];

  // Memory files
  if (allSearchData?.memData?.files) {
    const hits = [];
    allSearchData.memData.files.forEach(file => {
      (file.content || '').split('\n').forEach(line => {
        if (line.toLowerCase().includes(q) && line.trim()) {
          hits.push({ title: file.filename, snippet: line.trim() });
        }
      });
    });
    if (hits.length) groups.push({ icon: 'psychology', label: '專案記憶', items: hits.slice(0, 20) });
  }

  // Decisions
  if (allSearchData?.decData) {
    const hits = [];
    ['operational', 'memory'].forEach(key => {
      (allSearchData.decData[key] || '').split('\n').forEach(line => {
        if (line.toLowerCase().includes(q) && line.trim() && !line.startsWith('|---')) {
          hits.push({ title: '決策記錄', snippet: line.replace(/^\|/, '').replace(/\|$/, '').trim() });
        }
      });
    });
    if (hits.length) groups.push({ icon: 'gavel', label: '決策記錄', items: hits.slice(0, 20) });
  }

  // Rules
  if (allSearchData?.rulesData?.files) {
    const hits = [];
    allSearchData.rulesData.files.forEach(file => {
      (file.content || '').split('\n').forEach(line => {
        if (line.toLowerCase().includes(q) && line.trim()) {
          hits.push({ title: file.filename.replace('.md', ''), snippet: line.trim() });
        }
      });
    });
    if (hits.length) groups.push({ icon: 'tune', label: '規則', items: hits.slice(0, 20) });
  }

  // Roadmap
  if (allSearchData?.roadmapData?.content) {
    const hits = [];
    allSearchData.roadmapData.content.split('\n').forEach(line => {
      if (line.toLowerCase().includes(q) && line.trim()) {
        hits.push({ title: 'Roadmap', snippet: line.trim() });
      }
    });
    if (hits.length) groups.push({ icon: 'map', label: 'Roadmap', items: hits.slice(0, 10) });
  }

  const total = groups.reduce((s, g) => s + g.items.length, 0);
  status.textContent = total
    ? `找到 ${total} 筆結果（每類最多顯示 20 筆）`
    : `找不到包含「${escapeHTML(query)}」的內容`;

  if (!groups.length) {
    showEmpty(resultsEl, 'search_off', `找不到包含「${query}」的內容`);
    return;
  }

  resultsEl.innerHTML = '';
  groups.forEach(group => {
    const section = document.createElement('div');
    section.className = 'search-results-group';

    const title = document.createElement('div');
    title.className = 'search-results-group-title';
    title.innerHTML =
      `<span class="material-symbols-outlined" style="font-size:16px">${escapeHTML(group.icon)}</span>` +
      `${escapeHTML(group.label)} <span style="font-weight:400;color:var(--outline)">(${group.items.length})</span>`;
    section.appendChild(title);

    group.items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'search-result-item';
      el.innerHTML =
        `<div class="search-result-title">${escapeHTML(item.title)}</div>` +
        `<div class="search-result-snippet">${highlightQuery(item.snippet, query)}</div>`;
      section.appendChild(el);
    });

    resultsEl.appendChild(section);
  });
}

function highlightQuery(text, query) {
  if (!query) return escapeHTML(text);
  const escaped = escapeHTML(text);
  // Escape special regex characters in query
  const safeQ = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedQ = escapeHTML(safeQ);
  return escaped.replace(new RegExp(escapedQ, 'gi'),
    match => `<mark class="search-highlight">${match}</mark>`);
}
