(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    return;
  }

  root.MemorySourceUtils = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const SOURCE_COMMENT_RE = /\s*<!--\s*source:\s*([a-z0-9:-]+)\s*-->\s*$/i;

  function normalizeMemorySource(source) {
    if (typeof source !== 'string') {
      return '';
    }

    return source.trim().toLowerCase();
  }

  function sanitizeMemoryListContent(rawContent) {
    if (typeof rawContent !== 'string') {
      return '';
    }

    return rawContent
      .split('\n')[0]
      .replace(/^[-*•>#\d.)\s]+/, '')
      .trim();
  }

  function buildAttributedMemoryListItem(rawContent, source) {
    const content = sanitizeMemoryListContent(rawContent);
    const normalizedSource = normalizeMemorySource(source);

    if (!content) {
      return '';
    }

    return normalizedSource
      ? `- ${content} <!-- source: ${normalizedSource} -->`
      : `- ${content}`;
  }

  function parseAttributedMemoryListItem(line) {
    if (typeof line !== 'string') {
      return null;
    }

    const trimmed = line.trim();
    if (!trimmed.startsWith('- ')) {
      return null;
    }

    const withoutBullet = trimmed.replace(/^-\s*/, '');
    const match = withoutBullet.match(SOURCE_COMMENT_RE);
    const content = match
      ? withoutBullet.slice(0, match.index).trim()
      : withoutBullet.trim();
    const source = match ? normalizeMemorySource(match[1]) : '';

    return {
      content,
      source,
    };
  }

  function parseMemoryMarkdown(md) {
    const groups = [];
    let currentGroup = null;
    const lines = String(md || '').split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      const headerMatch = trimmed.match(/^#{2,3}\s+(.+)$/);
      if (headerMatch) {
        currentGroup = { title: headerMatch[1], items: [] };
        groups.push(currentGroup);
        continue;
      }

      if (!currentGroup || !trimmed.startsWith('- ')) {
        continue;
      }

      const item = parseAttributedMemoryListItem(trimmed);
      if (!item || !item.content) {
        continue;
      }

      currentGroup.items.push(item);
    }

    return groups;
  }

  function getMemorySourcePresentation(source) {
    const normalizedSource = normalizeMemorySource(source);

    if (!normalizedSource) {
      return null;
    }

    if (normalizedSource === 'chatgpt') {
      return { label: 'ChatGPT', className: 'source-chatgpt' };
    }

    if (normalizedSource === 'chatgpt-api') {
      return { label: 'ChatGPT API', className: 'source-chatgpt-api' };
    }

    if (normalizedSource === 'gemini') {
      return { label: 'Gemini', className: 'source-gemini' };
    }

    if (normalizedSource === 'gemini-llm') {
      return { label: 'AI 建議', className: 'source-gemini' };
    }

    if (normalizedSource === 'claude') {
      return { label: 'Claude', className: 'source-claude' };
    }

    if (normalizedSource === 'copilot') {
      return { label: 'Copilot', className: 'source-copilot' };
    }

    if (normalizedSource === 'plain') {
      return { label: 'Plain', className: 'source-plain' };
    }

    if (normalizedSource.startsWith('custom:')) {
      return {
        label: normalizedSource.slice('custom:'.length) || 'Custom',
        className: 'source-custom',
      };
    }

    return {
      label: normalizedSource,
      className: 'source-custom',
    };
  }

  return {
    buildAttributedMemoryListItem,
    getMemorySourcePresentation,
    normalizeMemorySource,
    parseAttributedMemoryListItem,
    parseMemoryMarkdown,
    sanitizeMemoryListContent,
  };
});
