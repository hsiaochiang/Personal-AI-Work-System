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
    ], metadata);
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
    adaptPlainTextConversation,
    conversationDocToText,
    createConversationDoc,
    validateConversationDoc,
  };
});
