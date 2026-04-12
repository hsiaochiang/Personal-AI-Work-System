(function (root, factory) {
  const api = factory();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.ConversationAdapters = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const CONVERSATION_SCHEMA_VERSION = 'v1';
  const BUILTIN_SOURCES = new Set(['plain', 'chatgpt', 'chatgpt-api', 'gemini', 'claude', 'copilot']);
  const ALLOWED_ROLES = new Set(['user', 'assistant', 'system', 'tool']);
  const ISO_8601_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;
  const COPILOT_EXCLUDED_RESPONSE_KINDS = new Set([
    'mcpServersStarting',
    'thinking',
    'toolInvocationSerialized',
  ]);
  const SHARED_USER_TRANSCRIPT_ALIASES = {
    exact: new Set(['you', 'you said', 'user', 'human', '你', '你說', '使用者', '提問']),
    prefixes: [],
  };
  const CHATGPT_TRANSCRIPT_ROLE_ALIASES = {
    user: SHARED_USER_TRANSCRIPT_ALIASES,
    assistant: {
      exact: new Set(['chatgpt', 'chatgpt said', 'assistant', '助理', '回答', '回覆']),
      prefixes: ['chatgpt'],
    },
  };
  const GEMINI_TRANSCRIPT_ROLE_ALIASES = {
    user: SHARED_USER_TRANSCRIPT_ALIASES,
    assistant: {
      exact: new Set(['gemini', 'google gemini']),
      prefixes: ['gemini', 'google gemini'],
    },
  };
  const CLAUDE_TRANSCRIPT_ROLE_ALIASES = {
    user: SHARED_USER_TRANSCRIPT_ALIASES,
    assistant: {
      exact: new Set(['claude', 'assistant']),
      prefixes: ['claude'],
    },
  };
  const NODE_FS = safeNodeRequire('fs');
  const NODE_PATH = safeNodeRequire('path');
  const DEFAULT_COPILOT_SESSION_SUBPATHS = [
    ['Code - Insiders', 'User', 'globalStorage', 'emptyWindowChatSessions'],
    ['Code', 'User', 'globalStorage', 'emptyWindowChatSessions'],
  ];

  function safeNodeRequire(moduleName) {
    if (typeof module === 'undefined' || !module.exports || typeof require !== 'function') {
      return null;
    }

    try {
      return require(moduleName);
    } catch (error) {
      return null;
    }
  }

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

  function matchesTranscriptAlias(normalized, aliasConfig) {
    if (!aliasConfig) {
      return false;
    }

    if (aliasConfig.exact && aliasConfig.exact.has(normalized)) {
      return true;
    }

    if (Array.isArray(aliasConfig.prefixes)) {
      return aliasConfig.prefixes.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix} `));
    }

    return false;
  }

  function transcriptHasRoleHeading(input, roleAliases) {
    if (typeof input !== 'string' || input.trim().length === 0) {
      return false;
    }

    return input
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .some((line) => Boolean(detectTranscriptRole(line, roleAliases)));
  }

  function detectTranscriptRole(line, roleAliases) {
    const normalized = normalizeTranscriptLabel(line);
    if (!normalized || normalized.length > 64) {
      return null;
    }

    if (matchesTranscriptAlias(normalized, roleAliases && roleAliases.user)) {
      return 'user';
    }

    if (matchesTranscriptAlias(normalized, roleAliases && roleAliases.assistant)) {
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

  function ensureNodeRuntime() {
    if (!NODE_FS || !NODE_PATH || typeof process === 'undefined') {
      throw new Error('此功能僅支援 Node.js runtime');
    }
  }

  function listDefaultVSCodeCopilotSessionDirs() {
    ensureNodeRuntime();

    const roots = [];
    if (typeof process.env.APPDATA === 'string' && process.env.APPDATA.trim()) {
      roots.push(process.env.APPDATA.trim());
    }
    if (typeof process.env.USERPROFILE === 'string' && process.env.USERPROFILE.trim()) {
      roots.push(NODE_PATH.join(process.env.USERPROFILE.trim(), 'AppData', 'Roaming'));
    }

    const candidates = [];
    roots.forEach((root) => {
      DEFAULT_COPILOT_SESSION_SUBPATHS.forEach((segments) => {
        candidates.push(NODE_PATH.join(root, ...segments));
      });
    });

    return Array.from(new Set(candidates));
  }

  function getDefaultVSCodeCopilotSessionDir() {
    ensureNodeRuntime();
    const candidates = listDefaultVSCodeCopilotSessionDirs();
    return candidates.find((candidate) => NODE_FS.existsSync(candidate)) || candidates[0] || null;
  }

  function resolveVSCodeCopilotSessionDir(overrideDir) {
    ensureNodeRuntime();

    if (typeof overrideDir === 'string' && overrideDir.trim()) {
      return NODE_PATH.resolve(overrideDir.trim());
    }

    const defaultDir = getDefaultVSCodeCopilotSessionDir();
    return defaultDir ? NODE_PATH.resolve(defaultDir) : null;
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

  function normalizeOpenAIConversationItemsPayload(input) {
    if (Array.isArray(input)) {
      return input;
    }

    if (input && typeof input === 'object') {
      if (Array.isArray(input.data)) {
        return input.data;
      }

      if (Array.isArray(input.items)) {
        return input.items;
      }
    }

    throw new Error('OpenAI conversation items 格式不支援');
  }

  function extractOpenAIContentPart(part) {
    if (typeof part === 'string') {
      return part.trim();
    }

    if (!part || typeof part !== 'object') {
      return '';
    }

    if (typeof part.text === 'string') {
      return part.text.trim();
    }

    if (part.text && typeof part.text === 'object') {
      return extractTextParts(part.text);
    }

    if (typeof part.output_text === 'string') {
      return part.output_text.trim();
    }

    if (part.output_text && typeof part.output_text === 'object') {
      return extractTextParts(part.output_text);
    }

    if (typeof part.input_text === 'string') {
      return part.input_text.trim();
    }

    if (part.input_text && typeof part.input_text === 'object') {
      return extractTextParts(part.input_text);
    }

    if (typeof part.refusal === 'string') {
      return part.refusal.trim();
    }

    return extractTextParts(part.content || part.value || part);
  }

  function extractOpenAIItemText(item) {
    if (!item || typeof item !== 'object') {
      return '';
    }

    if (Array.isArray(item.content)) {
      return item.content
        .map((part) => extractOpenAIContentPart(part))
        .filter(Boolean)
        .join('\n\n')
        .trim();
    }

    if (Array.isArray(item.output)) {
      return item.output
        .map((part) => extractOpenAIContentPart(part))
        .filter(Boolean)
        .join('\n\n')
        .trim();
    }

    return extractOpenAIContentPart(item.content || item.output_text || item.input_text || item.text || item);
  }

  function normalizeOpenAIItemRole(item) {
    const normalized = normalizeRole(item && item.role);
    if (normalized) {
      return normalized === 'tool' ? 'tool' : normalized;
    }

    const type = String(item && item.type || '').trim().toLowerCase();
    if (type === 'developer') {
      return 'system';
    }

    return null;
  }

  function extractOpenAIConversationMessages(input, options) {
    const items = normalizeOpenAIConversationItemsPayload(input);
    const source = options && options.source ? options.source : 'chatgpt-api';

    return items
      .filter((item) => item && typeof item === 'object')
      .filter((item) => {
        const type = String(item.type || '').trim().toLowerCase();
        return !type || type === 'message' || type === 'developer';
      })
      .map((item, index) => ({
        index,
        item,
        role: normalizeOpenAIItemRole(item),
        content: extractOpenAIItemText(item),
        timestamp: normalizeTimestamp(item.created_at || item.timestamp || item.completed_at || item.updated_at),
      }))
      .filter((entry) => entry.role && entry.content)
      .sort((left, right) => {
        const leftTime = left.timestamp ? new Date(left.timestamp).getTime() : 0;
        const rightTime = right.timestamp ? new Date(right.timestamp).getTime() : 0;
        if (leftTime !== rightTime) {
          return leftTime - rightTime;
        }

        return left.index - right.index;
      })
      .map((entry) => ({
        role: entry.role === 'developer' ? 'system' : entry.role,
        content: entry.content,
        source,
        timestamp: entry.timestamp,
      }));
  }

  function parseJsonLines(input) {
    if (Array.isArray(input)) {
      return input;
    }

    if (input && typeof input === 'object') {
      return [input];
    }

    if (typeof input !== 'string' || input.trim().length === 0) {
      throw new Error('Copilot session 需要非空 JSONL 輸入');
    }

    return input
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  }

  function extractVSCodeCopilotSessionSnapshot(input) {
    if (input && typeof input === 'object' && Array.isArray(input.requests)) {
      return input;
    }

    if (input && typeof input === 'object' && input.v && Array.isArray(input.v.requests)) {
      return input.v;
    }

    const entries = parseJsonLines(input);
    let snapshot = null;

    entries.forEach((entry) => {
      if (!entry || typeof entry !== 'object') {
        return;
      }

      if (entry.kind === 0 && entry.v && typeof entry.v === 'object') {
        snapshot = entry.v;
        return;
      }

      if (!snapshot && entry.v && typeof entry.v === 'object') {
        snapshot = entry.v;
        return;
      }

      if (!snapshot && Array.isArray(entry.requests)) {
        snapshot = entry;
      }
    });

    if (!snapshot) {
      throw new Error('Copilot session JSONL 未找到完整 snapshot');
    }

    return snapshot;
  }

  function extractCopilotUserText(request) {
    if (!request || typeof request !== 'object') {
      return '';
    }

    return extractTextParts(request.message).trim();
  }

  function extractCopilotAssistantText(request) {
    if (!request || typeof request !== 'object' || !Array.isArray(request.response)) {
      return '';
    }

    const visibleChunks = request.response
      .filter((entry) => entry && typeof entry === 'object')
      .filter((entry) => typeof entry.value === 'string' && entry.value.trim().length > 0)
      .filter((entry) => !COPILOT_EXCLUDED_RESPONSE_KINDS.has(entry.kind))
      .map((entry) => entry.value.trim());

    return Array.from(new Set(visibleChunks)).join('\n\n').trim();
  }

  function buildVSCodeCopilotMessages(session) {
    const requests = Array.isArray(session && session.requests) ? session.requests : [];
    const messages = [];

    requests.forEach((request) => {
      const userText = extractCopilotUserText(request);
      const assistantText = extractCopilotAssistantText(request);
      const userTimestamp = normalizeTimestamp(request && request.timestamp);
      const assistantTimestamp = normalizeTimestamp(
        request && request.modelState && request.modelState.completedAt
      ) || userTimestamp;

      if (userText) {
        messages.push({
          role: 'user',
          content: userText,
          source: 'copilot',
          timestamp: userTimestamp,
        });
      }

      if (assistantText) {
        messages.push({
          role: 'assistant',
          content: assistantText,
          source: 'copilot',
          timestamp: assistantTimestamp,
        });
      }
    });

    return messages;
  }

  function summarizeVSCodeCopilotSession(input, metadata) {
    const session = extractVSCodeCopilotSessionSnapshot(input);
    const requests = Array.isArray(session.requests) ? session.requests : [];
    const messages = buildVSCodeCopilotMessages(session);
    const title =
      (session.customTitle && String(session.customTitle).trim()) ||
      extractCopilotUserText(requests[0]).slice(0, 80) ||
      session.sessionId ||
      (metadata && metadata.fileName) ||
      'Untitled Copilot Session';
    const updatedAt = normalizeTimestamp(
      (metadata && metadata.updatedAt) || session.lastInteractionDate || session.creationDate
    );
    const preview = messages[0] ? messages[0].content.slice(0, 160) : '';
    const firstRequest = requests[0] || {};

    return {
      title,
      sessionId: session.sessionId || (metadata && metadata.fileName) || undefined,
      fileName: metadata && metadata.fileName,
      updatedAt,
      requestCount: requests.length,
      messageCount: messages.length,
      modelId:
        firstRequest.modelId ||
        (session.inputState && session.inputState.selectedModel && session.inputState.selectedModel.identifier) ||
        null,
      preview,
    };
  }

  function adaptVSCodeCopilotConversation(input, metadata) {
    const session = extractVSCodeCopilotSessionSnapshot(input);
    const messages = buildVSCodeCopilotMessages(session);
    const summary = summarizeVSCodeCopilotSession(session, metadata);
    const firstRequest = Array.isArray(session.requests) ? session.requests[0] : null;
    const toolVersion =
      (firstRequest && firstRequest.agent && firstRequest.agent.extensionVersion) ||
      summary.modelId ||
      undefined;

    if (messages.length === 0) {
      throw new Error('Copilot session 未找到可匯入的對話內容');
    }

    return createConversationDoc(messages, {
      title: summary.title,
      sessionId: summary.sessionId,
      toolVersion,
      ...(metadata || {}),
    });
  }

  function listVSCodeCopilotSessionsFromDirectory(sessionDir, options) {
    ensureNodeRuntime();

    const resolvedDir = resolveVSCodeCopilotSessionDir(sessionDir);
    if (!resolvedDir) {
      throw new Error('找不到預設的 Copilot session 路徑');
    }

    if (!NODE_FS.existsSync(resolvedDir)) {
      throw new Error(`Copilot session 路徑不存在：${resolvedDir}`);
    }

    const directoryEntries = NODE_FS.readdirSync(resolvedDir, { withFileTypes: true });
    const maxSessions = Number.isFinite(options && options.maxSessions)
      ? Math.max(1, options.maxSessions)
      : 10;
    const sessions = [];

    directoryEntries.forEach((entry) => {
      if (!entry.isFile() || !/\.jsonl$/i.test(entry.name)) {
        return;
      }

      const filePath = NODE_PATH.join(resolvedDir, entry.name);
      const stats = NODE_FS.statSync(filePath);

      try {
        const raw = NODE_FS.readFileSync(filePath, 'utf8');
        const summary = summarizeVSCodeCopilotSession(raw, {
          fileName: entry.name,
          updatedAt: stats.mtime.toISOString(),
        });

        if (summary.requestCount > 0 && summary.messageCount > 0) {
          sessions.push(summary);
        }
      } catch (error) {
        // Ignore malformed or unsupported session files during listing.
      }
    });

    return sessions
      .sort((left, right) => toSortableTimestamp(right.updatedAt) - toSortableTimestamp(left.updatedAt))
      .slice(0, maxSessions);
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

  function adaptRoleHeadingTranscript(input, options) {
    if (typeof input !== 'string' || input.trim().length === 0) {
      throw new Error(`${options.adapterName} 需要非空文字輸入`);
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
      const detectedRole = detectTranscriptRole(line, options.roleAliases);
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
      throw new Error(options.invalidMessage);
    }

    return createConversationDoc(messages.map((message) => ({
      ...message,
      source: options.source,
    })), stripControlMetadata(options.metadata));
  }

  function adaptChatGPTSharedConversation(input, metadata) {
    return adaptRoleHeadingTranscript(input, {
      adapterName: 'ChatGPTAdapter',
      invalidMessage: '無法辨識為 ChatGPT 分享頁 transcript',
      metadata,
      roleAliases: CHATGPT_TRANSCRIPT_ROLE_ALIASES,
      source: 'chatgpt',
    });
  }

  function adaptGeminiTranscriptConversation(input, metadata) {
    return adaptRoleHeadingTranscript(input, {
      adapterName: 'GeminiAdapter',
      invalidMessage: '無法辨識為 Gemini transcript',
      metadata,
      roleAliases: GEMINI_TRANSCRIPT_ROLE_ALIASES,
      source: 'gemini',
    });
  }

  function adaptGeminiConversation(input, metadata) {
    if (typeof input !== 'string' || input.trim().length === 0) {
      throw new Error('GeminiAdapter 需要非空文字輸入');
    }

    try {
      return adaptGeminiTranscriptConversation(input, metadata);
    } catch (_transcriptError) {
      // 若貼入的不是完整 transcript（例如只複製了 Gemini 回應片段，沒有角色標頭），
      // 退回純文字處理，保留 gemini source 標記供寫回時顯示正確來源 badge。
      return createConversationDoc(
        [{ role: 'user', content: input.trim(), source: 'gemini', timestamp: null }],
        stripControlMetadata(metadata)
      );
    }
  }

  function adaptClaudeTranscriptConversation(input, metadata) {
    return adaptRoleHeadingTranscript(input, {
      adapterName: 'ClaudeAdapter',
      invalidMessage: '無法辨識為 Claude transcript',
      metadata,
      roleAliases: CLAUDE_TRANSCRIPT_ROLE_ALIASES,
      source: 'claude',
    });
  }

  function adaptClaudeConversation(input, metadata) {
    if (typeof input !== 'string' || input.trim().length === 0) {
      throw new Error('ClaudeAdapter 需要非空文字輸入');
    }

    return adaptClaudeTranscriptConversation(input, metadata);
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

  function adaptOpenAIConversationItems(input, metadata) {
    const normalizedMetadata = stripControlMetadata(metadata);
    const messages = extractOpenAIConversationMessages(input, {
      source: normalizedMetadata.source || 'chatgpt-api',
    });

    if (messages.length === 0) {
      throw new Error('OpenAI conversation items 未找到可匯入的文字訊息');
    }

    return createConversationDoc(messages, {
      ...normalizedMetadata,
      sessionId: normalizedMetadata.sessionId || normalizedMetadata.conversationId || undefined,
    });
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

    if (hint === 'gemini-text') {
      return adaptGeminiTranscriptConversation(input, metadata);
    }

    if (hint === 'claude-text') {
      return adaptClaudeTranscriptConversation(input, metadata);
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

    if (transcriptHasRoleHeading(input, CLAUDE_TRANSCRIPT_ROLE_ALIASES)) {
      try {
        return adaptClaudeTranscriptConversation(input, metadata);
      } catch (claudeError) {
        // Fall through to other adapters when Claude parsing fails.
      }
    }

    try {
      return adaptChatGPTSharedConversation(input, metadata);
    } catch (error) {
      try {
        return adaptGeminiTranscriptConversation(input, metadata);
      } catch (geminiError) {
        return adaptPlainTextConversation(input, metadata);
      }
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
    adaptOpenAIConversationItems,
    adaptClaudeConversation,
    adaptGeminiConversation,
    adaptConversationInput,
    adaptVSCodeCopilotConversation,
    adaptPlainTextConversation,
    conversationDocToText,
    createConversationDoc,
    extractVSCodeCopilotSessionSnapshot,
    getDefaultVSCodeCopilotSessionDir,
    listVSCodeCopilotSessionsFromDirectory,
    listDefaultVSCodeCopilotSessionDirs,
    resolveVSCodeCopilotSessionDir,
    summarizeVSCodeCopilotSession,
    validateConversationDoc,
  };
});
