(function (root, factory) {
  const api = factory();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.ConversationAdapters = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const CONVERSATION_SCHEMA_VERSION = 'v1';
  const BUILTIN_SOURCES = new Set(['plain', 'chatgpt', 'copilot']);
  const ALLOWED_ROLES = new Set(['user', 'assistant', 'system', 'tool']);
  const ISO_8601_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;
  const TRANSCRIPT_ROLE_ALIASES = {
    user: new Set(['you', 'you said', 'user', 'human', '你', '你說', '使用者', '提問']),
    assistant: new Set(['chatgpt', 'chatgpt said', 'assistant', '助理', '回答', '回覆']),
  };

  function isIsoTimestamp(value) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return false;
    }

    if (!ISO_8601_PATTERN.test(value)) {
      return false;
    }

    const date = new Date(value);
    return !Number.isNaN(date.getTime());
  }

  function isValidSource(source) {
    return BUILTIN_SOURCES.has(source) || /^custom:[a-z0-9-]+$/i.test(source);
  }

  function normalizeTimestamp(value) {
    if (value === null || typeof value === 'undefined' || value === '') {
      return null;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      const milliseconds = value > 1e12 ? value : value * 1000;
      const date = new Date(milliseconds);
      return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        return null;
      }

      if (isIsoTimestamp(trimmed)) {
        return trimmed;
      }

      const numeric = Number(trimmed);
      if (Number.isFinite(numeric)) {
        return normalizeTimestamp(numeric);
      }

      const date = new Date(trimmed);
      return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }

    return null;
  }

  function stripControlMetadata(metadata) {
    const normalized = { ...(metadata || {}) };
    delete normalized.inputFormatHint;
    return normalized;
  }

  function normalizeTranscriptLabel(line) {
    return String(line || '')
      .replace(/\u200b/g, '')
      .replace(/^#{1,6}\s*/, '')
      .replace(/^[-*]\s*/, '')
      .replace(/^>\s*/, '')
      .replace(/\*\*/g, '')
      .trim()
      .replace(/[：:]\s*$/, '')
      .trim()
      .toLowerCase();
  }

  function detectTranscriptRole(line) {
    const normalized = normalizeTranscriptLabel(line);
    if (!normalized || normalized.length > 32) {
      return null;
    }

    if (TRANSCRIPT_ROLE_ALIASES.user.has(normalized)) {
      return 'user';
    }

    if (TRANSCRIPT_ROLE_ALIASES.assistant.has(normalized)) {
      return 'assistant';
    }

    return null;
  }

  function normalizeRole(role) {
    const normalized = String(role || '').trim().toLowerCase();
    return ALLOWED_ROLES.has(normalized) ? normalized : null;
  }

  function extractTextParts(value) {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => extractTextParts(item))
        .filter(Boolean)
        .join('\n\n')
        .trim();
    }

    if (!value || typeof value !== 'object') {
      return '';
    }

    if (Array.isArray(value.parts)) {
      return extractTextParts(value.parts);
    }

    if (Array.isArray(value.text)) {
      return extractTextParts(value.text);
    }

    if (typeof value.text === 'string') {
      return value.text.trim();
    }

    if (typeof value.content === 'string') {
      return value.content.trim();
    }

    if (typeof value.result === 'string') {
      return value.result.trim();
    }

    if (typeof value.value === 'string') {
      return value.value.trim();
    }

    return '';
  }

  function isLikelyJsonString(input) {
    return /^[\[{]/.test(input.trim());
  }

  function isChatGPTConversationObject(value) {
    return Boolean(value && typeof value === 'object' && value.mapping && typeof value.mapping === 'object');
  }

  function toSortableTimestamp(value) {
    const normalized = normalizeTimestamp(value);
    return normalized ? new Date(normalized).getTime() : 0;
  }

  function selectChatGPTConversation(payload) {
    if (isChatGPTConversationObject(payload)) {
      return payload;
    }

    if (Array.isArray(payload)) {
      const conversations = payload.filter(isChatGPTConversationObject);
      if (conversations.length === 0) {
        throw new Error('ChatGPT JSON 未找到可匯入的 conversation');
      }

      return conversations
        .slice()
        .sort((left, right) => {
          const leftTime = toSortableTimestamp(left.update_time || left.create_time);
          const rightTime = toSortableTimestamp(right.update_time || right.create_time);
          return rightTime - leftTime;
        })[0];
    }

    if (payload && Array.isArray(payload.conversations)) {
      return selectChatGPTConversation(payload.conversations);
    }

    throw new Error('ChatGPT JSON 格式不支援');
  }

  function buildCurrentPath(mapping, currentNodeId) {
    if (!currentNodeId || !mapping[currentNodeId]) {
      return [];
    }

    const orderedIds = [];
    const visited = new Set();
    let pointer = currentNodeId;

    while (pointer && mapping[pointer] && !visited.has(pointer)) {
      visited.add(pointer);
      orderedIds.unshift(pointer);
      pointer = mapping[pointer].parent || null;
    }

    return orderedIds.map((nodeId) => mapping[nodeId]);
  }

  function fallbackOrderedNodes(mapping) {
    return Object.values(mapping)
      .filter((node) => node && node.message)
      .sort((left, right) => {
        const leftTime = toSortableTimestamp(left.message && left.message.create_time);
        const rightTime = toSortableTimestamp(right.message && right.message.create_time);
        return leftTime - rightTime;
      });
  }

  function extractConversationMessages(conversation) {
    const mapping = conversation && conversation.mapping ? conversation.mapping : {};
    const orderedNodes = buildCurrentPath(mapping, conversation && conversation.current_node);
    const nodes = orderedNodes.length > 0 ? orderedNodes : fallbackOrderedNodes(mapping);

    return nodes
      .map((node) => node && node.message)
      .filter(Boolean)
      .map((message) => {
        const role = normalizeRole(message.author && message.author.role);
        const content = extractTextParts(message.content);

        if (!role || !content) {
          return null;
        }

        return {
          role,
          content,
          source: 'chatgpt',
          timestamp: normalizeTimestamp(message.create_time),
        };
      })
      .filter(Boolean);
  }

  function createConversationDoc(messages, metadata) {
    const normalizedMessages = Array.isArray(messages) ? messages.map((message) => ({
      role: message.role,
      content: typeof message.content === 'string' ? message.content.trim() : '',
      source: message.source,
      timestamp: message.timestamp ?? null,
    })) : [];

    const doc = {
      messages: normalizedMessages,
      metadata: {
        schemaVersion: CONVERSATION_SCHEMA_VERSION,
        importedAt: new Date().toISOString(),
        ...(metadata || {}),
      },
    };

    validateConversationDoc(doc);
    return doc;
  }

  function validateConversationDoc(doc) {
    if (!doc || typeof doc !== 'object') {
      throw new Error('ConversationDoc 必須是物件');
    }

    if (!Array.isArray(doc.messages) || doc.messages.length === 0) {
      throw new Error('ConversationDoc.messages 必須是非空陣列');
    }

    doc.messages.forEach((message, index) => {
      if (!message || typeof message !== 'object') {
        throw new Error(`ConversationMessage[${index}] 必須是物件`);
      }

      if (!ALLOWED_ROLES.has(message.role)) {
        throw new Error(`ConversationMessage[${index}].role 不合法`);
      }

      if (typeof message.content !== 'string' || message.content.trim().length === 0) {
        throw new Error(`ConversationMessage[${index}].content 不可為空`);
      }

      if (!isValidSource(message.source)) {
        throw new Error(`ConversationMessage[${index}].source 不合法`);
      }

      if (message.timestamp !== null && !isIsoTimestamp(message.timestamp)) {
        throw new Error(`ConversationMessage[${index}].timestamp 必須為 ISO 8601 或 null`);
      }
    });

    if (!doc.metadata || typeof doc.metadata !== 'object') {
      throw new Error('ConversationDoc.metadata 必須存在');
    }

    if (doc.metadata.schemaVersion !== CONVERSATION_SCHEMA_VERSION) {
      throw new Error(`ConversationDoc.metadata.schemaVersion 必須為 ${CONVERSATION_SCHEMA_VERSION}`);
    }

    if (!isIsoTimestamp(doc.metadata.importedAt)) {
      throw new Error('ConversationDoc.metadata.importedAt 必須為 ISO 8601');
    }

    return true;
  }

  function adaptPlainTextConversation(input, metadata) {
    if (typeof input !== 'string' || input.trim().length === 0) {
      throw new Error('PlainTextAdapter 需要非空文字輸入');
    }

    return createConversationDoc([
      {
        role: 'user',
        content: input.trim(),
        source: 'plain',
        timestamp: null,
      },
    ], stripControlMetadata(metadata));
  }

  function adaptChatGPTSharedConversation(input, metadata) {
    if (typeof input !== 'string' || input.trim().length === 0) {
      throw new Error('ChatGPTAdapter 需要非空文字輸入');
    }

    const lines = input.replace(/\r\n?/g, '\n').split('\n');
    const messages = [];
    const rolesSeen = new Set();
    let currentRole = null;
    let buffer = [];

    function flushCurrent() {
      const content = buffer.join('\n').trim();
      if (currentRole && content) {
        rolesSeen.add(currentRole);
        messages.push({
          role: currentRole,
          content,
          source: 'chatgpt',
          timestamp: null,
        });
      }
      buffer = [];
    }

    lines.forEach((line) => {
      const detectedRole = detectTranscriptRole(line);
      if (detectedRole) {
        flushCurrent();
        currentRole = detectedRole;
        return;
      }

      if (currentRole) {
        buffer.push(line);
      }
    });

    flushCurrent();

    if (messages.length < 2 || !rolesSeen.has('user') || !rolesSeen.has('assistant')) {
      throw new Error('無法辨識為 ChatGPT 分享頁 transcript');
    }

    return createConversationDoc(messages, stripControlMetadata(metadata));
  }

  function adaptChatGPTJsonConversation(input, metadata) {
    const payload = typeof input === 'string' ? JSON.parse(input) : input;
    const conversation = selectChatGPTConversation(payload);
    const messages = extractConversationMessages(conversation);

    if (messages.length === 0) {
      throw new Error('ChatGPT JSON 未找到可匯入的文字訊息');
    }

    return createConversationDoc(messages, {
      ...stripControlMetadata(metadata),
      title: (metadata && metadata.title) || conversation.title || undefined,
      sessionId:
        (metadata && metadata.sessionId) ||
        conversation.conversation_id ||
        conversation.id ||
        conversation.current_node ||
        undefined,
    });
  }

  function adaptChatGPTConversation(input, metadata) {
    if (typeof input === 'string' && isLikelyJsonString(input)) {
      return adaptChatGPTJsonConversation(input, metadata);
    }

    return adaptChatGPTSharedConversation(input, metadata);
  }

  function adaptConversationInput(input, metadata) {
    if (typeof input !== 'string' || input.trim().length === 0) {
      throw new Error('請提供非空對話內容');
    }

    const hint = metadata && metadata.inputFormatHint;

    if (hint === 'chatgpt-json') {
      return adaptChatGPTJsonConversation(input, metadata);
    }

    if (hint === 'chatgpt-text') {
      return adaptChatGPTSharedConversation(input, metadata);
    }

    if (isLikelyJsonString(input)) {
      try {
        return adaptChatGPTJsonConversation(input, metadata);
      } catch (error) {
        if (hint === 'json') {
          throw error;
        }
      }
    }

    try {
      return adaptChatGPTSharedConversation(input, metadata);
    } catch (error) {
      return adaptPlainTextConversation(input, metadata);
    }
  }

  function conversationDocToText(doc) {
    validateConversationDoc(doc);
    return doc.messages
      .map((message) => message.content.trim())
      .filter(Boolean)
      .join('\n\n');
  }

  return {
    CONVERSATION_SCHEMA_VERSION,
    adaptChatGPTConversation,
    adaptChatGPTJsonConversation,
    adaptConversationInput,
    adaptPlainTextConversation,
    conversationDocToText,
    createConversationDoc,
    validateConversationDoc,
  };
});
