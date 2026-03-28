/* ─── Decisions & Rules Page ─── */

const RULE_FILE_LABELS = {
  'output-patterns.md': { label: '輸出模式', icon: 'output' },
  'preference-rules.md': { label: '偏好規則', icon: 'tune' },
  'task-patterns.md': { label: '任務模式', icon: 'pattern' },
};

let allDecisions = [];   // parsed decision items
let allRules = [];       // parsed rule items
let currentTab = 'decisions';
let currentRuleCat = null;
let searchQuery = '';

/* ─── Init ─── */
document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  initSearch();
  await loadData();
  renderAll();
});

/* ─── Data Loading ─── */
async function loadData() {
  const [decData, rulesData] = await Promise.all([
    apiFetch('/api/decisions').catch(() => null),
    apiFetch('/api/rules').catch(() => null),
  ]);

  if (decData) {
    allDecisions = [
      ...parseOperationalDecisions(decData.operational || ''),
      ...parseMemoryDecisions(decData.memory || ''),
    ];
    // Deduplicate by identical decision text
    const seen = new Set();
    allDecisions = allDecisions.filter(d => {
      const key = d.decision.substring(0, 80);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    // Sort newest first
    allDecisions.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }

  if (rulesData && rulesData.files) {
    rulesData.files.forEach(file => {
      const parsed = parseRuleFile(file.filename, file.content);
      allRules.push(...parsed);
    });
    detectConflicts(allRules);
  }
}

/* ─── Parse docs/decision-log.md (table format) ─── */
function parseOperationalDecisions(content) {
  const results = [];
  const lines = content.split('\n');
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) { inTable = false; continue; }

    const cells = trimmed.split('|').map(c => c.trim()).filter((_, i, a) => i > 0 && i < a.length - 1);
    if (cells.length < 2) continue;
    if (cells[0] === 'Date' || /^[-:]+$/.test(cells[0])) { inTable = true; continue; }
    if (!inTable) continue;

    const [date, decision, why, impact, evidence] = cells;
    if (decision && !/^[-:=]+$/.test(decision)) {
      results.push({
        id: 'op-' + results.length,
        date: date || '',
        decision: decision || '',
        why: why || '',
        impact: impact || '',
        evidence: evidence || '',
        source: 'log',
        conflict: false,
      });
    }
  }
  return results;
}

/* ─── Parse docs/memory/decision-log.md (heading format) ─── */
function parseMemoryDecisions(content) {
  const results = [];
  const lines = content.split('\n');
  let currentDate = '';
  let currentTitle = '';
  let buffer = [];
  let inDecision = false;

  const flush = () => {
    if (!currentTitle) return;
    const text = buffer.join('\n').trim();
    const contentMap = {};
    buffer.forEach(b => {
      const m = b.match(/^-\s*(.+?)：(.+)$/);
      if (m) contentMap[m[1].trim()] = m[2].trim();
    });
    results.push({
      id: 'mem-' + results.length,
      date: currentDate,
      decision: currentTitle.replace(/^決策[：:]\s*/, ''),
      why: contentMap['決策理由'] || '',
      impact: contentMap['影響範圍'] || '',
      evidence: '',
      source: 'memory',
      conflict: false,
    });
    buffer = [];
    currentTitle = '';
    inDecision = false;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^## \d{4}/.test(trimmed)) {
      flush();
      currentDate = trimmed.replace('## ', '').trim();
    } else if (/^### /.test(trimmed)) {
      flush();
      currentTitle = trimmed.replace('### ', '').trim();
      inDecision = true;
    } else if (inDecision && trimmed.startsWith('-')) {
      buffer.push(trimmed);
    }
  }
  flush();
  return results;
}

/* ─── Parse rule memory files ─── */
function parseRuleFile(filename, content) {
  const meta = RULE_FILE_LABELS[filename] || { label: filename, icon: 'rule' };
  const results = [];
  const lines = content.split('\n');
  let currentTitle = '';
  let currentBody = [];
  let inSection = false;

  const flush = () => {
    if (!currentTitle || currentTitle.startsWith('使用原則') || currentTitle.startsWith('觀察中')) return;
    results.push({
      id: filename + '-' + results.length,
      filename,
      category: meta.label,
      icon: meta.icon,
      title: currentTitle,
      body: currentBody.join('\n').trim(),
      conflict: false,
      conflictWith: [],
    });
    currentBody = [];
    currentTitle = '';
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^### /.test(trimmed)) {
      flush();
      currentTitle = trimmed.replace(/^### /, '');
      inSection = true;
    } else if (/^## /.test(trimmed)) {
      flush();
      inSection = false;
      currentTitle = ''; // section header, not a rule
    } else if (inSection && trimmed) {
      currentBody.push(trimmed);
    }
  }
  flush();
  return results;
}

/* ─── Conflict Detection ─── */
function detectConflicts(rules) {
  // Extract "normalized" statements: strip negations and compare nouns
  // Look for pairs where one affirms X and another negates X (same stem word)
  const negPrefixes = ['不要', '不得', '避免', '禁止', '不應', '不用', '不先', '不能'];

  for (let i = 0; i < rules.length; i++) {
    const textI = (rules[i].title + ' ' + rules[i].body).toLowerCase();

    for (let j = i + 1; j < rules.length; j++) {
      const textJ = (rules[j].title + ' ' + rules[j].body).toLowerCase();

      // Find negated phrases in i, check if j affirms them
      for (const neg of negPrefixes) {
        const negIdx = textI.indexOf(neg);
        if (negIdx === -1) continue;
        // Extract word after negation (up to 8 chars)
        const stem = textI.substring(negIdx + neg.length, negIdx + neg.length + 8).replace(/[^\u4e00-\u9fff\w]/g, '').substring(0, 5);
        if (stem.length < 2) continue;
        // Check if j positively contains the stem WITHOUT a negation in front
        const jIdx = textJ.indexOf(stem);
        if (jIdx > 0) {
          // Make sure j doesn't also negate it
          const before = textJ.substring(Math.max(0, jIdx - 4), jIdx);
          const jAlsoNegates = negPrefixes.some(n => before.includes(n));
          if (!jAlsoNegates) {
            rules[i].conflict = true;
            rules[j].conflict = true;
            rules[i].conflictWith.push(rules[j].id);
            rules[j].conflictWith.push(rules[i].id);
          }
        }
      }
    }
  }
}

/* ─── Render All ─── */
function renderAll() {
  updateCounts();
  renderDecisions();
  initRuleCats();
  renderRules();
}

function updateCounts() {
  const filteredDec = filterDecisions();
  const filteredRules = filterRules();
  document.getElementById('tab-count-decisions').textContent = filteredDec.length;
  document.getElementById('tab-count-rules').textContent = filteredRules.length;

  const conflicts = allRules.filter(r => r.conflict).length;
  const statsEl = document.getElementById('decisions-stats');
  statsEl.innerHTML =
    `<span>${allDecisions.length} 決策</span>` +
    `<span class="stat-sep">·</span>` +
    `<span>${allRules.length} 規則</span>` +
    (conflicts > 0
      ? `<span class="stat-sep">·</span><span class="stat-conflict"><span class="material-symbols-outlined">warning</span>${conflicts} 待確認衝突</span>`
      : '');
}

/* ─── Decisions Rendering ─── */
function filterDecisions() {
  if (!searchQuery) return allDecisions;
  const q = searchQuery.toLowerCase();
  return allDecisions.filter(d =>
    d.decision.toLowerCase().includes(q) ||
    d.why.toLowerCase().includes(q) ||
    d.impact.toLowerCase().includes(q) ||
    d.date.includes(q)
  );
}

function renderDecisions() {
  const container = document.getElementById('decisions-list');
  const items = filterDecisions();

  if (items.length === 0) {
    showEmpty(container, 'search_off', searchQuery ? `找不到包含「${searchQuery}」的決策` : '尚無決策記錄');
    return;
  }

  container.innerHTML = '';
  items.forEach(d => {
    const card = document.createElement('div');
    card.className = 'decision-card';

    const badgeClass = d.source === 'memory' ? 'source-memory' : 'source-log';
    const badgeLabel = d.source === 'memory' ? '記憶層' : '決策 Log';

    card.innerHTML = `
      <div class="decision-card-header">
        <div class="decision-meta">
          ${d.date ? `<span class="decision-date">${escapeHTML(d.date)}</span>` : ''}
          <span class="source-badge ${badgeClass}">${badgeLabel}</span>
        </div>
      </div>
      <div class="decision-title">${escapeHTML(d.decision)}</div>
      ${d.why ? `<div class="decision-field"><span class="decision-field-label">理由</span><span class="decision-field-value">${escapeHTML(d.why)}</span></div>` : ''}
      ${d.impact ? `<div class="decision-field"><span class="decision-field-label">影響</span><span class="decision-field-value">${escapeHTML(d.impact)}</span></div>` : ''}
      ${d.evidence ? `<div class="decision-field"><span class="decision-field-label">證據</span><span class="decision-field-value decision-evidence">${escapeHTML(d.evidence)}</span></div>` : ''}
    `;
    container.appendChild(card);
  });
}

/* ─── Rules Rendering ─── */
function initRuleCats() {
  const cats = [...new Set(allRules.map(r => r.category))];
  if (!currentRuleCat && cats.length > 0) currentRuleCat = cats[0];

  const container = document.getElementById('rule-cats');
  container.innerHTML = '';

  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'rule-cat-btn' + (cat === currentRuleCat ? ' active' : '');
    btn.dataset.cat = cat;
    const rule = allRules.find(r => r.category === cat);
    btn.innerHTML = `<span class="material-symbols-outlined">${escapeHTML(rule?.icon || 'rule')}</span>${escapeHTML(cat)}`;
    btn.addEventListener('click', () => {
      currentRuleCat = cat;
      container.querySelectorAll('.rule-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderRules();
    });
    container.appendChild(btn);
  });
}

function filterRules() {
  let rules = currentRuleCat ? allRules.filter(r => r.category === currentRuleCat) : allRules;
  if (!searchQuery) return rules;
  const q = searchQuery.toLowerCase();
  return rules.filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.body.toLowerCase().includes(q)
  );
}

function renderRules() {
  const container = document.getElementById('rules-list');
  const items = filterRules();

  if (items.length === 0) {
    showEmpty(container, 'search_off', searchQuery ? `找不到包含「${searchQuery}」的規則` : '此分類無規則');
    return;
  }

  container.innerHTML = '';
  const conflictCount = items.filter(r => r.conflict).length;

  if (conflictCount > 0) {
    const banner = document.createElement('div');
    banner.className = 'conflict-banner';
    banner.innerHTML = `<span class="material-symbols-outlined">warning</span>此分類有 ${conflictCount} 條規則可能存在邏輯矛盾，請人工確認`;
    container.appendChild(banner);
  }

  items.forEach(rule => {
    const card = document.createElement('div');
    card.className = 'rule-card' + (rule.conflict ? ' conflict' : '');

    const conflictBadge = rule.conflict
      ? `<span class="conflict-badge"><span class="material-symbols-outlined">warning</span>待確認衝突</span>`
      : '';

    // Parse body: extract key-value lines and list items
    const bodyLines = rule.body.split('\n').filter(l => l.trim());
    const bodyHtml = bodyLines.map(line => {
      const kv = line.match(/^-\s*(.+?)：(.+)$/);
      if (kv) {
        return `<div class="rule-kv"><span class="rule-kv-key">${escapeHTML(kv[1].trim())}</span><span class="rule-kv-val">${escapeHTML(kv[2].trim())}</span></div>`;
      }
      const bullet = line.match(/^[-*•]\s*(.+)$/);
      if (bullet) {
        return `<div class="rule-bullet">• ${escapeHTML(bullet[1].trim())}</div>`;
      }
      return `<div class="rule-bullet">${escapeHTML(line.trim())}</div>`;
    }).join('');

    card.innerHTML = `
      <div class="rule-card-header">
        <div class="rule-title">
          <span class="material-symbols-outlined rule-icon">${escapeHTML(rule.icon)}</span>
          ${escapeHTML(rule.title)}
        </div>
        ${conflictBadge}
      </div>
      <div class="rule-body">${bodyHtml}</div>
    `;
    container.appendChild(card);
  });
}

/* ─── Tabs ─── */
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
      btn.classList.add('active');
      currentTab = btn.dataset.tab;
      document.getElementById('panel-' + currentTab).classList.remove('hidden');
    });
  });
}

/* ─── Search ─── */
function initSearch() {
  const input = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');
  let debounceTimer;

  input.addEventListener('input', () => {
    searchQuery = input.value.trim();
    clearBtn.classList.toggle('hidden', !searchQuery);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      renderDecisions();
      renderRules();
      updateCounts();
    }, 200);
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    searchQuery = '';
    clearBtn.classList.add('hidden');
    renderDecisions();
    renderRules();
    updateCounts();
    input.focus();
  });
}
