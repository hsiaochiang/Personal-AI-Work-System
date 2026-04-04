(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    return;
  }

  root.RuleConflictUtils = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const NEGATION_TERMS = ['不要', '不得', '避免', '禁止', '不應', '不能', '不希望', '不用', '先不', '不先'];
  const METADATA_KEYS = ['狀態', '來源依據'];

  const SIGNAL_GROUPS = [
    {
      key: 'detail-level',
      label: '精簡 vs 詳細',
      left: {
        label: '精簡',
        terms: ['精簡', '簡潔', '簡短', '精要'],
      },
      right: {
        label: '詳細',
        terms: ['詳細', '完整說明', '完整展開', '展開說明', '步驟完整'],
      },
    },
    {
      key: 'planning-order',
      label: '先規劃 vs 直接實作',
      left: {
        label: '先規劃',
        terms: ['先規劃', '先討論目標', '先完成較完整的規劃', '先整理目標', '先定設計原則', '先收斂策略'],
      },
      right: {
        label: '直接實作',
        terms: ['直接開始實作', '直接實作', '立即實作', '先做再說', '直接落地', '跳入實作', '跳入工具與實作'],
      },
    },
    {
      key: 'language-style',
      label: '白話直覺 vs 術語抽象',
      left: {
        label: '白話直覺',
        terms: ['白話', '直覺', '可直接理解', '容易理解', '易讀', '清楚'],
      },
      right: {
        label: '術語抽象',
        terms: ['術語', '抽象', '過度術語化', '只有設計者自己懂', '不夠直覺'],
      },
    },
  ];

  const TOPIC_PATTERNS = [
    { key: 'automation', label: '自動化', terms: ['自動化'] },
    { key: 'implementation', label: '實作 / 落地', terms: ['實作', '落地', '開始做'] },
    { key: 'planning', label: '規劃', terms: ['規劃', '策略', '原則'] },
    { key: 'detail', label: '詳細說明', terms: ['詳細', '完整說明', '完整展開'] },
    { key: 'concise', label: '精簡', terms: ['精簡', '簡潔', '簡短'] },
  ];

  function normalizeText(value) {
    return String(value || '')
      .normalize('NFKC')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/[^\p{Letter}\p{Number}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function findAllMatches(text, term) {
    const regex = new RegExp(escapeRegExp(term.toLowerCase()), 'g');
    const matches = [];
    let match = regex.exec(text);
    while (match) {
      matches.push({ index: match.index, match: match[0] });
      match = regex.exec(text);
    }
    return matches;
  }

  function isNegated(text, index) {
    const context = text.slice(Math.max(0, index - 8), index);
    return NEGATION_TERMS.some(term => context.includes(term.toLowerCase()));
  }

  function shouldSkipTitle(title) {
    return /^規則 \d+$/.test(title)
      || /^輸出模式 \d+/.test(title)
      || /^任務模式 \d+/.test(title);
  }

  function extractComparableTexts(rule) {
    const chunks = [];
    const rawTitle = String(rule && rule.title || '').trim();
    if (rawTitle) {
      if (rawTitle.includes('：')) {
        chunks.push(rawTitle.split('：').slice(1).join('：').trim());
      } else if (!shouldSkipTitle(rawTitle)) {
        chunks.push(rawTitle);
      }
    }

    String(rule && rule.body || '')
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .forEach(line => {
        const keyValue = line.match(/^-\s*(.+?)：(.+)$/);
        if (keyValue) {
          const key = keyValue[1].trim();
          if (!METADATA_KEYS.includes(key)) {
            chunks.push(keyValue[2].trim());
          }
          return;
        }

        const bullet = line.match(/^[-*•]\s*(.+)$/);
        if (bullet) {
          chunks.push(bullet[1].trim());
          return;
        }

        const numbered = line.match(/^\d+\.\s*(.+)$/);
        if (numbered) {
          chunks.push(numbered[1].trim());
          return;
        }

        chunks.push(line);
      });

    return chunks.filter(Boolean);
  }

  function buildComparableText(rule) {
    return normalizeText(extractComparableTexts(rule).join(' '));
  }

  function detectSignalStances(text, signal) {
    const stances = { left: false, right: false, evidence: [] };

    ['left', 'right'].forEach(side => {
      signal[side].terms.forEach(term => {
        findAllMatches(text, term).forEach(match => {
          const actualSide = isNegated(text, match.index)
            ? (side === 'left' ? 'right' : 'left')
            : side;
          stances[actualSide] = true;
          stances.evidence.push({
            term,
            actualSide,
          });
        });
      });
    });

    return stances;
  }

  function detectTopicPolarity(text, topic) {
    const polarity = { positive: false, negative: false };

    topic.terms.forEach(term => {
      findAllMatches(text, term).forEach(match => {
        if (isNegated(text, match.index)) {
          polarity.negative = true;
          return;
        }
        polarity.positive = true;
      });
    });

    return polarity;
  }

  function buildPairConflictId(ruleA, ruleB, signalKey) {
    return [ruleA.id, ruleB.id].sort().join('::') + `::${signalKey}`;
  }

  function buildSignalReason(ruleA, ruleB, signal, stanceA, stanceB) {
    return `「${ruleA.title}」偏向 ${signal[stanceA].label}，而「${ruleB.title}」偏向 ${signal[stanceB].label}`;
  }

  function buildTopicReason(ruleA, ruleB, topic) {
    return `「${ruleA.title}」與「${ruleB.title}」對「${topic.label}」提出相反要求`;
  }

  function detectPairConflicts(ruleA, ruleB) {
    if (!ruleA || !ruleB || ruleA.category !== ruleB.category) {
      return [];
    }

    const comparableA = buildComparableText(ruleA);
    const comparableB = buildComparableText(ruleB);
    const conflicts = [];
    const seenKeys = new Set();

    SIGNAL_GROUPS.forEach(signal => {
      const stanceA = detectSignalStances(comparableA, signal);
      const stanceB = detectSignalStances(comparableB, signal);

      const combinations = [
        ['left', 'right'],
        ['right', 'left'],
      ];

      combinations.forEach(([leftSide, rightSide]) => {
        if (!stanceA[leftSide] || !stanceB[rightSide]) {
          return;
        }

        const signalKey = signal.key + ':' + leftSide + '-' + rightSide;
        if (seenKeys.has(signalKey)) {
          return;
        }
        seenKeys.add(signalKey);

        conflicts.push({
          id: buildPairConflictId(ruleA, ruleB, signalKey),
          category: ruleA.category,
          ruleIds: [ruleA.id, ruleB.id],
          ruleTitles: [ruleA.title, ruleB.title],
          signalKey,
          signalLabel: signal.label,
          reason: buildSignalReason(ruleA, ruleB, signal, leftSide, rightSide),
        });
      });
    });

    TOPIC_PATTERNS.forEach(topic => {
      const polarityA = detectTopicPolarity(comparableA, topic);
      const polarityB = detectTopicPolarity(comparableB, topic);
      const oppositePolarity = (
        (polarityA.positive && polarityB.negative)
        || (polarityA.negative && polarityB.positive)
      );
      if (!oppositePolarity) {
        return;
      }

      const signalKey = `topic:${topic.key}`;
      if (seenKeys.has(signalKey)) {
        return;
      }
      seenKeys.add(signalKey);

      conflicts.push({
        id: buildPairConflictId(ruleA, ruleB, signalKey),
        category: ruleA.category,
        ruleIds: [ruleA.id, ruleB.id],
        ruleTitles: [ruleA.title, ruleB.title],
        signalKey,
        signalLabel: `${topic.label} 的正反要求`,
        reason: buildTopicReason(ruleA, ruleB, topic),
      });
    });

    return conflicts;
  }

  function enrichRulesWithConflicts(rules) {
    const nextRules = (rules || []).map(rule => ({
      ...rule,
      conflict: false,
      conflictWith: [],
      conflictReasons: [],
    }));
    const conflicts = [];
    const conflictIds = new Set();

    for (let i = 0; i < nextRules.length; i += 1) {
      for (let j = i + 1; j < nextRules.length; j += 1) {
        const pairConflicts = detectPairConflicts(nextRules[i], nextRules[j]);
        pairConflicts.forEach(conflict => {
          if (conflictIds.has(conflict.id)) {
            return;
          }
          conflictIds.add(conflict.id);
          conflicts.push(conflict);

          const leftRule = nextRules[i];
          const rightRule = nextRules[j];
          leftRule.conflict = true;
          rightRule.conflict = true;
          leftRule.conflictWith.push(rightRule.id);
          rightRule.conflictWith.push(leftRule.id);
          leftRule.conflictReasons.push({
            otherRuleId: rightRule.id,
            otherRuleTitle: rightRule.title,
            signalLabel: conflict.signalLabel,
            reason: conflict.reason,
          });
          rightRule.conflictReasons.push({
            otherRuleId: leftRule.id,
            otherRuleTitle: leftRule.title,
            signalLabel: conflict.signalLabel,
            reason: conflict.reason,
          });
        });
      }
    }

    nextRules.forEach(rule => {
      rule.conflictWith = Array.from(new Set(rule.conflictWith));
      rule.conflictReasons = rule.conflictReasons.filter((item, index, list) => {
        const key = `${item.otherRuleId}::${item.signalLabel}`;
        return list.findIndex(entry => `${entry.otherRuleId}::${entry.signalLabel}` === key) === index;
      });
    });

    const byCategoryMap = new Map();
    conflicts.forEach(conflict => {
      const existing = byCategoryMap.get(conflict.category) || {
        category: conflict.category,
        pairCount: 0,
        ruleIds: new Set(),
      };
      existing.pairCount += 1;
      conflict.ruleIds.forEach(ruleId => existing.ruleIds.add(ruleId));
      byCategoryMap.set(conflict.category, existing);
    });

    const summary = {
      pairCount: conflicts.length,
      conflictRuleCount: nextRules.filter(rule => rule.conflict).length,
      byCategory: Array.from(byCategoryMap.values()).map(entry => ({
        category: entry.category,
        pairCount: entry.pairCount,
        ruleCount: entry.ruleIds.size,
      })),
    };

    return {
      rules: nextRules,
      conflicts,
      summary,
    };
  }

  return {
    NEGATION_TERMS,
    SIGNAL_GROUPS,
    TOPIC_PATTERNS,
    buildComparableText,
    detectPairConflicts,
    enrichRulesWithConflicts,
    extractComparableTexts,
    normalizeText,
  };
});
