(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./memory-source-utils.js'));
    return;
  }

  root.MemoryHealthUtils = factory(root.MemorySourceUtils);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (memorySourceUtils) {
  if (!memorySourceUtils) {
    throw new Error('MemoryHealthUtils 需要 MemorySourceUtils');
  }

  const DATE_RE = /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/;

  function pad2(value) {
    return String(value).padStart(2, '0');
  }

  function normalizeDateOnly(value) {
    if (!value) {
      return '';
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.toISOString().slice(0, 10);
    }

    const text = String(value).trim();
    const match = text.match(DATE_RE);
    if (!match) {
      return '';
    }

    return `${match[1]}-${pad2(match[2])}-${pad2(match[3])}`;
  }

  function parseMemoryGroupDate(title) {
    return normalizeDateOnly(title);
  }

  function dateOnlyToUTC(dateOnly) {
    const match = normalizeDateOnly(dateOnly).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      return null;
    }

    return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  function diffDays(fromDateOnly, toDateOnly) {
    const fromUTC = dateOnlyToUTC(fromDateOnly);
    const toUTC = dateOnlyToUTC(toDateOnly);
    if (fromUTC === null || toUTC === null) {
      return null;
    }

    return Math.floor((toUTC - fromUTC) / 86400000);
  }

  function getFreshnessBreakdown(dateOnly, now) {
    const normalizedNow = normalizeDateOnly(now || new Date());
    if (!dateOnly || !normalizedNow) {
      return {
        score: 0.75,
        bucket: 'unknown',
        label: '缺少日期',
        ageDays: null,
      };
    }

    const ageDays = diffDays(dateOnly, normalizedNow);
    if (ageDays === null) {
      return {
        score: 0.75,
        bucket: 'unknown',
        label: '缺少日期',
        ageDays: null,
      };
    }

    if (ageDays <= 30) {
      return { score: 1, bucket: 'recent', label: '最近 30 天', ageDays };
    }

    if (ageDays <= 90) {
      return { score: 0.82, bucket: 'steady', label: '90 天內', ageDays };
    }

    if (ageDays <= 180) {
      return { score: 0.62, bucket: 'aging', label: '180 天內', ageDays };
    }

    if (ageDays <= 365) {
      return { score: 0.42, bucket: 'old', label: '1 年內', ageDays };
    }

    return { score: 0.22, bucket: 'stale', label: '超過 1 年', ageDays };
  }

  function getSourceWeight(source) {
    const normalizedSource = memorySourceUtils.normalizeMemorySource(source);

    if (!normalizedSource) {
      return 0.75;
    }

    if (normalizedSource === 'copilot') {
      return 1;
    }

    if (normalizedSource === 'chatgpt') {
      return 0.96;
    }

    if (normalizedSource === 'chatgpt-api') {
      return 0.98;
    }

    if (normalizedSource === 'plain') {
      return 0.88;
    }

    if (normalizedSource.startsWith('custom:')) {
      return 0.82;
    }

    return 0.8;
  }

  function getSourceLabel(source) {
    const presentation = memorySourceUtils.getMemorySourcePresentation(source);
    return presentation ? presentation.label : '未標記來源';
  }

  function hasKnownSource(source) {
    return Boolean(memorySourceUtils.normalizeMemorySource(source));
  }

  function roundScore(value) {
    return Math.round(value * 100) / 100;
  }

  function getHealthStatus(score, freshnessBucket, knownSource) {
    if (freshnessBucket === 'unknown') {
      return 'review';
    }

    if (!knownSource) {
      return freshnessBucket === 'stale' ? 'stale' : 'review';
    }

    if (score >= 0.72) {
      return 'healthy';
    }

    if (score >= 0.45) {
      return 'review';
    }

    return 'stale';
  }

  function getHealthReason(status, freshness, sourceLabel, knownSource) {
    if (freshness.bucket === 'unknown') {
      return `缺少日期，依 ${sourceLabel} 先列待確認`;
    }

    if (!knownSource && status === 'review') {
      return `${freshness.label}，缺少來源標記，建議人工確認`;
    }

    if (!knownSource && status === 'stale') {
      return `${freshness.label}，缺少來源標記且已進入過期風險`;
    }

    if (status === 'healthy') {
      return `${freshness.label}，來源 ${sourceLabel}`;
    }

    if (status === 'review') {
      return `${freshness.label}，建議近期再確認`;
    }

    return `${freshness.label}，已進入過期風險`;
  }

  function getMemoryHealthPresentation(status) {
    if (status === 'healthy') {
      return {
        label: '健康',
        className: 'health-healthy',
      };
    }

    if (status === 'review') {
      return {
        label: '待確認',
        className: 'health-review',
      };
    }

    if (status === 'stale') {
      return {
        label: '過期風險',
        className: 'health-stale',
      };
    }

    return null;
  }

  function buildMemoryHealth(item, groupTitle, now) {
    const extractedAt = parseMemoryGroupDate(groupTitle);
    const freshness = getFreshnessBreakdown(extractedAt, now);
    const sourceWeight = getSourceWeight(item.source);
    const knownSource = hasKnownSource(item.source);
    const score = roundScore(freshness.score * sourceWeight);
    const status = getHealthStatus(score, freshness.bucket, knownSource);
    const sourceLabel = getSourceLabel(item.source);

    return {
      status,
      score,
      reason: getHealthReason(status, freshness, sourceLabel, knownSource),
      extractedAt,
      freshness: {
        label: freshness.label,
        bucket: freshness.bucket,
        ageDays: freshness.ageDays,
      },
      sourceWeight: roundScore(sourceWeight),
    };
  }

  function enrichMemoryGroups(markdown, options) {
    const groups = memorySourceUtils.parseMemoryMarkdown(markdown);
    const now = options && options.now ? options.now : new Date();

    return groups.map(group => ({
      title: group.title,
      extractedAt: parseMemoryGroupDate(group.title),
      items: group.items.map(item => ({
        content: item.content,
        source: item.source,
        health: buildMemoryHealth(item, group.title, now),
      })),
    }));
  }

  function summarizeGroups(groups) {
    const summary = {
      totalItems: 0,
      healthyCount: 0,
      reviewCount: 0,
      staleCount: 0,
      needsAttentionCount: 0,
      staleRatio: 0,
    };

    groups.forEach(group => {
      group.items.forEach(item => {
        summary.totalItems += 1;
        if (item.health.status === 'healthy') {
          summary.healthyCount += 1;
          return;
        }

        if (item.health.status === 'review') {
          summary.reviewCount += 1;
          return;
        }

        summary.staleCount += 1;
      });
    });

    summary.needsAttentionCount = summary.reviewCount + summary.staleCount;
    summary.staleRatio = summary.totalItems
      ? Math.round((summary.staleCount / summary.totalItems) * 1000) / 10
      : 0;

    return summary;
  }

  function mergeSummary(target, addition) {
    target.totalItems += addition.totalItems;
    target.healthyCount += addition.healthyCount;
    target.reviewCount += addition.reviewCount;
    target.staleCount += addition.staleCount;
    target.needsAttentionCount += addition.needsAttentionCount;
  }

  function finalizeSummary(summary) {
    summary.staleRatio = summary.totalItems
      ? Math.round((summary.staleCount / summary.totalItems) * 1000) / 10
      : 0;
    return summary;
  }

  function buildMemoryApiPayload(files, options) {
    const overall = {
      totalItems: 0,
      healthyCount: 0,
      reviewCount: 0,
      staleCount: 0,
      needsAttentionCount: 0,
      staleRatio: 0,
    };

    const enrichedFiles = (files || []).map(file => {
      const groups = enrichMemoryGroups(file.content, options);
      const healthSummary = summarizeGroups(groups);
      mergeSummary(overall, healthSummary);

      return {
        filename: file.filename,
        content: file.content,
        groups,
        healthSummary,
      };
    });

    return {
      files: enrichedFiles,
      summary: finalizeSummary(overall),
    };
  }

  return {
    buildMemoryApiPayload,
    enrichMemoryGroups,
    getFreshnessBreakdown,
    getMemoryHealthPresentation,
    getSourceWeight,
    parseMemoryGroupDate,
  };
});
