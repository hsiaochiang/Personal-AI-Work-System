/* ─── Knowledge Extraction Engine ─── */

/**
 * Category definitions with heuristic patterns.
 * Each category maps to a memory file in docs/memory/.
 */
const CATEGORIES = {
  'project-context': {
    label: '專案背景',
    icon: 'info',
    filename: 'project-context.md',
    patterns: [
      /(?:專案|project|系統|平台)(?:目的|目標|用途|定位|是|為)/i,
      /(?:技術|tech)?\s*(?:stack|架構|堆疊)/i,
      /(?:使用|用了?|基於|採用)\s*(?:Node|React|Vue|Python|TypeScript|Bun|Deno)/i,
      /(?:目前|現在)(?:階段|Phase|進度|狀態)/i,
      /(?:repo|repository|倉庫|專案結構)/i,
    ],
  },
  'preference-rules': {
    label: '偏好與規則',
    icon: 'tune',
    filename: 'preference-rules.md',
    patterns: [
      /(?:偏好|preference|習慣|規則|rule|原則)/i,
      /(?:不要|別|避免|不用|不需要|禁止)/i,
      /(?:一律|必須|always|never|強制|務必)/i,
      /(?:回覆|輸出|格式|風格)(?:要|應|用|採)/i,
      /(?:先|優先)(?:給|做|看|用|確認)/i,
    ],
  },
  'task-patterns': {
    label: '任務模式',
    icon: 'pattern',
    filename: 'task-patterns.md',
    patterns: [
      /(?:流程|workflow|步驟|順序|SOP)/i,
      /(?:每次|每當|開工|收尾|開始|結束)(?:時|前|後|都)/i,
      /(?:先做|再做|最後做|第一步|下一步)/i,
      /(?:commit|push|deploy|build|test)(?:前|後|時)/i,
      /(?:觸發|trigger|啟動|執行)/i,
    ],
  },
  'decision-log': {
    label: '決策記錄',
    icon: 'gavel',
    filename: 'decision-log.md',
    patterns: [
      /(?:決定|決策|定案|agreed|decided)/i,
      /(?:選擇|選了|採用了?|改用|換成)/i,
      /(?:原因|理由|because|因為|考量)/i,
      /(?:不做|放棄|排除|reject)/i,
      /(?:trade-?off|權衡|取捨)/i,
    ],
  },
  'output-patterns': {
    label: '輸出模式',
    icon: 'output',
    filename: 'output-patterns.md',
    patterns: [
      /(?:輸出|output|產出|deliverable)/i,
      /(?:格式|format|模板|template)/i,
      /(?:文件|檔案|file)(?:結構|命名|位置|路徑)/i,
      /(?:命名|naming)(?:規則|convention)/i,
    ],
  },
  'skill-candidates': {
    label: '技能候選',
    icon: 'school',
    filename: 'skill-candidates.md',
    patterns: [
      /(?:技能|skill|能力|competency)/i,
      /(?:學會|學到|掌握|熟悉)/i,
      /(?:工具|tool|套件|library|framework)/i,
      /(?:可以用|適合用|推薦用)/i,
    ],
  },
};

let candidates = [];
let memorySnapshot = {};

/* ─── Init ─── */
document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.getElementById('input-text');
  const charCount = document.getElementById('char-count');

  inputEl.addEventListener('input', () => {
    charCount.textContent = inputEl.value.length + ' 字';
  });

  document.getElementById('btn-extract').addEventListener('click', runExtraction);
  document.getElementById('btn-writeback').addEventListener('click', runWriteback);
  document.getElementById('btn-back').addEventListener('click', goBack);
  document.getElementById('btn-restart').addEventListener('click', restart);
});

/* ─── Step 1 → Step 2: Extract ─── */
async function runExtraction() {
  const text = document.getElementById('input-text').value.trim();
  if (!text) return;

  // Load current memory for dedup
  try {
    const data = await apiFetch('/api/memory');
    data.files.forEach(f => {
      memorySnapshot[f.filename] = f.content;
    });
  } catch { /* continue without dedup */ }

  // Extract candidates
  candidates = extractCandidates(text);

  if (candidates.length === 0) {
    document.getElementById('candidates-list').innerHTML =
      '<div class="empty-state"><span class="material-symbols-outlined">search_off</span><p>未找到候選知識項目。請嘗試貼上更多對話內容。</p></div>';
  } else {
    renderCandidates();
  }

  document.getElementById('step-input').classList.add('hidden');
  document.getElementById('step-review').classList.remove('hidden');
  updateSummary();
}

/**
 * Heuristic extraction: split text into paragraphs/sentences,
 * score each against category patterns, yield candidates above threshold.
 */
function extractCandidates(text) {
  const results = [];
  // Split into meaningful chunks (paragraphs or multi-line blocks)
  const chunks = splitIntoChunks(text);
  const seen = new Set();

  chunks.forEach((chunk, idx) => {
    const trimmed = chunk.trim();
    if (trimmed.length < 10) return; // too short

    // Score against each category
    let bestCategory = null;
    let bestScore = 0;

    for (const [catKey, cat] of Object.entries(CATEGORIES)) {
      let score = 0;
      cat.patterns.forEach(pattern => {
        if (pattern.test(trimmed)) score += 1;
      });
      // Normalize score
      const normalized = score / cat.patterns.length;
      if (normalized > bestScore) {
        bestScore = normalized;
        bestCategory = catKey;
      }
    }

    if (bestCategory && bestScore >= 0.2) {
      // Extract the key statement (first meaningful line)
      const keyLine = trimmed.split('\n')[0].replace(/^[-*•>#\d.)\s]+/, '').trim();
      const dedupeKey = keyLine.substring(0, 60).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-');

      // Check dedup against memory snapshot
      const targetFile = CATEGORIES[bestCategory].filename;
      const existingContent = memorySnapshot[targetFile] || '';
      if (existingContent.includes(keyLine)) return; // already exists
      if (seen.has(dedupeKey)) return;
      seen.add(dedupeKey);

      const confidence = Math.min(0.95, bestScore * 0.6 + 0.3);

      results.push({
        id: 'cand-' + (idx + 1),
        category: bestCategory,
        content: trimmed,
        keyLine: keyLine,
        dedupeKey: dedupeKey,
        confidence: confidence,
        decision: confidence >= 0.6 ? 'pending' : 'rejected',
        editedContent: null,
      });
    }
  });

  // Sort by confidence desc
  results.sort((a, b) => b.confidence - a.confidence);
  return results;
}

function splitIntoChunks(text) {
  // Split by double newlines or markdown headers
  const raw = text.split(/\n{2,}|(?=^#{1,3}\s)/m);
  const chunks = [];
  raw.forEach(block => {
    const trimmed = block.trim();
    if (trimmed.length > 0) {
      // If block is very long, split by single newlines as sentences
      if (trimmed.length > 500) {
        const lines = trimmed.split('\n');
        let current = '';
        lines.forEach(line => {
          current += line + '\n';
          if (current.length > 150) {
            chunks.push(current.trim());
            current = '';
          }
        });
        if (current.trim()) chunks.push(current.trim());
      } else {
        chunks.push(trimmed);
      }
    }
  });
  return chunks;
}

/* ─── Render Candidates ─── */
function renderCandidates() {
  const container = document.getElementById('candidates-list');
  container.innerHTML = '';

  candidates.forEach((cand, idx) => {
    const cat = CATEGORIES[cand.category];
    const card = document.createElement('div');
    card.className = 'candidate-card' + (cand.decision === 'rejected' ? ' rejected' : '');
    card.dataset.idx = idx;

    card.innerHTML = `
      <div class="candidate-header">
        <div class="candidate-category">
          <span class="material-symbols-outlined">${escapeHTML(cat.icon)}</span>
          <span>${escapeHTML(cat.label)}</span>
          <span class="confidence-badge">${(cand.confidence * 100).toFixed(0)}%</span>
        </div>
        <div class="candidate-actions">
          <button class="btn-icon adopt" title="採用" data-action="adopt">
            <span class="material-symbols-outlined">check_circle</span>
          </button>
          <button class="btn-icon reject" title="拒絕" data-action="reject">
            <span class="material-symbols-outlined">cancel</span>
          </button>
        </div>
      </div>
      <div class="candidate-content">${escapeHTML(cand.keyLine)}</div>
      <div class="candidate-target">→ ${escapeHTML(cat.filename)}</div>
      <textarea class="candidate-edit hidden" rows="3">${escapeHTML(cand.content)}</textarea>
      <button class="btn-text toggle-edit" data-action="toggle-edit">
        <span class="material-symbols-outlined">edit</span> 編輯內容
      </button>
    `;

    // Event delegation
    card.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (!action) return;

      if (action === 'adopt') {
        cand.decision = 'pending'; // mark as adopted-pending
        card.classList.remove('rejected');
      } else if (action === 'reject') {
        cand.decision = 'rejected';
        card.classList.add('rejected');
      } else if (action === 'toggle-edit') {
        const editArea = card.querySelector('.candidate-edit');
        editArea.classList.toggle('hidden');
        if (!editArea.classList.contains('hidden')) {
          editArea.focus();
          editArea.addEventListener('input', () => {
            cand.editedContent = editArea.value;
          }, { once: false });
        }
      }
      updateSummary();
    });

    container.appendChild(card);
  });
}

function updateSummary() {
  const adopted = candidates.filter(c => c.decision !== 'rejected').length;
  const rejected = candidates.filter(c => c.decision === 'rejected').length;
  document.getElementById('review-summary').textContent =
    `${adopted} 採用 / ${rejected} 拒絕 / 共 ${candidates.length} 項`;
}

/* ─── Step 2 → Step 3: Writeback ─── */
async function runWriteback() {
  const toWrite = candidates.filter(c => c.decision !== 'rejected');
  if (toWrite.length === 0) {
    alert('沒有已採用的候選項目');
    return;
  }

  const resultContainer = document.getElementById('writeback-result');
  resultContainer.innerHTML = '';

  // Group by target file
  const groups = {};
  toWrite.forEach(cand => {
    const filename = CATEGORIES[cand.category].filename;
    if (!groups[filename]) groups[filename] = [];
    const content = cand.editedContent || cand.content;
    groups[filename].push(content);
  });

  const results = [];

  for (const [filename, items] of Object.entries(groups)) {
    try {
      // Read current content first
      const memData = await apiFetch('/api/memory');
      const file = memData.files.find(f => f.filename === filename);
      let currentContent = file ? file.content : '';

      // Append new items
      const newSection = '\n\n## 提取於 ' + new Date().toISOString().slice(0, 10) + '\n\n' +
        items.map(item => '- ' + item.split('\n')[0].replace(/^[-*•>#\d.)\s]+/, '').trim()).join('\n');

      const updatedContent = currentContent.trimEnd() + newSection + '\n';

      // Write back
      const writeRes = await fetch('/api/memory/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content: updatedContent }),
      });
      const writeData = await writeRes.json();

      if (writeData.success) {
        results.push({ filename, count: items.length, ok: true });
      } else {
        results.push({ filename, count: items.length, ok: false, error: writeData.error });
      }
    } catch (e) {
      results.push({ filename, count: items.length, ok: false, error: e.message });
    }
  }

  // Render results
  results.forEach(r => {
    const div = document.createElement('div');
    div.className = 'writeback-item ' + (r.ok ? 'success' : 'failure');
    const icon = r.ok ? 'check_circle' : 'error';
    const msg = r.ok
      ? `${r.filename} — 成功寫入 ${r.count} 項`
      : `${r.filename} — 失敗: ${r.error}`;
    div.innerHTML = `<span class="material-symbols-outlined">${icon}</span><span>${escapeHTML(msg)}</span>`;
    resultContainer.appendChild(div);
  });

  document.getElementById('step-review').classList.add('hidden');
  document.getElementById('step-result').classList.remove('hidden');
}

/* ─── Navigation ─── */
function goBack() {
  document.getElementById('step-review').classList.add('hidden');
  document.getElementById('step-input').classList.remove('hidden');
}

function restart() {
  candidates = [];
  memorySnapshot = {};
  document.getElementById('input-text').value = '';
  document.getElementById('char-count').textContent = '0 字';
  document.getElementById('step-result').classList.add('hidden');
  document.getElementById('step-input').classList.remove('hidden');
}
