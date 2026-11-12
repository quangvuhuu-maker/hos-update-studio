// Editorial & Swiss Typography Newsletter Renderer with Bespoke Seasonal Illustrations
import { CONCORDIA_BANNER_B64 } from './sampleData.js';
import { DEFAULT_CATEGORIES } from './themes.js';
import { formatPersonName } from './parser.js';
import { getSeasonalHeaderSvg, getSeasonalSectionMotifSvg } from './seasonalArtwork.js';

const SERIF_STACK = `Georgia, 'Times New Roman', Times, serif`;
const SANS_STACK = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

function getCategoryMeta(catId) {
  const normalizedId = catId === 'featured_events' ? 'announcements' : catId;
  return (
    DEFAULT_CATEGORIES.find((c) => c.id === normalizedId) || {
      id: catId,
      label: 'Announcements',
      kicker: 'ANNOUNCEMENTS & SPOTLIGHTS',
      badgeText: 'Announcements',
    }
  );
}

function styleInlineLinks(htmlStr, linkColor) {
  if (!htmlStr) return '';
  return htmlStr.replace(
    /<a\s+([^>]*?)>/gi,
    `<a $1 style="color: ${linkColor}; font-weight: 500; text-decoration: underline; text-underline-offset: 3px;">`
  );
}

function softenExcessiveBold(htmlStr, linkColor) {
  if (!htmlStr) return '';
  return styleInlineLinks(htmlStr, linkColor);
}

function renderSectionKicker(kickerText, sectionNumber, theme, isPrimary = false) {
  const topBorder = isPrimary ? `2px solid ${theme.primary}` : `1px solid ${theme.textMain}`;
  const motifSvg = getSeasonalSectionMotifSvg(theme.id);

  return `
    <div style="border-top: ${topBorder}; padding-top: 10px; margin-bottom: 18px;">
      <div style="font-family: ${SANS_STACK}; font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.14em; color: ${theme.primary}; line-height: 1.4;">
        ${motifSvg}<span style="vertical-align: middle;">${kickerText}</span>
      </div>
    </div>
  `;
}

function renderCtaActions(ctas, theme) {
  if (!ctas || ctas.length === 0) return '';
  const itemsHtml = ctas
    .map(
      (cta, idx) => `
      <td style="padding: 4px 10px 4px 0;">
        <a href="${cta.url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: ${
        idx === 0 ? theme.primary : '#ffffff'
      }; color: ${idx === 0 ? '#ffffff' : theme.primary}; border: 1px solid ${
        theme.primary
      }; border-radius: 4px; padding: 6px 13px; font-family: ${SANS_STACK}; font-size: 12px; font-weight: 500; letter-spacing: 0.01em; text-decoration: none; line-height: 1.3;">
          ${cta.label} &nbsp;&rarr;
        </a>
      </td>`
    )
    .join('');

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top: 12px; border-collapse: collapse;">
      <tr>
        ${itemsHtml}
      </tr>
    </table>
  `;
}

function renderCustomImages(images, imageLayout = 'banner', theme) {
  if (!images || images.length === 0) return '';
  return images
    .map((img) => {
      const maxWidth = imageLayout === 'card' ? '300px' : imageLayout === 'center' ? '440px' : '100%';
      return `
        <div style="margin: 14px 0; text-align: ${imageLayout === 'center' ? 'center' : 'left'};">
          <img src="${img.src}" alt="${img.alt || ''}" style="max-width: ${maxWidth}; width: 100%; height: auto; border-radius: 4px; display: ${
        imageLayout === 'center' ? 'inline-block' : 'block'
      }; border: 1px solid ${theme.ruleColor};" />
        </div>
      `;
    })
    .join('');
}

/**
 * 1. CALENDAR SECTION — Clean Swiss Tabular Ledger
 */
function renderCalendarSection(block, theme, kickerHtml) {
  const events = block.calendarEvents || [];
  const rowsHtml = events
    .map((ev, idx) => {
      const isLast = idx === events.length - 1;
      const borderBottom = isLast ? 'none' : `1px solid ${theme.ruleColor}`;

      const itemsList = ev.items
        .map((item, i) => {
          const isClosure = /no school|break|holiday/i.test(item);
          return `
            <div style="font-family: ${SANS_STACK}; font-size: 14px; color: ${
            isClosure ? theme.primary : theme.textMain
          }; font-weight: ${isClosure ? '500' : '400'}; margin-top: ${i === 0 ? '0' : '4px'}; line-height: 1.5;">
              ${item}
            </div>
          `;
        })
        .join('');

      return `
        <tr>
          <td style="width: 130px; padding: 9px 16px 9px 0; border-bottom: ${borderBottom}; vertical-align: baseline; font-family: ${SANS_STACK}; font-size: 13px; font-weight: 400; color: ${theme.textMuted}; font-variant-numeric: tabular-nums; white-space: nowrap;">
            ${ev.date}
          </td>
          <td style="padding: 9px 0; border-bottom: ${borderBottom}; vertical-align: baseline;">
            ${itemsList}
          </td>
        </tr>
      `;
    })
    .join('');

  return `
    <div style="margin-bottom: 36px;">
      ${kickerHtml}
      <h2 style="margin: 0 0 14px 0; font-family: ${SERIF_STACK}; font-size: 20px; font-weight: 400; color: ${theme.textMain}; letter-spacing: -0.01em;">
        ${block.title || 'Major Calendar & Events'}
      </h2>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; border-top: 1px solid ${theme.ruleColor}; border-bottom: 1px solid ${theme.ruleColor};">
        ${rowsHtml}
      </table>
    </div>
  `;
}

/**
 * 2. BIRTHDAYS SECTION — Understated 2-Column Editorial Directory
 */
function renderBirthdaysSection(block, theme, formatFirstLast, kickerHtml) {
  const rawGroups = block.birthdayGroups || [];
  const groups = rawGroups.map((g) => ({
    date: g.date,
    people: g.people.map((p) => formatPersonName(p, formatFirstLast)),
  }));

  const mid = Math.ceil(groups.length / 2);
  const leftCol = groups.slice(0, mid);
  const rightCol = groups.slice(mid);

  const renderColumnTable = (colItems) => {
    const rows = colItems
      .map((item, idx) => {
        const borderBottom = idx === colItems.length - 1 ? 'none' : `1px solid ${theme.ruleColor}`;
        return `
          <tr>
            <td style="width: 68px; padding: 6px 10px 6px 0; border-bottom: ${borderBottom}; vertical-align: baseline; font-family: ${SANS_STACK}; font-size: 12.5px; font-weight: 400; color: ${theme.textMuted}; font-variant-numeric: tabular-nums; white-space: nowrap;">
              ${item.date}
            </td>
            <td style="padding: 6px 0; border-bottom: ${borderBottom}; vertical-align: baseline; font-family: ${SANS_STACK}; font-size: 13.5px; font-weight: 400; color: ${theme.textMain}; line-height: 1.45;">
              ${item.people.join('<br/>')}
            </td>
          </tr>
        `;
      })
      .join('');

    return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
        ${rows}
      </table>
    `;
  };

  return `
    <div style="margin-bottom: 36px;">
      ${kickerHtml}
      <div style="margin-bottom: 12px;">
        <h2 style="margin: 0; font-family: ${SERIF_STACK}; font-size: 19px; font-weight: 400; color: ${theme.textMain};">
          ${block.title || 'Faculty & Staff Birthdays'}
        </h2>
        ${
          block.subtitle
            ? `<div style="font-family: ${SANS_STACK}; font-size: 12.5px; color: ${theme.textMuted}; margin-top: 3px;">${block.subtitle}</div>`
            : ''
        }
      </div>
      <div style="background-color: ${theme.primaryLight}; border-top: 1px solid ${theme.primaryBorder}; border-bottom: 1px solid ${theme.primaryBorder}; padding: 14px 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
          <tr>
            <td width="48%" style="vertical-align: top; padding-right: 16px;">
              ${renderColumnTable(leftCol)}
            </td>
            <td width="4%" style="border-left: 1px solid ${theme.ruleColor};"></td>
            <td width="48%" style="vertical-align: top; padding-left: 4px;">
              ${renderColumnTable(rightCol)}
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;
}

/**
 * 3. Q&A SECTION — Editorial Q. / A. Ledger
 */
function renderQaSection(block, theme, kickerHtml) {
  const introHtml = (block.qaIntro || [])
    .map(
      (p) =>
        `<p style="margin: 0 0 10px 0; font-family: ${SANS_STACK}; font-size: 14px; line-height: 1.65; color: ${theme.textSecondary};">${softenExcessiveBold(
          p.html,
          theme.primary
        )}</p>`
    )
    .join('');

  const qaPairsHtml = (block.qaPairs || [])
    .map(
      (qa) => `
      <div style="margin-top: 18px; padding-top: 16px; border-top: 1px solid ${theme.ruleColor};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
          <tr>
            <td style="width: 28px; vertical-align: baseline; font-family: ${SERIF_STACK}; font-size: 15px; font-style: italic; color: ${theme.textMuted}; padding-bottom: 10px;">
              Q.
            </td>
            <td style="vertical-align: baseline; font-family: ${SERIF_STACK}; font-size: 14.5px; font-style: italic; color: ${theme.textMain}; line-height: 1.6; padding-bottom: 10px;">
              “${qa.question}”
            </td>
          </tr>
          <tr>
            <td style="width: 28px; vertical-align: baseline; font-family: ${SERIF_STACK}; font-size: 15px; font-weight: 700; color: ${theme.primary}; padding-top: 4px;">
              A.
            </td>
            <td style="vertical-align: baseline; font-family: ${SANS_STACK}; font-size: 14px; color: ${theme.textSecondary}; line-height: 1.65; padding-top: 4px;">
              ${qa.response}
            </td>
          </tr>
        </table>
      </div>
    `
    )
    .join('');

  return `
    <div style="margin-bottom: 36px;">
      ${kickerHtml}
      <h2 style="margin: 0 0 10px 0; font-family: ${SERIF_STACK}; font-size: 19px; font-weight: 400; color: ${theme.textMain};">
        ${block.title || 'Questions, Comments, Concerns, and Prayer Requests'}
      </h2>
      ${introHtml}
      ${renderCtaActions(block.ctas, theme)}
      ${qaPairsHtml}
    </div>
  `;
}

/**
 * 4. ARCHIVE SECTION (PAST ISSUES) — Structured 2-Column Editorial Index (Never overflows!)
 */
function renderArchiveSection(block, theme, kickerHtml) {
  const items = block.archiveItems || [];

  // Pair items into rows of 2 columns so they wrap cleanly inside the 680px container
  const pairs = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push([items[i], items[i + 1] || null]);
  }

  const rowsHtml = pairs
    .map(([left, right], rIdx) => {
      const borderBottom = rIdx === pairs.length - 1 ? 'none' : `1px solid ${theme.ruleColor}`;
      const renderCell = (item, isRight) => {
        if (!item) {
          return `<td width="50%" style="padding: 8px 0; border-bottom: ${borderBottom};"></td>`;
        }
        const padStyle = isRight ? 'padding: 8px 0 8px 12px;' : 'padding: 8px 12px 8px 0;';
        if (item.url) {
          return `
            <td width="50%" style="${padStyle} border-bottom: ${borderBottom}; vertical-align: middle; font-family: ${SANS_STACK}; font-size: 12.5px; line-height: 1.45; word-break: break-word;">
              <a href="${item.url}" target="_blank" rel="noopener noreferrer" style="color: ${theme.textSecondary}; text-decoration: none; display: inline-block;">
                <span style="border-bottom: 1px solid ${theme.ruleColor}; padding-bottom: 1px;">${item.title}</span>
                <span style="color: ${theme.primary}; font-size: 11px; margin-left: 4px;">&#8599;</span>
              </a>
            </td>
          `;
        }
        return `
          <td width="50%" style="${padStyle} border-bottom: ${borderBottom}; vertical-align: middle; font-family: ${SANS_STACK}; font-size: 12.5px; color: ${theme.textMuted}; line-height: 1.45; word-break: break-word;">
            ${item.title}
          </td>
        `;
      };

      return `<tr>${renderCell(left, false)}${renderCell(right, true)}</tr>`;
    })
    .join('');

  return `
    <div style="margin-top: 40px; padding-top: 4px;">
      ${kickerHtml}
      <h3 style="margin: 0 0 10px 0; font-family: ${SERIF_STACK}; font-size: 16px; font-weight: 400; color: ${theme.textMain};">
        ${block.title || 'HOS Update Archive'}
      </h3>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; table-layout: fixed; width: 100%; border-top: 1px solid ${theme.ruleColor}; border-bottom: 1px solid ${theme.ruleColor};">
        ${rowsHtml}
      </table>
    </div>
  `;
}

/**
 * 5. TABLES (e.g. Regional PD Opportunities)
 */
function renderTables(tables, theme) {
  if (!tables || tables.length === 0) return '';
  return tables
    .map((tbl) => {
      const rowsHtml = tbl.rows
        .map((row, rIdx) => {
          const isHeader = rIdx === 0;
          const cellsHtml = row
            .map((cell, cIdx) => {
              const widthAttr = cIdx === 1 ? 'width="160"' : cIdx === 2 ? 'width="110"' : '';
              if (isHeader) {
                return `<th align="left" ${widthAttr} style="padding: 8px 12px 8px ${
                  cIdx === 0 ? '0' : '12px'
                }; font-family: ${SANS_STACK}; font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: ${
                  theme.textMuted
                }; border-bottom: 1.5px solid ${theme.textMain};">${cell.text}</th>`;
              }
              const cellColor = cIdx === 0 ? theme.textMain : theme.textSecondary;
              const cellSize = cIdx === 0 ? '13.5px' : '13px';
              return `<td ${widthAttr} style="padding: 10px 12px 10px ${
                cIdx === 0 ? '0' : '12px'
              }; font-family: ${SANS_STACK}; font-size: ${cellSize}; color: ${cellColor}; border-bottom: 1px solid ${
                theme.ruleColor
              }; line-height: 1.5; vertical-align: top;">${softenExcessiveBold(
                cell.html,
                theme.primary
              )}</td>`;
            })
            .join('');
          return `<tr>${cellsHtml}</tr>`;
        })
        .join('');

      return `
        <div style="margin: 16px 0 18px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
            ${rowsHtml}
          </table>
        </div>
      `;
    })
    .join('');
}

/**
 * 6. STANDARD ARTICLE BLOCK
 */
function renderStandardArticle(block, theme, kickerHtml, isSubItemInSameCategory) {
  let eventMetaHtml = '';
  if (block.eventMeta && block.eventMeta.length > 0) {
    const metaRows = block.eventMeta
      .map(
        (m) => `
        <tr>
          <td style="width: 78px; padding: 5px 12px 5px 0; font-family: ${SANS_STACK}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: ${theme.textMuted}; vertical-align: baseline; white-space: nowrap;">
            ${m.key}
          </td>
          <td style="padding: 5px 0; font-family: ${SANS_STACK}; font-size: 13.5px; color: ${theme.textMain}; vertical-align: baseline; line-height: 1.5;">
            ${m.value}
          </td>
        </tr>
      `
      )
      .join('');

    eventMetaHtml = `
      <div style="margin: 14px 0; padding: 12px 16px; background-color: ${theme.primaryLight}; border-left: 2px solid ${theme.primary};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
          ${metaRows}
        </table>
      </div>
    `;
  }

  let scheduleHtml = '';
  if (block.scheduleItems && block.scheduleItems.length > 0) {
    const schedRows = block.scheduleItems
      .map(
        (s) => `
        <tr>
          <td style="width: 72px; padding: 4px 12px 4px 0; font-family: ${SANS_STACK}; font-size: 13px; font-weight: 400; color: ${theme.textMuted}; font-variant-numeric: tabular-nums; vertical-align: baseline; white-space: nowrap;">
            ${s.time}
          </td>
          <td style="padding: 4px 0; font-family: ${SANS_STACK}; font-size: 13.5px; color: ${theme.textMain}; vertical-align: baseline; line-height: 1.5;">
            ${s.activity}
          </td>
        </tr>
      `
      )
      .join('');

    scheduleHtml = `
      <div style="margin: 14px 0; padding: 12px 16px; background-color: ${theme.accentLight}; border-top: 1px solid ${theme.accentBorder}; border-bottom: 1px solid ${theme.accentBorder};">
        <div style="font-family: ${SANS_STACK}; font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: ${theme.textMuted}; margin-bottom: 8px;">
          Evening Programme
        </div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
          ${schedRows}
        </table>
      </div>
    `;
  }

  const paragraphsToRender = block.bodyParagraphs || block.paragraphs || [];
  const bodyHtml = paragraphsToRender
    .map((p) => {
      if (p.isSubheading) {
        return `<h4 style="font-family: ${SANS_STACK}; font-size: 13.5px; font-weight: 600; color: ${theme.textMain}; margin: 16px 0 6px 0; letter-spacing: 0.01em;">${p.text}</h4>`;
      }
      const dateColonMatch = p.text.match(
        /^((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2})\s*:\s*(.+)$/i
      );
      if (dateColonMatch && (!p.links || p.links.length === 0)) {
        return `
          <div style="margin: 0 0 6px 0; font-family: ${SANS_STACK}; font-size: 14px; line-height: 1.55;">
            <span style="display: inline-block; min-width: 115px; color: ${theme.textMuted}; font-variant-numeric: tabular-nums;">${dateColonMatch[1]}</span>
            <span style="color: ${theme.textMain};">${dateColonMatch[2]}</span>
          </div>
        `;
      }

      return `<p style="margin: 0 0 10px 0; font-family: ${SANS_STACK}; font-size: 14px; line-height: 1.65; color: ${theme.textSecondary};">${softenExcessiveBold(
        p.html,
        theme.primary
      )}</p>`;
    })
    .join('');

  const topDivider = isSubItemInSameCategory
    ? `<div style="border-top: 1px solid ${theme.ruleColor}; margin: 24px 0 20px 0;"></div>`
    : kickerHtml;

  return `
    <div style="margin-bottom: 28px;">
      ${topDivider}
      <h3 style="margin: 0 0 10px 0; font-family: ${SERIF_STACK}; font-size: 18.5px; font-weight: 400; color: ${theme.textMain}; line-height: 1.35; letter-spacing: -0.01em;">
        ${block.title}
      </h3>
      ${renderCustomImages(block.images, block.imageLayout, theme)}
      ${bodyHtml}
      ${eventMetaHtml}
      ${scheduleHtml}
      ${renderTables(block.tables, theme)}
      ${renderCtaActions(block.ctas, theme)}
    </div>
  `;
}

/**
 * Render complete publication-grade email HTML string
 */
export function renderNewsletterEmailHtml({
  newsletterTitle,
  subtitle = 'Office of the Head of School',
  introNote = '',
  blocks = [],
  theme,
  showBanner = true,
  formatBirthdayFirstLast = false,
}) {
  const bannerHtml = showBanner
    ? `
      <div style="background-color: #005a34; text-align: center;">
        <img src="${CONCORDIA_BANNER_B64}" alt="Concordia International School Hanoi" style="width: 100%; max-width: 680px; height: auto; display: block; margin: 0 auto;" />
      </div>
    `
    : '';

  const seasonalArtworkSvg = getSeasonalHeaderSvg(theme.id);
  const seasonalHeroHtml = seasonalArtworkSvg
    ? `<div style="width: 100%; overflow: hidden; border-bottom: 2px solid ${theme.accent};">${seasonalArtworkSvg}</div>`
    : '';

  const introNoteHtml = introNote.trim()
    ? `
      <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid ${theme.ruleColor};">
        <div style="font-family: ${SERIF_STACK}; font-size: 15px; line-height: 1.75; color: ${theme.textMain}; white-space: pre-line;">${introNote.trim()}</div>
      </div>
    `
    : '';

  let lastCategory = null;
  let sectionCounter = 0;

  const sectionsHtml = blocks
    .filter((b) => !b.hidden)
    .map((block) => {
      const isSameCategory = block.category === lastCategory;
      let kickerHtml = '';
      if (!isSameCategory) {
        sectionCounter += 1;
        const catMeta = getCategoryMeta(block.category);
        kickerHtml = renderSectionKicker(
          catMeta.kicker || catMeta.label,
          sectionCounter,
          theme,
          sectionCounter === 1
        );
        lastCategory = block.category;
      }

      if (block.category === 'calendar') {
        return renderCalendarSection(block, theme, kickerHtml);
      }
      if (block.category === 'birthdays') {
        return renderBirthdaysSection(block, theme, formatBirthdayFirstLast, kickerHtml);
      }
      if (block.category === 'qa_concerns') {
        return renderQaSection(block, theme, kickerHtml);
      }
      if (block.category === 'archive') {
        return renderArchiveSection(block, theme, kickerHtml);
      }
      return renderStandardArticle(block, theme, kickerHtml, isSameCategory);
    })
    .join('');

  return `
<div style="background-color: ${theme.pageBg}; padding: 28px 12px; font-family: ${SANS_STACK}; color: ${theme.textMain}; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 680px; margin: 0 auto; background-color: #ffffff; border: 1px solid ${theme.ruleColor};">
    ${bannerHtml}
    ${seasonalHeroHtml}

    <!-- Editorial Masthead -->
    <div style="padding: 30px 40px 22px 40px; border-bottom: 1px solid ${theme.ruleColor}; background-color: ${
    seasonalArtworkSvg ? theme.primaryLight : '#ffffff'
  };">
      <div style="font-family: ${SANS_STACK}; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.16em; color: ${theme.primary}; margin-bottom: 8px;">
        ${subtitle}
      </div>
      <h1 style="margin: 0; font-family: ${SERIF_STACK}; font-size: 26px; font-weight: 400; color: ${theme.textMain}; letter-spacing: -0.02em; line-height: 1.25;">
        ${newsletterTitle || 'HOS Monthly Update'}
      </h1>
    </div>

    <!-- Main Editorial Body -->
    <div style="padding: 28px 40px 36px 40px;">
      ${introNoteHtml}
      ${sectionsHtml}
    </div>

    <!-- Minimalist Colophon Footer -->
    <div style="background-color: ${theme.primaryLight}; border-top: 1px solid ${theme.ruleColor}; padding: 20px 40px; font-family: ${SANS_STACK}; font-size: 11.5px; color: ${theme.textMuted}; line-height: 1.6;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <strong style="color: ${theme.textMain}; font-weight: 600;">Concordia International School Hanoi</strong><br/>
            Van Tri Golf Estate, Kim No, Dong Anh, Hanoi, Vietnam
          </td>
          <td align="right" style="vertical-align: bottom; color: ${theme.textMuted};">
            Faculty &amp; Staff Bulletin
          </td>
        </tr>
      </table>
    </div>
  </div>
</div>
  `.trim();
}
