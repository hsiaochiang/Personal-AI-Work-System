document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-save-openai-key').addEventListener('click', saveOpenAIKey);
  document.getElementById('btn-clear-openai-key').addEventListener('click', clearOpenAIKey);
  document.getElementById('btn-save-gemini-key').addEventListener('click', saveGeminiKey);
  document.getElementById('btn-clear-gemini-key').addEventListener('click', clearGeminiKey);
  refreshOpenAIKeyStatus();
  refreshGeminiKeyStatus();
});

function updateOpenAIKeyStatus(message, icon) {
  const statusEl = document.getElementById('openai-settings-status');
  statusEl.innerHTML = `<span class="material-symbols-outlined">${escapeHTML(icon)}</span><span>${escapeHTML(message)}</span>`;
}

async function refreshOpenAIKeyStatus() {
  updateOpenAIKeyStatus('讀取 OpenAI API key 狀態中…', 'sync');

  try {
    const data = await apiFetch('/api/settings/openai');
    if (data.configured) {
      const updatedAt = data.updatedAt
        ? new Date(data.updatedAt).toLocaleString('zh-TW', { hour12: false })
        : '未知時間';
      updateOpenAIKeyStatus(`已設定 API key（${data.maskedKey || 'masked'}，更新於 ${updatedAt}）。`, 'check_circle');
    } else {
      updateOpenAIKeyStatus('尚未設定 OpenAI API key。', 'vpn_key_off');
    }
  } catch (error) {
    updateOpenAIKeyStatus(`讀取設定失敗：${error.message}`, 'error');
  }
}

async function saveOpenAIKey() {
  const inputEl = document.getElementById('openai-api-key');
  const apiKey = inputEl.value.trim();
  if (!apiKey) {
    alert('請先輸入 OpenAI API key。');
    return;
  }

  updateOpenAIKeyStatus('儲存 OpenAI API key 中…', 'save');

  try {
    const data = await apiPost('/api/settings/openai', { apiKey });
    inputEl.value = '';
    const updatedAt = data.updatedAt
      ? new Date(data.updatedAt).toLocaleString('zh-TW', { hour12: false })
      : '未知時間';
    updateOpenAIKeyStatus(`已儲存 API key（${data.maskedKey || 'masked'}，更新於 ${updatedAt}）。`, 'check_circle');
  } catch (error) {
    updateOpenAIKeyStatus(`儲存失敗：${error.message}`, 'error');
  }
}

async function clearOpenAIKey() {
  updateOpenAIKeyStatus('清除 OpenAI API key 中…', 'delete');

  try {
    await apiPost('/api/settings/openai', { clear: true });
    document.getElementById('openai-api-key').value = '';
    updateOpenAIKeyStatus('已清除 OpenAI API key。', 'delete');
  } catch (error) {
    updateOpenAIKeyStatus(`清除失敗：${error.message}`, 'error');
  }
}

// ── Gemini API Key ──────────────────────────────────────────────

function updateGeminiKeyStatus(message, icon) {
  const statusEl = document.getElementById('gemini-settings-status');
  statusEl.innerHTML = `<span class="material-symbols-outlined">${escapeHTML(icon)}</span><span>${escapeHTML(message)}</span>`;
}

async function refreshGeminiKeyStatus() {
  updateGeminiKeyStatus('讀取 Gemini API key 狀態中…', 'sync');

  try {
    const data = await apiFetch('/api/settings/gemini');
    if (data.configured) {
      const updatedAt = data.updatedAt
        ? new Date(data.updatedAt).toLocaleString('zh-TW', { hour12: false })
        : '未知時間';
      updateGeminiKeyStatus(`已設定 API key（${data.maskedKey || 'masked'}，更新於 ${updatedAt}）。`, 'check_circle');
    } else {
      updateGeminiKeyStatus('尚未設定 Gemini API key。前往 Google AI Studio 免費取得。', 'vpn_key_off');
    }
  } catch (error) {
    updateGeminiKeyStatus(`讀取設定失敗：${error.message}`, 'error');
  }
}

async function saveGeminiKey() {
  const inputEl = document.getElementById('gemini-api-key');
  const apiKey = inputEl.value.trim();
  if (!apiKey) {
    alert('請先輸入 Gemini API key。');
    return;
  }

  updateGeminiKeyStatus('儲存 Gemini API key 中…', 'save');

  try {
    const data = await apiPost('/api/settings/gemini', { apiKey });
    inputEl.value = '';
    const updatedAt = data.updatedAt
      ? new Date(data.updatedAt).toLocaleString('zh-TW', { hour12: false })
      : '未知時間';
    updateGeminiKeyStatus(`已儲存 API key（${data.maskedKey || 'masked'}，更新於 ${updatedAt}）。`, 'check_circle');
  } catch (error) {
    updateGeminiKeyStatus(`儲存失敗：${error.message}`, 'error');
  }
}

async function clearGeminiKey() {
  updateGeminiKeyStatus('清除 Gemini API key 中…', 'delete');

  try {
    await apiPost('/api/settings/gemini', { clear: true });
    document.getElementById('gemini-api-key').value = '';
    updateGeminiKeyStatus('已清除 Gemini API key。', 'delete');
  } catch (error) {
    updateGeminiKeyStatus(`清除失敗：${error.message}`, 'error');
  }
}
