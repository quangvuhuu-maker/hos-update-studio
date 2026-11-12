// Smart Hybrid Parser (DOM + Heuristic Rules + Contextual CTA Synthesizer + Optional Gemini AI)

const MONTH_DATE_RE = /^((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(?:\s*[-–—]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{1,2})?)\s+(.*)$/i;

/**
 * Synthesize a meaningful CTA label when the anchor text is generic ("here", "form", "RSVP", etc.)
 */
export function synthesizeCtaLabel(anchorText, fullSentence, blockTitle = '') {
  const raw = (anchorText || '').trim();
  const sentence = (fullSentence || '').trim();
  const lowerRaw = raw.toLowerCase();
  const lowerSent = sentence.toLowerCase();

  if (lowerRaw === 'here' || lowerRaw === 'form' || lowerRaw === 'link') {
    if (lowerSent.includes('local emergency')) return 'Local Emergency Contact Form';
    if (lowerSent.includes('overseas emergency')) return 'Overseas Emergency Contact Form';
    if (lowerSent.includes('contact information in hanoi') || lowerSent.includes('update your contact')) {
      return 'Update Hanoi Contact Info';
    }
    if (lowerSent.includes('devotion')) return 'Sign Up to Lead Devotions';
    if (lowerSent.includes('questions') || lowerSent.includes('prayer')) {
      return 'Submit Question / Prayer Request';
    }
    if (lowerSent.includes('duty')) return 'View Bus Duty Schedule';
    // Fallback: use surrounding words
    const cleaned = sentence
      .replace(/please\s+/i, '')
      .replace(/\bhere\b/i, '')
      .replace(/[.!]+$/, '')
      .trim();
    if (cleaned.length > 4 && cleaned.length <= 48) {
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    return blockTitle ? `Open ${blockTitle}` : 'Open Link';
  }

  if (lowerRaw.startsWith('rsvp')) {
    const byMatch = sentence.match(/by:?\s*([A-Za-z0-9.,\s]+)$/i);
    if (byMatch) {
      return `RSVP (by ${byMatch[1].trim()})`;
    }
    return 'RSVP Now';
  }

  if (lowerRaw === 'buffet menu') return 'View Buffet Menu';
  if (lowerRaw.includes('quarter') && lowerRaw.includes('duty')) {
    return `View ${raw.charAt(0).toUpperCase() + raw.slice(1)} Roster`;
  }
  if (lowerRaw.includes('contract renewal')) {
    return 'View Contract Renewal & Resignation Policy';
  }
  if (lowerRaw.includes('regional pd')) {
    return 'Open Full Regional PD List';
  }

  return raw;
}

/**
 * Sanitize HTML string while keeping safe formatting tags (strong, b, em, i, u, a, br, ul, ol, li, span, img)
 */
export function cleanInlineHtml(node) {
  if (!node) return '';
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const tag = node.tagName.toLowerCase();
  const childrenHtml = Array.from(node.childNodes).map(cleanInlineHtml).join('');

  if (tag === 'strong' || tag === 'b') {
    return childrenHtml.trim() ? `<strong>${childrenHtml}</strong>` : childrenHtml;
  }
  if (tag === 'em' || tag === 'i') {
    return childrenHtml.trim() ? `<em>${childrenHtml}</em>` : childrenHtml;
  }
  if (tag === 'u') {
    return childrenHtml.trim() ? `<u>${childrenHtml}</u>` : childrenHtml;
  }
  if (tag === 'a') {
    const href = node.getAttribute('href') || '#';
    return `<a href="${href.replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer">${childrenHtml}</a>`;
  }
  if (tag === 'br') {
    return '<br/>';
  }
  if (tag === 'img') {
    const src = node.getAttribute('src') || '';
    const alt = node.getAttribute('alt') || 'Newsletter Image';
    if (src) {
      return `<img src="${src}" alt="${alt.replace(/"/g, '&quot;')}" />`;
    }
    return '';
  }
  // Check inline style for Google Docs bold/italic spans
  const style = (node.getAttribute('style') || '').toLowerCase();
  let wrapped = childrenHtml;
  if (style.includes('font-weight:700') || style.includes('font-weight: 700') || style.includes('font-weight:bold') || style.includes('font-weight: bold')) {
    wrapped = `<strong>${wrapped}</strong>`;
  }
  if (style.includes('font-style:italic') || style.includes('font-style: italic')) {
    wrapped = `<em>${wrapped}</em>`;
  }
  return wrapped;
}

/**
 * Determine if a paragraph element is a standalone bold heading
 */
function inspectParagraph(pNode) {
  const text = (pNode.textContent || '').replace(/\u00a0/g, ' ').trim();
  if (!text) return null;

  const tag = pNode.tagName ? pNode.tagName.toLowerCase() : 'p';
  const isHeadingTag = /^h[1-6]$/.test(tag);

  // Extract links
  const links = Array.from(pNode.querySelectorAll('a')).map((a) => ({
    text: (a.textContent || '').trim(),
    url: a.getAttribute('href') || '',
  })).filter((l) => l.url);

  // Extract images
  const images = Array.from(pNode.querySelectorAll('img')).map((img) => ({
    src: img.getAttribute('src') || '',
    alt: img.getAttribute('alt') || '',
  })).filter((img) => img.src);

  // Check if entire text is bold
  const html = cleanInlineHtml(pNode);
  const strongNodes = pNode.querySelectorAll('strong, b, [style*="font-weight:700"], [style*="font-weight: 700"], [style*="font-weight:bold"]');
  const boldText = Array.from(strongNodes).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
  const normalizedText = text.replace(/\s+/g, ' ').trim();

  const isAllBold = isHeadingTag || (boldText.length > 0 && boldText.length >= normalizedText.length * 0.88);

  // Check if paragraph starts with a distinct bold title followed immediately by normal sentences
  // e.g. "<strong>EARCOS Triannual Journal Contribution- Share your work!</strong>We encourage all faculty..."
  let splitLeadHeading = null;
  if (!isAllBold && strongNodes.length > 0) {
    const firstStrong = strongNodes[0];
    const firstStrongText = (firstStrong.textContent || '').trim();
    if (
      normalizedText.startsWith(firstStrongText) &&
      firstStrongText.length >= 22 &&
      firstStrongText.length <= 95 &&
      /[!:]/.test(firstStrongText.slice(-2))
    ) {
      const remainderText = normalizedText.slice(firstStrongText.length).trim();
      if (remainderText.length > 20) {
        splitLeadHeading = {
          heading: firstStrongText,
          remainderText,
          remainderHtml: html.replace(/^\s*<strong>.*?<\/strong>\s*/i, ''),
        };
      }
    }
  }

  return {
    text,
    normalizedText,
    html,
    isAllBold,
    isHeadingTag,
    links,
    images,
    splitLeadHeading,
  };
}

/**
 * Classify a section heading into one of our 8 priority categories
 */
export function classifyHeading(headingText) {
  const h = (headingText || '').trim();
  const lower = h.toLowerCase();

  if (/^hos\s+(monthly\s+)?update\s+archive/i.test(h) || lower === 'archive' || lower === 'archives') {
    return 'archive';
  }
  if (/^calendar\b/i.test(h) || lower.includes('major events in the month') || lower.includes('major calendar')) {
    return 'calendar';
  }
  if (/^bus\s+duty\b/i.test(h)) {
    return 'bus_duty';
  }
  if (/^devotions?\s+sign/i.test(h) || /^weekly\s+devotions/i.test(h)) {
    return 'devotions';
  }
  if (
    lower.startsWith('questions, comments') ||
    lower.includes('concerns, and prayer requests') ||
    lower.includes('question comments response')
  ) {
    return 'qa_concerns';
  }
  if (
    /^personnel\s+update/i.test(h) ||
    /^admins?\s+travel/i.test(h) ||
    lower.includes('contract dates') ||
    lower.includes('faculty and staff contact') ||
    lower.includes('earcos teacher representative')
  ) {
    return 'personnel';
  }

  // Professional Training & Development
  if (
    lower.includes('professional development') ||
    lower.includes('professional learning') ||
    lower.includes('pd opportunit') ||
    lower.includes('training') ||
    lower.includes('certification') ||
    lower.includes('workshop') ||
    lower.includes('webinar') ||
    lower.includes('course') ||
    lower.includes('edtech') ||
    lower.includes('learning opportunit') ||
    /\bpd\b/i.test(h)
  ) {
    return 'professional_training';
  }

  // Community Building (Birthdays, Trivia Nights, Christmas/Staff parties, Social gatherings)
  if (
    /^birthdays?\b/i.test(h) ||
    lower.includes('birthday') ||
    lower.includes('trivia night') ||
    lower.includes('christmas party') ||
    lower.includes('staff & family') ||
    lower.includes('staff party') ||
    lower.includes('faculty party') ||
    lower.includes('staff lunch') ||
    lower.includes('happy hour') ||
    lower.includes('potluck') ||
    lower.includes('community building') ||
    lower.includes('community milestone') ||
    lower.includes('team building')
  ) {
    return 'community_building';
  }

  // Featured Campus Events (Fairs, runs, conferences, performances, tournaments)
  if (
    lower.includes('fair') ||
    lower.includes('fun run') ||
    lower.includes('carnival') ||
    lower.includes('festival') ||
    lower.includes('mun') ||
    lower.includes('concert') ||
    lower.includes('performance') ||
    lower.includes('exhibition') ||
    lower.includes('invitational') ||
    lower.includes('tournament') ||
    /\bevents?\b/i.test(h)
  ) {
    return 'events';
  }

  return 'announcements';
}

/**
 * Decide whether a bold line is a true top-level section header vs an inline sub-heading
 */
function isMajorSectionHeader(info, currentCategory) {
  const t = info.normalizedText;
  const lower = t.toLowerCase();

  // Document title
  if (/^hos\s+(monthly\s+)?update\s*[-–—]/i.test(t) && info.links.length === 0) {
    return 'DOC_TITLE';
  }

  // Known primary sections always start a new section
  if (
    /^birthdays?\b/i.test(t) ||
    /^calendar\b/i.test(t) ||
    /^personnel\s+update\b/i.test(t) ||
    /^bus\s+duty\b/i.test(t) ||
    /^questions,\s*comments/i.test(t) ||
    /^devotions?\s+sign/i.test(t) ||
    /^hos\s+(monthly\s+)?update\s+archive/i.test(t) ||
    /^admins?\s+travel\b/i.test(t)
  ) {
    return true;
  }

  // If we are inside Archive, bold links are archive items, NOT section headers!
  if (currentCategory === 'archive') {
    return false;
  }

  // Sub-headings inside an event or Q&A or Personnel block that should stay inside the current block:
  if (
    /^(who|what|where|when|why|attire|rsvp|question|response)\b/i.test(t) ||
    /^program\s+for\s+the\s+evening/i.test(t) ||
    /^deadline\s+for\s+the\s+following/i.test(t) ||
    /^contract\s+dates\s+for/i.test(t) ||
    /^goal\s+setting\b/i.test(t) ||
    /^\d{1,2}:\d{2}\b/.test(t) ||
    t.endsWith(':')
  ) {
    return false;
  }

  // If it's all bold, no links, and between 10 and 110 chars, check if it's a sub-section of Personnel or a new Featured Event
  if (info.isAllBold && info.links.length === 0 && t.length >= 10 && t.length <= 110) {
    // Keep Personnel sub-topics either as distinct personnel cards or structured items
    return true;
  }

  return false;
}

/**
 * Parse Calendar items (supports multi-line events under a single date)
 */
export function parseCalendarItems(lines) {
  const events = [];
  for (const line of lines) {
    const raw = line.text.trim();
    if (!raw) continue;
    const match = raw.match(MONTH_DATE_RE);
    if (match) {
      const dateStr = match[1].replace(/\s+/g, ' ').trim();
      const titleStr = match[2].replace(/\s+/g, ' ').trim();
      events.push({
        date: dateStr,
        items: [titleStr],
        tag: detectCalendarEventTag(titleStr),
      });
    } else if (events.length > 0) {
      // Continuation line for the previous date (e.g., "Varsity Volleyball @ UNIS Invitational" or "CISH MUN")
      const prev = events[events.length - 1];
      prev.items.push(raw.replace(/\s+/g, ' ').trim());
    } else {
      events.push({
        date: 'Upcoming',
        items: [raw],
        tag: detectCalendarEventTag(raw),
      });
    }
  }
  return events;
}

function detectCalendarEventTag(title) {
  const lower = title.toLowerCase();
  if (lower.includes('no school') || lower.includes('break') || lower.includes('holiday')) {
    return { label: 'No School / Holiday', color: 'rose' };
  }
  if (lower.includes('early release') || lower.includes('pd')) {
    return { label: 'PD / Early Release', color: 'amber' };
  }
  if (lower.includes('staff meeting') || lower.includes('staff lunch')) {
    return { label: 'All Staff', color: 'emerald' };
  }
  if (lower.includes('carnival') || lower.includes('fair') || lower.includes('celebration') || lower.includes('trivia')) {
    return { label: 'Community', color: 'purple' };
  }
  return null;
}

/**
 * Parse Birthday items (supports multiple people on the same date)
 */
export function parseBirthdayItems(lines, formatFirstLast = false) {
  const groups = [];
  for (const line of lines) {
    const raw = line.text.trim();
    if (!raw) continue;
    const match = raw.match(MONTH_DATE_RE);
    if (match) {
      const dateStr = match[1].replace(/\s+/g, ' ').trim();
      const personStr = formatPersonName(match[2].replace(/\s+/g, ' ').trim(), formatFirstLast);
      groups.push({
        date: dateStr,
        people: [personStr],
      });
    } else if (groups.length > 0) {
      // Continuation person on same birthday
      const prev = groups[groups.length - 1];
      prev.people.push(formatPersonName(raw.replace(/\s+/g, ' ').trim(), formatFirstLast));
    }
  }
  return groups;
}

export function formatPersonName(nameStr, formatFirstLast = false) {
  if (!formatFirstLast) return nameStr;
  // Convert "Last, First" -> "First Last"
  const parts = nameStr.split(',');
  if (parts.length === 2) {
    return `${parts[1].trim()} ${parts[0].trim()}`;
  }
  return nameStr;
}

/**
 * Parse structured details inside Featured Events, Personnel, Q&A, and Archives
 */
function enrichBlockStructure(block) {
  const ctas = [];
  const seenUrls = new Set();

  // Extract CTAs from all paragraphs in block
  for (const p of block.paragraphs) {
    for (const l of p.links || []) {
      if (!l.url || seenUrls.has(l.url)) continue;
      // Don't create redundant CTA buttons for archive list items (they render as archive chips)
      if (block.category === 'archive') continue;
      seenUrls.add(l.url);
      ctas.push({
        label: synthesizeCtaLabel(l.text, p.text, block.title),
        url: l.url,
      });
    }
  }
  block.ctas = ctas;

  if (block.category === 'calendar') {
    block.calendarEvents = parseCalendarItems(block.paragraphs);
  } else if (
    block.category === 'birthdays' ||
    /birthdays?\b/i.test(block.title) ||
    (block.category === 'community_building' && /birthdays?\b/i.test(block.title))
  ) {
    block.birthdayGroups = parseBirthdayItems(block.paragraphs, false);
  } else if (block.category === 'archive') {
    block.archiveItems = block.paragraphs
      .map((p) => {
        const firstLink = (p.links && p.links[0]) || null;
        return {
          title: p.text.replace(/\s+/g, ' ').trim(),
          url: firstLink ? firstLink.url : '',
        };
      })
      .filter((item) => item.title);
  } else if (block.category === 'qa_concerns') {
    const introParagraphs = [];
    const qaPairs = [];
    let currentQ = null;

    for (const p of block.paragraphs) {
      const t = p.text.trim();
      if (/^question\s*:/i.test(t)) {
        currentQ = {
          question: t.replace(/^question\s*:\s*/i, '').trim(),
          response: '',
        };
        qaPairs.push(currentQ);
      } else if (/^response\s*:/i.test(t) || /^answer\s*:/i.test(t)) {
        const respText = t.replace(/^(response|answer)\s*:\s*/i, '').trim();
        if (currentQ) {
          currentQ.response = respText;
        } else {
          qaPairs.push({ question: 'Community Inquiry', response: respText });
        }
      } else if (currentQ && currentQ.response) {
        currentQ.response += ' ' + t;
      } else if (currentQ && !currentQ.response) {
        currentQ.question += ' ' + t;
      } else {
        introParagraphs.push(p);
      }
    }
    block.qaIntro = introParagraphs;
    block.qaPairs = qaPairs;
  } else if (
    block.category === 'events' ||
    block.category === 'announcements' ||
    block.category === 'professional_training' ||
    block.category === 'community_building' ||
    block.category === 'featured_events' ||
    block.category === 'personnel'
  ) {
    // Detect structured event metadata (Who/What/Where/When/Why/Attire) and Program Schedule (5:30 ..., 6:00 ...)
    const metaSpecs = [];
    const scheduleItems = [];
    const bodyParagraphs = [];

    for (const p of block.paragraphs) {
      const t = p.text.trim();
      const metaMatch = t.match(/^(Who|What|Where|When|Why|Attire)\s*[?:]\s*(.+)$/i);
      const timeMatch = t.match(/^(\d{1,2}:\d{2}(?:\s*(?:AM|PM))?)\s+(.+)$/i);

      if (metaMatch) {
        metaSpecs.push({
          key: metaMatch[1].charAt(0).toUpperCase() + metaMatch[1].slice(1).toLowerCase(),
          value: metaMatch[2].trim(),
          html: p.html,
        });
      } else if (timeMatch) {
        scheduleItems.push({
          time: timeMatch[1].trim(),
          activity: timeMatch[2].trim(),
        });
      } else if (/^program\s+for\s+the\s+evening\s*:?$/i.test(t)) {
        // Skip header label since scheduleItems renders its own Program header
      } else {
        bodyParagraphs.push(p);
      }
    }

    block.eventMeta = metaSpecs;
    block.scheduleItems = scheduleItems;
    block.bodyParagraphs = bodyParagraphs;
  }

  return block;
}

/**
 * Convert plain text into HTML paragraphs if user pasted plain text
 */
export function plainTextToHtml(text) {
  const lines = (text || '').split(/\r?\n/);
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const isHeader =
        /^(BIRTHDAYS|CALENDAR|PERSONNEL UPDATE|Bus Duty|Questions, Comments|Devotions Sign-ups|HOS Update Archive|HOS Monthly Update)/i.test(
          line
        );
      const escaped = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return isHeader ? `<p><strong>${escaped}</strong></p>` : `<p>${escaped}</p>`;
    })
    .join('\n');
}

/**
 * Main parser: Takes rich HTML string (from Google Docs paste or sample) and returns:
 * { newsletterTitle, blocks }
 */
export function parseNewsletterHtml(rawHtmlInput) {
  let htmlInput = (rawHtmlInput || '').trim();
  if (!htmlInput) {
    return { newsletterTitle: 'HOS Monthly Update', blocks: [] };
  }

  // If input doesn't contain HTML tags, convert plain text to HTML
  if (!/<[a-z][\s\S]*>/i.test(htmlInput)) {
    htmlInput = plainTextToHtml(htmlInput);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlInput, 'text/html');

  let newsletterTitle = 'HOS Monthly Update';
  const blocks = [];
  let currentBlock = null;

  const startNewBlock = (title, subtitle = '', forceCategory = null) => {
    const cleanTitle = title.replace(/\s+/g, ' ').trim();
    const category = forceCategory || classifyHeading(cleanTitle);
    currentBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${blocks.length}`,
      title: cleanTitle,
      subtitle: subtitle.trim(),
      category,
      paragraphs: [],
      tables: [],
      images: [],
      ctas: [],
    };
    blocks.push(currentBlock);
    return currentBlock;
  };

  // Traverse top-level content elements (p, h1-h6, table, ul, ol, div)
  const extractElements = (root) => {
    const results = [];
    for (const child of Array.from(root.children)) {
      const tag = child.tagName.toLowerCase();
      if (tag === 'table') {
        results.push({ type: 'table', node: child });
      } else if (tag === 'p' || /^h[1-6]$/.test(tag) || tag === 'li') {
        results.push({ type: 'para', node: child });
      } else if (tag === 'ul' || tag === 'ol') {
        for (const li of Array.from(child.querySelectorAll('li'))) {
          results.push({ type: 'para', node: li });
        }
      } else if (tag === 'div' || tag === 'section' || tag === 'article' || tag === 'b' || tag === 'span') {
        // Google Docs wraps content in <b id="docs-internal-guid-..."> or <div>
        const nested = extractElements(child);
        if (nested.length > 0) {
          results.push(...nested);
        } else if ((child.textContent || '').trim()) {
          results.push({ type: 'para', node: child });
        }
      }
    }
    return results;
  };

  const elements = extractElements(doc.body);

  for (const item of elements) {
    if (item.type === 'table') {
      if (!currentBlock) {
        startNewBlock('Featured Information', '', 'announcements');
      }
      const rows = [];
      for (const tr of Array.from(item.node.querySelectorAll('tr'))) {
        const cells = Array.from(tr.querySelectorAll('th, td')).map((cell) => ({
          text: (cell.textContent || '').replace(/\s+/g, ' ').trim(),
          html: cleanInlineHtml(cell),
        }));
        if (cells.some((c) => c.text)) {
          rows.push(cells);
        }
      }
      if (rows.length > 0) {
        currentBlock.tables.push({ rows });
      }
      continue;
    }

    const info = inspectParagraph(item.node);
    if (!info) continue;

    // Collect any embedded images
    if (info.images && info.images.length > 0) {
      if (!currentBlock) {
        startNewBlock('Featured Announcement', '', 'announcements');
      }
      currentBlock.images.push(...info.images);
    }

    // Check if paragraph has an inline bold lead-in heading (like "EARCOS Triannual Journal Contribution- Share your work!We encourage...")
    if (info.splitLeadHeading) {
      startNewBlock(info.splitLeadHeading.heading);
      currentBlock.paragraphs.push({
        text: info.splitLeadHeading.remainderText,
        html: info.splitLeadHeading.remainderHtml,
        links: info.links,
      });
      continue;
    }

    const headerDecision = isMajorSectionHeader(info, currentBlock ? currentBlock.category : null);

    if (headerDecision === 'DOC_TITLE') {
      newsletterTitle = info.normalizedText;
      continue;
    }

    if (headerDecision === true) {
      // Check for parenthetical note in Birthdays heading: "BIRTHDAYS (if your Birthday is this month and not listed, please let Ha Le know)"
      const bdayMatch = info.normalizedText.match(/^BIRTHDAYS\s*\((.+)\)$/i);
      if (bdayMatch) {
        startNewBlock('Faculty & Staff Birthdays', bdayMatch[1].trim(), 'community_building');
      } else if (/^CALENDAR\s*[-–—]\s*(.+)$/i.test(info.normalizedText)) {
        const calMatch = info.normalizedText.match(/^CALENDAR\s*[-–—]\s*(.+)$/i);
        startNewBlock('Major Calendar & Events', calMatch[1].trim(), 'calendar');
      } else {
        startNewBlock(info.normalizedText);
      }
      continue;
    }

    // Otherwise, append paragraph to currentBlock
    if (!currentBlock) {
      startNewBlock('General Announcement', '', 'announcements');
    }

    currentBlock.paragraphs.push({
      text: info.text,
      html: info.html,
      isSubheading:
        info.isAllBold &&
        info.links.length === 0 &&
        !/^\d{1,2}:\d{2}/.test(info.normalizedText),
      links: info.links,
    });
  }

  // Enrich each block's internal structure and filter out empty blocks
  const enrichedBlocks = blocks
    .filter((b) => b.paragraphs.length > 0 || b.tables.length > 0 || b.images.length > 0)
    .map(enrichBlockStructure);

  return {
    newsletterTitle,
    blocks: enrichedBlocks,
  };
}

/**
 * Sort parsed blocks according to user's configurable priority order
 */
export function sortBlocksByPriority(blocks, categoryOrder, pinArchiveBottom = true) {
  const rankMap = {};
  categoryOrder.forEach((cat, idx) => {
    rankMap[cat.id] = idx + 1;
  });

  return [...blocks].sort((a, b) => {
    if (pinArchiveBottom) {
      if (a.category === 'archive' && b.category !== 'archive') return 1;
      if (b.category === 'archive' && a.category !== 'archive') return -1;
    }
    const rankA = rankMap[a.category] ?? 99;
    const rankB = rankMap[b.category] ?? 99;
    return rankA - rankB;
  });
}

