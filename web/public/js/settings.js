document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-save-openai-key').addEventListener('click', saveOpenAIKey);
  document.getElementById('btn-clear-openai-key').addEventListener('click', clearOpenAIKey);
  refreshOpenAIKeyStatus();
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
