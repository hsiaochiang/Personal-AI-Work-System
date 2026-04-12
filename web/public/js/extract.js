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
let selectedImportFile = null;
let selectedConversationDoc = null;
let selectedCopilotSession = null;
let selectedChatGPTApiSession = null;
let copilotSessions = [];
let chatgptApiSessions = [];
let openAISettings = {
  configured: false,
  maskedKey: '',
  updatedAt: null,
};
let hydratingInputFromFile = false;
let copilotPathWasEdited = false;
let selectedImportSource = 'plain';

const IMPORT_SOURCE_CONFIG = {
  plain: {
    hint: '支援格式：一般對話或人工整理後的純文字貼上。限制：不做 ChatGPT / Gemini / Claude / Copilot 格式偵測，直接走 plain text adapter。',
    placeholder: '將一般對話內容貼在這裡…\n\n這個模式會直接使用 PlainTextAdapter。\n\n提取引擎會依內容嘗試識別：\n• 專案背景資訊 → project-context.md\n• 偏好與規則 → preference-rules.md\n• 任務模式 → task-patterns.md\n• 決策記錄 → decision-log.md\n• 輸出模式 → output-patterns.md\n• 技能候選 → skill-candidates.md',
    statusMessage: '純文字模式已就緒，可直接貼上一般對話內容。',
    statusIcon: 'notes',
  },
  chatgpt: {
    hint: '支援格式：ChatGPT transcript、官方 conversation JSON / TXT，或已追蹤的 OpenAI platform conversation API session。限制：API 載入前需先在 /settings 設定 key 並追蹤 conversationId。',
    placeholder: '將 ChatGPT transcript 貼在這裡，或先上傳官方 JSON / TXT 檔案…\n\n支援輸入：\n• ChatGPT 分享頁 transcript（You / ChatGPT turns）\n• ChatGPT conversation JSON 匯出內容\n• 已追蹤的 OpenAI platform conversation API 載入結果\n\n提取引擎會使用 ChatGPTAdapter 或已載入的 API ConversationDoc。',
    statusMessage: 'ChatGPT 模式已就緒，可貼上 transcript、上傳 JSON / TXT，或載入 API session。',
    statusIcon: 'forum',
  },
  gemini: {
    hint: '支援格式：Gemini 網頁複製的 transcript 全文或含 You / Gemini turn 標頭的貼上文字。限制：本輪不支援 API 載入或檔案上傳。',
    placeholder: '將 Gemini transcript 貼在這裡…\n\n支援輸入：\n• Gemini 網頁複製的對話全文\n• 具有 You / Gemini turn 標頭的 transcript\n\n提取引擎會使用 GeminiAdapter，而不是 plain text fallback。',
    statusMessage: 'Gemini 模式已就緒，可直接貼上 Gemini transcript。',
    statusIcon: 'star',
  },
  claude: {
    hint: '支援格式：Claude.ai transcript 全文或含 Human / Assistant / Claude 標頭的貼上文字。限制：本輪不支援 API 載入或檔案上傳。',
    placeholder: '將 Claude transcript 貼在這裡…\n\n支援輸入：\n• Claude.ai 網頁複製的對話全文\n• 具有 Human / Assistant / Claude 標頭的 transcript\n\n提取引擎會使用 ClaudeAdapter，而不是 plain text fallback。',
    statusMessage: 'Claude 模式已就緒，可直接貼上 Claude transcript。',
    statusIcon: 'psychology',
  },
  copilot: {
    hint: '支援格式：本機 VS Code Copilot Chat session JSONL。限制：需先從 session 清單載入一筆對話，不能直接手動貼上當成 Copilot source。',
    placeholder: '先從上方載入一筆 VS Code Copilot session…\n\n載入後這裡會顯示對話預覽；若你手動編輯內容，系統會退出 Copilot 匯入模式。',
    statusMessage: 'Copilot 模式已就緒，請先載入一筆本機 session。',
    statusIcon: 'hub',
  },
};

function getConversationAdapterAPI() {
  if (!window.ConversationAdapters) {
    throw new Error('ConversationAdapters 未載入');
  }
  return window.ConversationAdapters;
}

function getMemorySourceUtilsAPI() {
  if (!window.MemorySourceUtils) {
    throw new Error('MemorySourceUtils 未載入');
  }
  return window.MemorySourceUtils;
}

/* ─── Init ─── */
document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.getElementById('input-text');
  const charCount = document.getElementById('char-count');
  const sourceSelect = document.getElementById('import-source-select');
  const uploadButton = document.getElementById('btn-upload-file');
  const fileInput = document.getElementById('input-file');
  const copilotPathInput = document.getElementById('copilot-session-path');
  const refreshCopilotButton = document.getElementById('btn-refresh-copilot');
  const refreshChatGPTSessionsButton = document.getElementById('btn-refresh-chatgpt-sessions');
  const trackChatGPTSessionButton = document.getElementById('btn-track-chatgpt-session');

  inputEl.addEventListener('input', () => {
    charCount.textContent = inputEl.value.length + ' 字';

    if (!hydratingInputFromFile && (selectedImportFile || selectedConversationDoc)) {
      clearImportedContentState(getManualEditResetMessage(), 'edit');
    }
  });

  sourceSelect.addEventListener('change', (event) => {
    setImportSource(event.target.value);
  });
  copilotPathInput.addEventListener('input', () => {
    copilotPathWasEdited = true;
  });
  uploadButton.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleImportFile);
  refreshCopilotButton.addEventListener('click', refreshCopilotSessions);
  refreshChatGPTSessionsButton.addEventListener('click', refreshChatGPTApiSessions);
  trackChatGPTSessionButton.addEventListener('click', trackChatGPTConversation);
  document.getElementById('btn-extract').addEventListener('click', runExtraction);
  document.getElementById('btn-writeback').addEventListener('click', runWriteback);
  document.getElementById('btn-back').addEventListener('click', goBack);
  document.getElementById('btn-restart').addEventListener('click', restart);
  document.getElementById('btn-adopt-all').addEventListener('click', adoptAll);
  document.getElementById('btn-reject-all').addEventListener('click', rejectAll);
  document.getElementById('btn-reset-decisions').addEventListener('click', resetDecisions);

  setImportSource(selectedImportSource, { clearImportedState: false });
  refreshCopilotSessions();
  refreshOpenAISettings();
  refreshChatGPTApiSessions();
});

async function handleImportFile(event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  try {
    const content = await file.text();
    const inputEl = document.getElementById('input-text');
    const charCount = document.getElementById('char-count');

    hydratingInputFromFile = true;
    inputEl.value = content;
    charCount.textContent = `${content.length} 字`;
    hydratingInputFromFile = false;

    selectedConversationDoc = null;
    selectedCopilotSession = null;
    selectedChatGPTApiSession = null;
    selectedImportFile = {
      name: file.name,
      type: file.type || '',
    };

    renderCopilotSessions();
    updateImportStatus(`已載入 ${file.name}，可直接按「提取候選知識」。`, 'upload_file');
  } catch (error) {
    hydratingInputFromFile = false;
    selectedImportFile = null;
    alert(`讀取檔案失敗：${error.message}`);
  } finally {
    event.target.value = '';
  }
}

function updateImportStatus(message, icon) {
  const statusEl = document.getElementById('import-status');
  statusEl.innerHTML = `<span class="material-symbols-outlined">${escapeHTML(icon)}</span><span>${escapeHTML(message)}</span>`;
}

function updateCopilotStatus(message, icon) {
  const statusEl = document.getElementById('copilot-status');
  statusEl.innerHTML = `<span class="material-symbols-outlined">${escapeHTML(icon)}</span><span>${escapeHTML(message)}</span>`;
}

function updateChatGPTApiStatus(message, icon) {
  const statusEl = document.getElementById('chatgpt-api-status');
  statusEl.innerHTML = `<span class="material-symbols-outlined">${escapeHTML(icon)}</span><span>${escapeHTML(message)}</span>`;
}

function getCopilotSessionDir() {
  return document.getElementById('copilot-session-path').value.trim();
}

function getImportSourceConfig(source) {
  return IMPORT_SOURCE_CONFIG[source] || IMPORT_SOURCE_CONFIG.plain;
}

function getCurrentSourcePresentation(source) {
  return getMemorySourceUtilsAPI().getMemorySourcePresentation(source) || {
    label: source,
    className: 'source-custom',
  };
}

function getManualEditResetMessage() {
  if (selectedImportSource === 'copilot') {
    return '已離開 Copilot session 載入狀態；若要用 Copilot 模式提取，請重新選擇一筆 session。';
  }

  if (selectedImportSource === 'chatgpt') {
    return '已切回手動編輯的 ChatGPT 內容；系統會依 ChatGPT 模式重新解析 textarea。';
  }

  if (selectedImportSource === 'gemini') {
    return '已切回手動編輯的 Gemini 內容；系統會依 Gemini 模式重新解析 textarea。';
  }

  if (selectedImportSource === 'claude') {
    return '已切回手動編輯的 Claude 內容；系統會依 Claude 模式重新解析 textarea。';
  }

  return '純文字模式會直接使用你目前貼上的內容。';
}

function renderSourcePanels() {
  ['plain', 'chatgpt', 'gemini', 'claude', 'copilot'].forEach((source) => {
    const panel = document.getElementById(`source-panel-${source}`);
    if (!panel) {
      return;
    }

    panel.classList.toggle('hidden', source !== selectedImportSource);
  });
}

function updateSourceSelectorUI() {
  const sourceSelect = document.getElementById('import-source-select');
  const hintEl = document.getElementById('import-source-hint');
  const inputEl = document.getElementById('input-text');
  const config = getImportSourceConfig(selectedImportSource);

  sourceSelect.value = selectedImportSource;
  hintEl.textContent = config.hint;
  inputEl.placeholder = config.placeholder;
  renderSourcePanels();
}

function refreshImportStatusForSource() {
  if (selectedImportSource === 'copilot' && selectedCopilotSession) {
    updateImportStatus(`已載入 Copilot session「${selectedCopilotSession.title || selectedCopilotSession.fileName}」，可直接按「提取候選知識」。`, 'hub');
    return;
  }

  if (selectedImportSource === 'chatgpt' && selectedChatGPTApiSession && selectedConversationDoc) {
    updateImportStatus(`已載入 ChatGPT API session「${selectedChatGPTApiSession.title || selectedChatGPTApiSession.conversationId}」，可直接按「提取候選知識」。`, 'cloud_download');
    return;
  }

  if (selectedImportSource === 'chatgpt' && selectedImportFile) {
    updateImportStatus(`已載入 ${selectedImportFile.name}，可直接按「提取候選知識」。`, 'upload_file');
    return;
  }

  const config = getImportSourceConfig(selectedImportSource);
  updateImportStatus(config.statusMessage, config.statusIcon);
}

function setImportSource(source, options) {
  const nextSource = IMPORT_SOURCE_CONFIG[source] ? source : 'plain';
  const previousSource = selectedImportSource;
  const hasImportedState = Boolean(selectedImportFile || selectedConversationDoc || selectedCopilotSession);
  selectedImportSource = nextSource;
  updateSourceSelectorUI();

  if ((options && options.clearImportedState === false) !== true && previousSource !== nextSource && hasImportedState) {
    const nextConfig = getImportSourceConfig(nextSource);
    clearImportedContentState(nextConfig.statusMessage, nextConfig.statusIcon);
    return;
  }

  refreshImportStatusForSource();
}

function clearImportedContentState(message, icon) {
  selectedImportFile = null;
  selectedConversationDoc = null;
  selectedCopilotSession = null;
  selectedChatGPTApiSession = null;
  renderCopilotSessions();
  renderChatGPTApiSessions();
  updateImportStatus(message, icon);
}

async function refreshCopilotSessions() {
  const listEl = document.getElementById('copilot-session-list');
  showLoading(listEl);
  updateCopilotStatus('讀取本機 Copilot session 中…', 'sync');

  try {
    const endpoint = new URL('/api/copilot/sessions', location.origin);
    const sessionDir = getCopilotSessionDir();
    if (sessionDir) {
      endpoint.searchParams.set('sessionDir', sessionDir);
    }

    const data = await apiFetch(endpoint.pathname + endpoint.search);
    copilotSessions = Array.isArray(data.sessions) ? data.sessions : [];

    if ((!copilotPathWasEdited || !sessionDir) && data.sessionDir) {
      document.getElementById('copilot-session-path').value = data.sessionDir;
    }

    renderCopilotSessions();
    if (copilotSessions.length > 0) {
      updateCopilotStatus(`找到 ${copilotSessions.length} 筆可匯入 session。`, 'check_circle');
    } else {
      updateCopilotStatus('目前找不到可匯入的 Copilot session。', 'search_off');
    }
  } catch (error) {
    copilotSessions = [];
    showError(listEl, error.message);
    updateCopilotStatus(`讀取 Copilot session 失敗：${error.message}`, 'error');
  }
}

function renderCopilotSessions() {
  const listEl = document.getElementById('copilot-session-list');
  listEl.innerHTML = '';

  if (copilotSessions.length === 0) {
    showEmpty(listEl, 'forum', '尚無可匯入的 Copilot session。你可以先確認路徑後重新整理。');
    return;
  }

  copilotSessions.forEach((session) => {
    const item = document.createElement('div');
    const isSelected = selectedCopilotSession && selectedCopilotSession.fileName === session.fileName;
    item.className = `copilot-session-item${isSelected ? ' is-selected' : ''}`;

    const updatedAt = session.updatedAt
      ? new Date(session.updatedAt).toLocaleString('zh-TW', { hour12: false })
      : '未知時間';
    const title = session.title || session.fileName || 'Untitled Copilot Session';
    const preview = session.preview || '無可預覽內容';
    const modelId = session.modelId || 'copilot';

    item.innerHTML = `
      <div class="copilot-session-copy">
        <div class="copilot-session-title">${escapeHTML(title)}</div>
        <div class="copilot-session-meta">${escapeHTML(updatedAt)} · ${escapeHTML(modelId)} · ${escapeHTML(String(session.requestCount || 0))} requests</div>
        <div class="copilot-session-preview">${escapeHTML(preview)}</div>
      </div>
      <button class="btn btn-secondary" type="button">
        <span class="material-symbols-outlined">download</span>
        載入
      </button>
    `;

    item.querySelector('button').addEventListener('click', () => loadCopilotSession(session));
    listEl.appendChild(item);
  });
}

async function refreshOpenAISettings() {
  try {
    openAISettings = await apiFetch('/api/settings/openai');
  } catch (error) {
    openAISettings = {
      configured: false,
      maskedKey: '',
      updatedAt: null,
      error: error.message,
    };
  }

  renderChatGPTApiSessions();
}

async function refreshChatGPTApiSessions() {
  const listEl = document.getElementById('chatgpt-session-list');
  showLoading(listEl);
  updateChatGPTApiStatus('讀取 tracked OpenAI conversations 中…', 'sync');

  try {
    const data = await apiFetch('/api/chatgpt/sessions');
    openAISettings = data.settings || openAISettings;
    chatgptApiSessions = Array.isArray(data.sessions) ? data.sessions : [];

    if (!openAISettings.configured) {
      updateChatGPTApiStatus('尚未設定 OpenAI API key，請先前往 /settings。', 'vpn_key_off');
    } else if (chatgptApiSessions.length > 0) {
      updateChatGPTApiStatus(`找到 ${chatgptApiSessions.length} 筆 tracked OpenAI conversations。`, 'check_circle');
    } else {
      updateChatGPTApiStatus('目前沒有 tracked sessions；請先追蹤一個 conversationId。', 'bookmark_add');
    }

    renderChatGPTApiSessions();
  } catch (error) {
    chatgptApiSessions = [];
    if (/API key|\/settings/.test(error.message)) {
      updateChatGPTApiStatus('尚未設定 OpenAI API key，請先前往 /settings。', 'vpn_key_off');
    } else {
      updateChatGPTApiStatus(`讀取 tracked sessions 失敗：${error.message}`, 'error');
    }
    showError(listEl, error.message);
  }
}

function renderChatGPTApiSessions() {
  const listEl = document.getElementById('chatgpt-session-list');
  if (!listEl) {
    return;
  }

  listEl.innerHTML = '';

  if (!openAISettings.configured) {
    showEmpty(listEl, 'vpn_key_off', '尚未設定 OpenAI API key。請先到 /settings 儲存，再回來刷新 API sessions。');
    return;
  }

  if (chatgptApiSessions.length === 0) {
    showEmpty(listEl, 'bookmark_add', '目前沒有 tracked sessions。請先輸入一個 OpenAI conversationId 並按「追蹤 Conversation」。');
    return;
  }

  chatgptApiSessions.forEach((session) => {
    const item = document.createElement('div');
    const isSelected = selectedChatGPTApiSession && selectedChatGPTApiSession.conversationId === session.conversationId;
    item.className = `copilot-session-item${isSelected ? ' is-selected' : ''}`;

    const updatedAt = session.updatedAt
      ? new Date(session.updatedAt).toLocaleString('zh-TW', { hour12: false })
      : '未知時間';
    const title = session.title || session.conversationId || 'Tracked OpenAI Conversation';
    const preview = session.preview || '尚無預覽內容';
    const meta = session.error
      ? `${updatedAt} · ${session.conversationId} · ${session.error}`
      : `${updatedAt} · ${session.conversationId} · ${String(session.messageCount || 0)} messages`;

    item.innerHTML = `
      <div class="copilot-session-copy">
        <div class="copilot-session-title">${escapeHTML(title)}</div>
        <div class="copilot-session-meta">${escapeHTML(meta)}</div>
        <div class="copilot-session-preview">${escapeHTML(preview)}</div>
      </div>
      <button class="btn btn-secondary" type="button" ${session.error ? 'disabled' : ''}>
        <span class="material-symbols-outlined">cloud_download</span>
        載入
      </button>
    `;

    item.querySelector('button').addEventListener('click', () => loadChatGPTApiSession(session));
    listEl.appendChild(item);
  });
}

async function trackChatGPTConversation() {
  const inputEl = document.getElementById('chatgpt-conversation-id');
  const conversationId = inputEl.value.trim();
  if (!conversationId) {
    alert('請先輸入要追蹤的 OpenAI conversationId。');
    return;
  }

  updateChatGPTApiStatus(`追蹤 ${conversationId} 中…`, 'bookmark_add');

  try {
    const data = await apiPost('/api/chatgpt/sessions/track', { conversationId });
    selectedChatGPTApiSession = null;
    inputEl.value = '';
    chatgptApiSessions = Array.isArray(data.sessions) ? data.sessions : chatgptApiSessions;
    updateChatGPTApiStatus(`已追蹤 ${data.summary.title || data.summary.conversationId}。`, 'check_circle');
    await refreshChatGPTApiSessions();
  } catch (error) {
    updateChatGPTApiStatus(`追蹤失敗：${error.message}`, 'error');
  }
}

async function loadChatGPTApiSession(session) {
  if (!session || !session.conversationId) {
    return;
  }

  updateChatGPTApiStatus(`載入 ${session.title || session.conversationId} 中…`, 'cloud_download');

  try {
    const endpoint = new URL('/api/chatgpt/session', location.origin);
    endpoint.searchParams.set('conversationId', session.conversationId);
    const data = await apiFetch(endpoint.pathname + endpoint.search);
    const inputEl = document.getElementById('input-text');
    const charCount = document.getElementById('char-count');
    const previewText = data.previewText || getConversationAdapterAPI().conversationDocToText(data.conversationDoc);

    hydratingInputFromFile = true;
    inputEl.value = previewText;
    charCount.textContent = `${previewText.length} 字`;
    hydratingInputFromFile = false;

    selectedImportFile = null;
    selectedCopilotSession = null;
    selectedConversationDoc = data.conversationDoc;
    selectedChatGPTApiSession = data.summary || session;

    renderChatGPTApiSessions();
    updateImportStatus(`已載入 ChatGPT API session「${selectedChatGPTApiSession.title || selectedChatGPTApiSession.conversationId}」，可直接按「提取候選知識」。`, 'cloud_download');
    updateChatGPTApiStatus(`已載入 ${selectedChatGPTApiSession.title || selectedChatGPTApiSession.conversationId}。`, 'check_circle');
  } catch (error) {
    hydratingInputFromFile = false;
    updateChatGPTApiStatus(`載入 API session 失敗：${error.message}`, 'error');
  }
}

async function loadCopilotSession(session) {
  if (!session || !session.fileName) {
    return;
  }

  updateCopilotStatus(`載入 ${session.title || session.fileName} 中…`, 'download');

  try {
    const endpoint = new URL('/api/copilot/session', location.origin);
    endpoint.searchParams.set('fileName', session.fileName);
    const sessionDir = getCopilotSessionDir();
    if (sessionDir) {
      endpoint.searchParams.set('sessionDir', sessionDir);
    }

    const data = await apiFetch(endpoint.pathname + endpoint.search);
    const conversationDoc = data.conversationDoc;
    const previewText = getConversationAdapterAPI().conversationDocToText(conversationDoc);
    const inputEl = document.getElementById('input-text');
    const charCount = document.getElementById('char-count');

    hydratingInputFromFile = true;
    inputEl.value = previewText;
    charCount.textContent = `${previewText.length} 字`;
    hydratingInputFromFile = false;

    selectedImportFile = null;
    selectedConversationDoc = conversationDoc;
    selectedCopilotSession = data.summary || session;

    renderCopilotSessions();
    updateImportStatus(`已載入 Copilot session「${selectedCopilotSession.title || session.fileName}」，可直接按「提取候選知識」。`, 'hub');
    updateCopilotStatus(`已載入 ${selectedCopilotSession.title || session.fileName}。`, 'check_circle');
  } catch (error) {
    hydratingInputFromFile = false;
    updateCopilotStatus(`載入 session 失敗：${error.message}`, 'error');
  }
}

/* ─── Step 1 → Step 2: Extract ─── */
async function runExtraction() {
  const text = document.getElementById('input-text').value.trim();
  const adapterApi = getConversationAdapterAPI();

  let conversationDoc;
  try {
    if (selectedImportSource === 'copilot') {
      if (!selectedConversationDoc) {
        alert('請先在「VS Code Copilot」模式載入一筆本機 session。');
        return;
      }
      conversationDoc = selectedConversationDoc;
    } else if (selectedImportSource === 'chatgpt') {
      if (selectedConversationDoc && selectedChatGPTApiSession) {
        conversationDoc = selectedConversationDoc;
      } else {
        if (!text) {
          alert('請先貼上 ChatGPT transcript，或上傳 ChatGPT JSON / TXT。');
          return;
        }
        const metadata = {};
        if (selectedImportFile && /\.json$/i.test(selectedImportFile.name)) {
          metadata.inputFormatHint = 'chatgpt-json';
        }
        conversationDoc = adapterApi.adaptChatGPTConversation(text, metadata);
      }
    } else if (selectedImportSource === 'gemini') {
      if (!text) {
        alert('請先貼上 Gemini transcript。');
        return;
      }
      conversationDoc = adapterApi.adaptGeminiConversation(text, {
        inputFormatHint: 'gemini-text',
      });
    } else if (selectedImportSource === 'claude') {
      if (!text) {
        alert('請先貼上 Claude transcript。');
        return;
      }
      conversationDoc = adapterApi.adaptClaudeConversation(text, {
        inputFormatHint: 'claude-text',
      });
    } else {
      if (!text) {
        alert('請先貼上要提取的純文字對話。');
        return;
      }
      conversationDoc = adapterApi.adaptPlainTextConversation(text);
    }
  } catch (error) {
    alert(error.message);
    return;
  }

  // Load current memory for dedup
  memorySnapshot = {};
  try {
    const data = await apiFetch('/api/memory');
    data.files.forEach(f => {
      memorySnapshot[f.filename] = f.content;
    });
  } catch { /* continue without dedup */ }

  // Extract candidates from normalized conversation doc
  candidates = extractCandidatesFromConversationDoc(conversationDoc);

  if (candidates.length === 0) {
    showEmpty(document.getElementById('candidates-list'), 'search_off', '未找到候選知識項目。請嘗試貼上更多對話內容。');
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
function extractCandidatesFromConversationDoc(conversationDoc) {
  const conversationText = getConversationAdapterAPI().conversationDocToText(conversationDoc);
  return extractCandidatesFromText(conversationText, conversationDoc);
}

function extractCandidatesFromText(text, conversationDoc) {
  const results = [];
  // Split into meaningful chunks (paragraphs or multi-line blocks)
  const chunks = splitIntoChunks(text);
  const seen = new Set();
  const primarySource = conversationDoc?.messages?.[0]?.source || 'plain';

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
        source: primarySource,
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
    const sourcePresentation = getCurrentSourcePresentation(cand.source);
    const card = document.createElement('div');
    card.className = 'candidate-card' + (cand.decision === 'rejected' ? ' rejected' : ' adopted');
    card.dataset.idx = idx;

    card.innerHTML = `
      <div class="candidate-header">
        <div class="candidate-category">
          <span class="material-symbols-outlined">${escapeHTML(cat.icon)}</span>
          <span>${escapeHTML(cat.label)}</span>
          <span class="confidence-badge" title="AI 評估此項値得保存的信心程度">${(cand.confidence * 100).toFixed(0)}%</span>
        </div>
        <div class="candidate-actions">
          <button class="btn-icon adopt labeled" title="採用此項知識候選" data-action="adopt">
            <span class="material-symbols-outlined">check_circle</span>
            <span class="btn-label">採用</span>
          </button>
          <button class="btn-icon reject labeled" title="略過此項，本次不儲存" data-action="reject">
            <span class="material-symbols-outlined">cancel</span>
            <span class="btn-label">拒絕</span>
          </button>
        </div>
      </div>
      <div class="candidate-content">${escapeHTML(cand.keyLine)}</div>
      <div class="candidate-meta-row">
        <div class="candidate-target">→ ${escapeHTML(cat.filename)}</div>
        <span class="source-badge ${escapeHTML(sourcePresentation.className)} candidate-source-badge">${escapeHTML(sourcePresentation.label)}</span>
      </div>
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
        card.classList.add('adopted');
      } else if (action === 'reject') {
        cand.decision = 'rejected';
        card.classList.add('rejected');
        card.classList.remove('adopted');
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
  const sourceCounts = candidates.reduce((acc, candidate) => {
    const source = candidate.source || 'plain';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});
  const sourceSummary = Object.entries(sourceCounts)
    .map(([source, count]) => `${getCurrentSourcePresentation(source).label} ${count}`)
    .join('、');

  document.getElementById('review-summary').textContent =
    `${adopted} 採用 / ${rejected} 拒絕 / 共 ${candidates.length} 項` + (sourceSummary ? ` · 來源：${sourceSummary}` : '');

  const writebackBadge = document.getElementById('writeback-badge');
  if (writebackBadge) writebackBadge.textContent = adopted;
}

/* ─── Bulk Decision Actions ─── */
function adoptAll() {
  candidates.forEach((cand, idx) => {
    cand.decision = 'pending';
    const card = document.querySelector(`.candidate-card[data-idx="${idx}"]`);
    if (card) { card.classList.remove('rejected'); card.classList.add('adopted'); }
  });
  updateSummary();
}

function rejectAll() {
  candidates.forEach((cand, idx) => {
    cand.decision = 'rejected';
    const card = document.querySelector(`.candidate-card[data-idx="${idx}"]`);
    if (card) { card.classList.add('rejected'); card.classList.remove('adopted'); }
  });
  updateSummary();
}

function resetDecisions() {
  candidates.forEach((cand, idx) => {
    cand.decision = cand.confidence >= 0.6 ? 'pending' : 'rejected';
    const card = document.querySelector(`.candidate-card[data-idx="${idx}"]`);
    if (card) {
      if (cand.decision === 'rejected') { card.classList.add('rejected'); card.classList.remove('adopted'); }
      else { card.classList.remove('rejected'); card.classList.add('adopted'); }
    }
  });
  updateSummary();
}

/* ─── Step 2 → Step 3: Writeback ─── */
async function runWriteback() {
  const toWrite = candidates.filter(c => c.decision !== 'rejected');
  if (toWrite.length === 0) {
    alert('沒有已採用的候選項目');
    return;
  }

  const resultContainer = document.getElementById('writeback-result');
  showLoading(resultContainer);
  document.getElementById('step-review').classList.add('hidden');
  document.getElementById('step-result').classList.remove('hidden');

  // Group by target file
  const groups = {};
  toWrite.forEach(cand => {
    const filename = CATEGORIES[cand.category].filename;
    if (!groups[filename]) groups[filename] = [];
    groups[filename].push({
      content: cand.editedContent || cand.content,
      source: cand.source,
    });
  });

  const results = [];

  for (const [filename, items] of Object.entries(groups)) {
    try {
      const memorySourceUtils = getMemorySourceUtilsAPI();
      // Read current content first
      const memData = await apiFetch('/api/memory');
      const file = memData.files.find(f => f.filename === filename);
      let currentContent = file ? file.content : '';

      // Append new items
      const newSection = '\n\n## 提取於 ' + new Date().toISOString().slice(0, 10) + '\n\n' +
        items
          .map(item => memorySourceUtils.buildAttributedMemoryListItem(item.content, item.source))
          .filter(Boolean)
          .join('\n');

      const updatedContent = currentContent.trimEnd() + newSection + '\n';

      // Write back
      const writeData = await apiPost('/api/memory/write', { filename, content: updatedContent });

      if (writeData.success) {
        results.push({ filename, count: items.length, ok: true, backedUp: writeData.backedUp });
      } else {
        results.push({ filename, count: items.length, ok: false, error: writeData.error });
      }
    } catch (e) {
      results.push({ filename, count: items.length, ok: false, error: e.message });
    }
  }

  // Render results
  resultContainer.innerHTML = '';
  results.forEach(r => {
    const div = document.createElement('div');
    div.className = 'writeback-item ' + (r.ok ? 'success' : 'failure');
    const icon = r.ok ? 'check_circle' : 'error';
    let msg = r.ok
      ? `${r.filename} — 成功寫入 ${r.count} 項`
      : `${r.filename} — 失敗: ${r.error}`;
    if (r.ok && r.backedUp) {
      msg += ' (已自動備份原檔)';
    }
    div.innerHTML = `<span class="material-symbols-outlined">${icon}</span><span>${escapeHTML(msg)}</span>`;
    resultContainer.appendChild(div);
  });
}

/* ─── Navigation ─── */
function goBack() {
  document.getElementById('step-review').classList.add('hidden');
  document.getElementById('step-input').classList.remove('hidden');
}

function restart() {
  candidates = [];
  memorySnapshot = {};
  selectedImportFile = null;
  selectedConversationDoc = null;
  selectedCopilotSession = null;
  selectedChatGPTApiSession = null;
  hydratingInputFromFile = false;
  document.getElementById('input-text').value = '';
  document.getElementById('input-file').value = '';
  document.getElementById('char-count').textContent = '0 字';
  document.getElementById('chatgpt-conversation-id').value = '';
  renderCopilotSessions();
  renderChatGPTApiSessions();
  setImportSource('plain', { clearImportedState: false });
  document.getElementById('step-result').classList.add('hidden');
  document.getElementById('step-input').classList.remove('hidden');
}
