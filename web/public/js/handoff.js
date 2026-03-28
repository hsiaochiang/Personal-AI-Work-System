/* ─── Handoff Builder ─── */

/** Template section definitions for each type */
const TEMPLATE_SECTIONS = {
  planning: [
    { key: 'clarify', title: '這次要釐清什麼', placeholder: '例：Phase 3 的 scope 和驗收標準' },
    { key: 'background', title: '已知背景', placeholder: '例：目前 Phase 2 已完成，dashboard 可用' },
    { key: 'decided', title: '已定案內容', placeholder: '例：使用 Node.js HTTP server，不用框架' },
    { key: 'undecided', title: '尚未定案內容', placeholder: '例：是否需要搜尋功能' },
    { key: 'output', title: '本輪希望產出的結果', placeholder: '例：Phase 3 的 spec 草稿' },
    { key: 'files', title: '相關檔案', placeholder: '例：docs/roadmap.md, docs/handoff/current-task.md' },
    { key: 'scope_in', title: '這次要討論', placeholder: '例：知識提取的 heuristic 規則' },
    { key: 'scope_out', title: '這次先不要展開', placeholder: '例：UI 美化、多專案支援' },
    { key: 'writeback', title: '完成後應回寫的文件', placeholder: '例：decision-log.md, task-patterns.md' },
  ],
  implementation: [
    { key: 'do', title: '這次要做什麼', placeholder: '例：建立 Handoff Builder 頁面' },
    { key: 'dont', title: '這次不要做什麼', placeholder: '例：不做 UI 動畫、不做多專案' },
    { key: 'background', title: '任務背景', placeholder: '例：知識閉環是最高優先' },
    { key: 'principles', title: '已定案原則', placeholder: '例：純靜態 HTML+JS，不用框架' },
    { key: 'files', title: '相關檔案', placeholder: '例：web/server.js, web/public/js/app.js' },
    { key: 'acceptance', title: '驗收標準', placeholder: '例：使用者可複製完整 handoff 文件' },
    { key: 'done', title: '已完成', placeholder: '例：server.js API 端點已建立' },
    { key: 'todo', title: '尚未完成', placeholder: '例：handoff.html 頁面建立' },
    { key: 'risks', title: '已知風險或注意事項', placeholder: '例：樣板欄位順序可能需調整' },
    { key: 'order', title: '建議工作順序', placeholder: '例：1. 建 API 2. 建頁面 3. 測試', multiline: true },
    { key: 'writeback', title: '完成後應回寫的文件', placeholder: '例：decision-log.md, task-patterns.md' },
  ],
  integration: [
    { key: 'purpose', title: '本次整合目的', placeholder: '例：合併 feature branch 到 main' },
    { key: 'sources', title: '需要整合的來源', placeholder: '例：對話串 / 分支名 / 文件路徑' },
    { key: 'done', title: '已完成內容', placeholder: '例：API 端點已合併' },
    { key: 'pending', title: '待確認內容', placeholder: '例：CSS 命名是否衝突' },
    { key: 'conflicts', title: '可能衝突點', placeholder: '例：style.css 的 .card 樣式' },
    { key: 'update_files', title: '整合後要更新的文件', placeholder: '例：README.md, decision-log.md' },
    { key: 'acceptance', title: '驗收標準', placeholder: '例：所有頁面正常載入，API 回傳正確' },
  ],
};

const TYPE_LABELS = {
  planning: '規劃型 Handoff',
  implementation: '實作型 Handoff',
  integration: '整合型 Handoff',
};

const TYPE_TITLES = {
  planning: 'Planning Handoff',
  implementation: 'Implementation Handoff',
  integration: 'Integration Handoff',
};

let currentType = 'planning';
let formData = {};

/* ─── Init ─── */
document.addEventListener('DOMContentLoaded', () => {
  initTemplateSelector();
  renderForm();
  updatePreview();

  document.getElementById('btn-copy').addEventListener('click', copyToClipboard);
  document.getElementById('btn-clear').addEventListener('click', clearForm);
});

function initTemplateSelector() {
  const selector = document.getElementById('template-selector');
  selector.addEventListener('click', (e) => {
    const btn = e.target.closest('.template-btn');
    if (!btn) return;
    selector.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentType = btn.dataset.type;
    renderForm();
    updatePreview();
  });
}

function renderForm() {
  const container = document.getElementById('handoff-form');
  const sections = TEMPLATE_SECTIONS[currentType];
  if (!formData[currentType]) formData[currentType] = {};

  container.innerHTML = '';
  sections.forEach(section => {
    const group = document.createElement('div');
    group.className = 'form-group';

    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = section.title;
    group.appendChild(label);

    const textarea = document.createElement('textarea');
    textarea.className = 'form-textarea';
    textarea.placeholder = section.placeholder;
    textarea.rows = section.multiline ? 5 : 3;
    textarea.dataset.key = section.key;
    textarea.value = formData[currentType][section.key] || '';
    textarea.addEventListener('input', (e) => {
      formData[currentType][section.key] = e.target.value;
      updatePreview();
    });
    group.appendChild(textarea);

    container.appendChild(group);
  });
}

function updatePreview() {
  const preview = document.getElementById('handoff-preview');
  const md = generateMarkdown();
  preview.textContent = md;
}

function generateMarkdown() {
  const sections = TEMPLATE_SECTIONS[currentType];
  const data = formData[currentType] || {};
  const title = TYPE_TITLES[currentType];

  let lines = [`# ${title}`, ''];

  sections.forEach(section => {
    const value = (data[section.key] || '').trim();
    lines.push(`## ${section.title}`);
    lines.push('');
    if (value) {
      // Split into bullet list items
      const items = value.split('\n').filter(l => l.trim());
      items.forEach(item => {
        const trimmed = item.replace(/^[-*•]\s*/, '');
        lines.push(`- ${trimmed}`);
      });
    } else {
      lines.push('- ');
    }
    lines.push('');
  });

  return lines.join('\n');
}

async function copyToClipboard() {
  const md = generateMarkdown();
  try {
    await navigator.clipboard.writeText(md);
    const toast = document.getElementById('copy-toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  } catch {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = md;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    const toast = document.getElementById('copy-toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }
}

function clearForm() {
  formData[currentType] = {};
  renderForm();
  updatePreview();
}
