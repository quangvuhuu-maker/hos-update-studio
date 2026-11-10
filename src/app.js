// Main Application Controller for HOS Monthly Update Studio — Editorial & Full-View Edition
import { SAMPLE_UPDATES } from './sampleData.js';
import { DEFAULT_CATEGORIES, THEMES } from './themes.js';
import {
  parseNewsletterHtml,
  sortBlocksByPriority,
  parseCalendarItems,
  parseBirthdayItems,
} from './parser.js';
import { renderNewsletterEmailHtml } from './emailRenderer.js';
import { convertSvgElementsToPngInContainer } from './seasonalArtwork.js';
import { generateHosIntroWithGemini, refineBlocksWithGemini } from './aiHelper.js';
import { convertDocxFileToHtml } from './docxImporter.js';

const STORAGE_KEYS = {
  CATEGORY_ORDER: 'hos_studio_category_order_v1',
  PIN_ARCHIVE: 'hos_studio_pin_archive_v1',
  THEME_ID: 'hos_studio_theme_id_v1',
  BDAY_FIRST_LAST: 'hos_studio_bday_format_v1',
  GEMINI_KEY: 'hos_studio_gemini_key_v1',
};

const state = {
  newsletterTitle: '',
  subtitle: 'Office of the Head of School',
  introNote: '',
  blocks: [],
  categoryOrder: loadSavedCategoryOrder(),
  pinArchiveBottom: localStorage.getItem(STORAGE_KEYS.PIN_ARCHIVE) !== 'false',
  activeThemeId: localStorage.getItem(STORAGE_KEYS.THEME_ID) || 'concordia_classic',
  showBanner: true,
  formatBirthdayFirstLast: localStorage.getItem(STORAGE_KEYS.BDAY_FIRST_LAST) === 'true',
  previewMode: 'desktop', // 'desktop' | 'mobile' | 'full' | 'html'
  isFullView: false,
  expandedBlockId: null,
  activeSampleId: 'november_2026',
  geminiApiKey: localStorage.getItem(STORAGE_KEYS.GEMINI_KEY) || '',
  draggedBlockIndex: null,
  draggedCategoryIndex: null,
};

function loadSavedCategoryOrder() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORY_ORDER);
    if (raw) {
      const savedIds = JSON.parse(raw);
      if (Array.isArray(savedIds) && savedIds.length > 0) {
        const ordered = [];
        for (const id of savedIds) {
          const found = DEFAULT_CATEGORIES.find((c) => c.id === id);
          if (found) ordered.push({ ...found });
        }
        for (const def of DEFAULT_CATEGORIES) {
          if (!ordered.some((c) => c.id === def.id)) {
            ordered.push({ ...def });
          }
        }
        return ordered;
      }
    }
  } catch (e) {
    console.warn('Could not read saved category order:', e);
  }
  return DEFAULT_CATEGORIES.map((c) => ({ ...c }));
}

function savePrioritySettings() {
  localStorage.setItem(
    STORAGE_KEYS.CATEGORY_ORDER,
    JSON.stringify(state.categoryOrder.map((c) => c.id))
  );
  localStorage.setItem(STORAGE_KEYS.PIN_ARCHIVE, String(state.pinArchiveBottom));
}

export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  const bgClass =
    type === 'error'
      ? 'bg-red-800 text-white border-red-900'
      : 'bg-slate-900 text-white border-slate-800';
  toast.className = `flex items-center gap-2.5 px-4 py-2.5 rounded-md shadow-lg border text-xs font-medium tracking-wide transition-all duration-200 ${bgClass}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    setTimeout(() => toast.remove(), 220);
  }, 3000);
}

function loadRawHtmlIntoStudio(rawHtml, defaultTitle = '') {
  const parsed = parseNewsletterHtml(rawHtml);
  state.newsletterTitle = parsed.newsletterTitle || defaultTitle || 'HOS Monthly Update';
  state.blocks = sortBlocksByPriority(
    parsed.blocks,
    state.categoryOrder,
    state.pinArchiveBottom
  );
  state.expandedBlockId = null;
  renderAll();
}

export function loadSample(sampleKey) {
  const sample = SAMPLE_UPDATES[sampleKey];
  if (!sample) return;
  state.activeSampleId = sampleKey;
  state.introNote = '';
  loadRawHtmlIntoStudio(sample.rawHtml, sample.title);
  showToast(`Loaded "${sample.label}"`);
}

function getActiveTheme() {
  return THEMES[state.activeThemeId] || THEMES.concordia_classic;
}

export function setFullView(enabled) {
  state.isFullView = Boolean(enabled);
  const editorSidebar = document.getElementById('editor-sidebar-col');
  const previewCol = document.getElementById('preview-main-col');
  const headerBtn = document.getElementById('btn-header-fullview');
  const exitBanner = document.getElementById('fullview-exit-bar');

  if (state.isFullView) {
    editorSidebar?.classList.add('hidden');
    previewCol?.classList.remove('lg:col-span-7');
    previewCol?.classList.add('lg:col-span-12');
    exitBanner?.classList.remove('hidden');
    if (headerBtn) {
      headerBtn.textContent = 'Exit Full View';
      headerBtn.className =
        'px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs transition cursor-pointer';
    }
  } else {
    editorSidebar?.classList.remove('hidden');
    previewCol?.classList.remove('lg:col-span-12');
    previewCol?.classList.add('lg:col-span-7');
    exitBanner?.classList.add('hidden');
    if (headerBtn) {
      headerBtn.textContent = 'View Full';
      headerBtn.className =
        'px-3.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-medium text-xs transition cursor-pointer';
    }
  }
  renderPreview();
}

function renderThemeBar() {
  const container = document.getElementById('theme-selector-bar');
  if (!container) return;

  container.innerHTML = Object.values(THEMES)
    .map((t) => {
      const active = t.id === state.activeThemeId;
      return `
        <button
          type="button"
          data-theme-id="${t.id}"
          class="theme-pill flex items-center gap-2 px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer border ${
            active
              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
          }"
          title="${t.subtitle}"
        >
          <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${t.swatch || t.primary};"></span>
          <span>${t.name}</span>
        </button>
      `;
    })
    .join('');

  container.querySelectorAll('.theme-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-theme-id');
      if (id && THEMES[id]) {
        state.activeThemeId = id;
        localStorage.setItem(STORAGE_KEYS.THEME_ID, id);
        renderThemeBar();
        renderPreview();
      }
    });
  });
}

function formatParagraphsToMarkdown(paragraphs) {
  return (paragraphs || [])
    .map((p) => {
      let t = p.text || '';
      if (p.links && p.links.length > 0) {
        for (const l of p.links) {
          if (!l.text || !l.url) continue;
          const mdForm = `[${l.text}](${l.url})`;
          if (t.includes(mdForm)) continue;
          if (t.includes(l.text)) {
            t = t.replace(l.text, mdForm);
          }
        }
      }
      return t;
    })
    .join('\n');
}

function renderBlocksList() {
  const listEl = document.getElementById('blocks-list');
  const countEl = document.getElementById('blocks-count-badge');
  if (!listEl) return;

  if (countEl) {
    countEl.textContent = `${state.blocks.length} sections`;
  }

  const rankLookup = {};
  state.categoryOrder.forEach((cat, idx) => {
    rankLookup[cat.id] = idx + 1;
  });

  listEl.innerHTML = state.blocks
    .map((block, index) => {
      const catMeta =
        state.categoryOrder.find((c) => c.id === block.category) || DEFAULT_CATEGORIES[1];
      const priorityRank = rankLookup[block.category] || 9;
      const isExpanded = state.expandedBlockId === block.id;
      const isArchive = block.category === 'archive';

      if (isArchive && (!block.archiveItems || block.archiveItems.length === 0)) {
        block.archiveItems = (block.paragraphs || []).map((p) => ({
          title: p.text,
          url: p.links?.[0]?.url || '',
        }));
      }

      const bodyLinesText = formatParagraphsToMarkdown(block.paragraphs);
      const allExtractedLinks = (block.paragraphs || []).flatMap((p) => p.links || []);

      const categoryOptions = state.categoryOrder
        .map(
          (c, i) =>
            `<option value="${c.id}" ${c.id === block.category ? 'selected' : ''}>0${
              i + 1
            } — ${c.label}</option>`
        )
        .join('');

      const ctasEditorHtml = (block.ctas || [])
        .map(
          (cta, cIdx) => `
          <div class="flex items-center gap-2 mb-1.5">
            <input
              type="text"
              data-cta-label="${cIdx}"
              value="${(cta.label || '').replace(/"/g, '&quot;')}"
              placeholder="Button Label"
              class="w-1/2 px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#005a34]"
            />
            <input
              type="url"
              data-cta-url="${cIdx}"
              value="${(cta.url || '').replace(/"/g, '&quot;')}"
              placeholder="https://..."
              class="w-1/2 px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#005a34]"
            />
            <button
              type="button"
              data-remove-cta="${cIdx}"
              class="px-2 py-1 text-xs text-slate-400 hover:text-red-600 rounded cursor-pointer"
              title="Remove Link"
              aria-label="Remove CTA button"
            >&times;</button>
          </div>
        `
        )
        .join('');

      const archiveEditorHtml = `
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-[11px] font-semibold text-slate-700">Past Issue Links (HOS Updates Archive)</label>
            <button
              type="button"
              data-add-archive-item="${block.id}"
              class="text-[11px] font-semibold text-[#005a34] hover:underline cursor-pointer"
            >
              + Add Past Issue Link
            </button>
          </div>
          <div class="space-y-1.5 max-h-60 overflow-y-auto pr-1" data-archive-container="${block.id}">
            ${(block.archiveItems || [])
              .map(
                (item, aIdx) => `
              <div class="flex items-center gap-2 bg-white p-2 rounded border border-slate-200">
                <input
                  type="text"
                  data-archive-title="${aIdx}"
                  value="${(item.title || '').replace(/"/g, '&quot;')}"
                  placeholder="Issue Name (e.g. HOS Update–August 7, 2026)"
                  class="w-1/2 px-2.5 py-1 text-xs border border-slate-300 rounded font-medium text-slate-800 focus:outline-none focus:border-[#005a34]"
                />
                <input
                  type="url"
                  data-archive-url="${aIdx}"
                  value="${(item.url || '').replace(/"/g, '&quot;')}"
                  placeholder="https://docs.google.com/..."
                  class="w-1/2 px-2.5 py-1 text-xs border border-slate-300 rounded font-mono text-xs text-slate-700 focus:outline-none focus:border-[#005a34]"
                />
                ${
                  item.url
                    ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="px-1 text-slate-400 hover:text-slate-800 text-xs" title="Open Link">↗</a>`
                    : ''
                }
                <button
                  type="button"
                  data-remove-archive="${aIdx}"
                  class="px-1.5 py-0.5 text-xs text-slate-400 hover:text-red-600 rounded cursor-pointer"
                  title="Remove"
                >&times;</button>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;

      return `
        <div
          class="block-card group bg-white border ${
            isExpanded ? 'border-slate-900' : 'border-slate-200 hover:border-slate-300'
          } rounded-lg transition-all ${block.hidden ? 'opacity-45' : ''}"
          draggable="true"
          data-block-index="${index}"
          data-block-id="${block.id}"
        >
          <div class="flex items-center justify-between gap-2 px-3 py-2.5">
            <div class="flex items-center gap-2.5 min-w-0 flex-1">
              <span
                class="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 select-none text-xs font-mono"
                title="Drag to reorder"
              >::</span>
              <span class="shrink-0 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                0${priorityRank} · ${catMeta.badgeText}
              </span>
              <button
                type="button"
                data-toggle-expand="${block.id}"
                class="text-left font-medium text-xs text-slate-800 hover:text-[#005a34] truncate cursor-pointer flex-1"
              >
                ${block.title}
              </button>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button
                type="button"
                data-move-up="${index}"
                ${index === 0 ? 'disabled' : ''}
                class="px-1.5 py-0.5 text-xs text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded disabled:opacity-20 cursor-pointer"
                title="Move Up"
                aria-label="Move section up"
              >&uarr;</button>
              <button
                type="button"
                data-move-down="${index}"
                ${index === state.blocks.length - 1 ? 'disabled' : ''}
                class="px-1.5 py-0.5 text-xs text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded disabled:opacity-20 cursor-pointer"
                title="Move Down"
                aria-label="Move section down"
              >&darr;</button>
              <button
                type="button"
                data-toggle-hide="${block.id}"
                class="px-1.5 py-0.5 text-[11px] text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                title="${block.hidden ? 'Show Section' : 'Hide Section'}"
              >${block.hidden ? 'Hidden' : 'Hide'}</button>
              <button
                type="button"
                data-toggle-expand="${block.id}"
                class="px-2 py-0.5 text-[11px] font-medium rounded ${
                  isExpanded
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                } cursor-pointer"
              >${isExpanded ? 'Close' : 'Edit'}</button>
            </div>
          </div>

          ${
            isExpanded
              ? `
            <div class="px-3.5 pb-3.5 pt-2.5 border-t border-slate-100 bg-slate-50/70 space-y-3 text-xs">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-[11px] font-medium text-slate-600 mb-1">Heading</label>
                  <input
                    type="text"
                    data-edit-title="${block.id}"
                    value="${(block.title || '').replace(/"/g, '&quot;')}"
                    class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-medium text-slate-800 focus:outline-none focus:border-[#005a34]"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-slate-600 mb-1">Priority Group</label>
                  <select
                    data-edit-category="${block.id}"
                    class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-medium text-slate-800 focus:outline-none focus:border-[#005a34]"
                  >
                    ${categoryOptions}
                  </select>
                </div>
              </div>

              ${
                isArchive
                  ? archiveEditorHtml
                  : `
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-[11px] font-medium text-slate-600">
                    Content (Supports Markdown links: <code class="text-emerald-700 font-mono">[Text](URL)</code>)
                  </label>
                  <button
                    type="button"
                    data-insert-link="${block.id}"
                    class="px-2 py-0.5 text-[11px] font-medium bg-emerald-50 hover:bg-emerald-100 text-[#005a34] border border-emerald-200 rounded cursor-pointer"
                    title="Highlight text in the box and click here to attach a link"
                  >
                    🔗 Attach Link to Text
                  </button>
                </div>
                <textarea
                  rows="5"
                  data-edit-body="${block.id}"
                  class="w-full px-2.5 py-2 bg-white border border-slate-300 rounded font-mono text-xs text-slate-800 focus:outline-none focus:border-[#005a34]"
                >${bodyLinesText}</textarea>
              </div>

              ${
                allExtractedLinks.length > 0
                  ? `
                <div class="bg-white border border-slate-200 rounded p-2.5 space-y-1.5">
                  <div class="text-[11px] font-semibold text-slate-700">Hyperlinks in this section (edit URLs below):</div>
                  ${allExtractedLinks
                    .map(
                      (l, lIdx) => `
                    <div class="flex items-center gap-2">
                      <span class="text-[11px] font-medium text-slate-700 w-1/3 truncate" title="${l.text}">“${l.text}”</span>
                      <input
                        type="url"
                        data-inline-link-url="${lIdx}"
                        value="${(l.url || '').replace(/"/g, '&quot;')}"
                        class="flex-1 px-2 py-0.5 text-xs border border-slate-300 rounded font-mono text-slate-700 bg-slate-50 focus:bg-white"
                      />
                      <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="text-xs text-slate-400 hover:text-slate-800" title="Test link">↗</a>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              `
                  : ''
              }
              `
              }

              ${
                !isArchive
                  ? `
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="text-[11px] font-medium text-slate-600">Action Buttons (CTAs)</label>
                  <button
                    type="button"
                    data-add-cta="${block.id}"
                    class="text-[11px] font-medium text-[#005a34] hover:underline cursor-pointer"
                  >+ Add Action Button</button>
                </div>
                <div data-cta-container="${block.id}">
                  ${
                    ctasEditorHtml ||
                    '<p class="text-[11px] text-slate-400 italic">No standalone action buttons.</p>'
                  }
                </div>
              </div>

              <div class="pt-2 border-t border-slate-200/80">
                <div class="flex items-center justify-between mb-1.5">
                  <label class="text-[11px] font-medium text-slate-600">Image Attachment</label>
                  <select
                    data-image-layout="${block.id}"
                    class="px-2 py-1 text-[11px] bg-white border border-slate-300 rounded"
                  >
                    <option value="banner" ${block.imageLayout === 'banner' ? 'selected' : ''}>Full Width</option>
                    <option value="center" ${block.imageLayout === 'center' ? 'selected' : ''}>Centered (440px)</option>
                    <option value="card" ${block.imageLayout === 'card' ? 'selected' : ''}>Inline (300px)</option>
                  </select>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    type="url"
                    data-image-url="${block.id}"
                    placeholder="Paste image URL (https://...)"
                    class="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                  />
                  <label class="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-medium text-slate-700 cursor-pointer shrink-0">
                    Upload Image
                    <input type="file" accept="image/*" data-image-upload="${block.id}" class="hidden" />
                  </label>
                  ${
                    block.images && block.images.length > 0
                      ? `<button type="button" data-clear-images="${block.id}" class="px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded cursor-pointer">Clear (${block.images.length})</button>`
                      : ''
                  }
                </div>
              </div>
              `
                  : ''
              }

              <div class="flex justify-between items-center pt-2 border-t border-slate-200">
                <button
                  type="button"
                  data-delete-block="${block.id}"
                  class="text-xs font-medium text-red-600 hover:text-red-800 cursor-pointer"
                >Remove Section</button>
                <span class="text-[11px] text-slate-400">Live preview updated</span>
              </div>
            </div>
          `
              : ''
          }
        </div>
      `;
    })
    .join('');

  bindBlockListEvents(listEl);
}

function reprocessBlockParagraphs(block, rawLinesText) {
  const lines = rawLinesText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+|mailto:[^\s\)]+)\)/g;

  block.paragraphs = lines.map((line) => {
    const links = [];
    let match;
    const r = new RegExp(mdLinkRegex);
    while ((match = r.exec(line)) !== null) {
      links.push({ text: match[1], url: match[2] });
    }

    let html = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s\)]+|mailto:[^\s\)]+)\)/g,
        '<strong><a href="$2" target="_blank" rel="noopener noreferrer">$1</a></strong>'
      );

    const cleanText = line.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+|mailto:[^\s\)]+)\)/g, '$1');

    return {
      text: cleanText,
      html,
      links,
      isSubheading: cleanText.endsWith(':'),
    };
  });

  if (block.category === 'calendar') {
    block.calendarEvents = parseCalendarItems(block.paragraphs);
  } else if (block.category === 'birthdays') {
    block.birthdayGroups = parseBirthdayItems(block.paragraphs, false);
  } else if (block.category === 'archive') {
    block.archiveItems = block.paragraphs.map((p) => ({
      title: p.text,
      url: p.links?.[0]?.url || '',
    }));
  } else if (block.category === 'featured_events' || block.category === 'personnel') {
    block.bodyParagraphs = block.paragraphs;
  }
}

function bindBlockListEvents(listEl) {
  listEl.querySelectorAll('[data-toggle-expand]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-toggle-expand');
      state.expandedBlockId = state.expandedBlockId === id ? null : id;
      renderBlocksList();
    });
  });

  listEl.querySelectorAll('[data-move-up]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-move-up'));
      if (idx > 0) {
        const temp = state.blocks[idx - 1];
        state.blocks[idx - 1] = state.blocks[idx];
        state.blocks[idx] = temp;
        renderAll();
      }
    });
  });

  listEl.querySelectorAll('[data-move-down]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-move-down'));
      if (idx < state.blocks.length - 1) {
        const temp = state.blocks[idx + 1];
        state.blocks[idx + 1] = state.blocks[idx];
        state.blocks[idx] = temp;
        renderAll();
      }
    });
  });

  listEl.querySelectorAll('[data-toggle-hide]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-toggle-hide');
      const block = state.blocks.find((b) => b.id === id);
      if (block) {
        block.hidden = !block.hidden;
        renderAll();
      }
    });
  });

  listEl.querySelectorAll('.block-card').forEach((card) => {
    card.addEventListener('dragstart', (e) => {
      state.draggedBlockIndex = Number(card.getAttribute('data-block-index'));
      card.classList.add('opacity-40');
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('opacity-40');
      state.draggedBlockIndex = null;
    });

    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    card.addEventListener('drop', (e) => {
      e.preventDefault();
      const targetIndex = Number(card.getAttribute('data-block-index'));
      if (
        state.draggedBlockIndex !== null &&
        state.draggedBlockIndex !== targetIndex
      ) {
        const [moved] = state.blocks.splice(state.draggedBlockIndex, 1);
        state.blocks.splice(targetIndex, 0, moved);
        state.draggedBlockIndex = null;
        renderAll();
      }
    });
  });

  listEl.querySelectorAll('[data-edit-title]').forEach((input) => {
    input.addEventListener('input', () => {
      const id = input.getAttribute('data-edit-title');
      const block = state.blocks.find((b) => b.id === id);
      if (block) {
        block.title = input.value;
        renderPreview();
      }
    });
  });

  listEl.querySelectorAll('[data-edit-category]').forEach((select) => {
    select.addEventListener('change', () => {
      const id = select.getAttribute('data-edit-category');
      const block = state.blocks.find((b) => b.id === id);
      if (block) {
        block.category = select.value;
        reprocessBlockParagraphs(
          block,
          (block.paragraphs || []).map((p) => p.text).join('\n')
        );
        renderAll();
      }
    });
  });

  listEl.querySelectorAll('[data-edit-body]').forEach((textarea) => {
    textarea.addEventListener('input', () => {
      const id = textarea.getAttribute('data-edit-body');
      const block = state.blocks.find((b) => b.id === id);
      if (block) {
        reprocessBlockParagraphs(block, textarea.value);
        renderPreview();
      }
    });
  });

  listEl.querySelectorAll('[data-add-cta]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-add-cta');
      const block = state.blocks.find((b) => b.id === id);
      if (block) {
        block.ctas = block.ctas || [];
        block.ctas.push({ label: 'View Details', url: 'https://concordiahanoi.org' });
        renderAll();
      }
    });
  });

  listEl.querySelectorAll('[data-cta-label]').forEach((input) => {
    input.addEventListener('input', () => {
      const idx = Number(input.getAttribute('data-cta-label'));
      const block = state.blocks.find((b) => b.id === state.expandedBlockId);
      if (block && block.ctas && block.ctas[idx]) {
        block.ctas[idx].label = input.value;
        renderPreview();
      }
    });
  });

  listEl.querySelectorAll('[data-cta-url]').forEach((input) => {
    input.addEventListener('input', () => {
      const idx = Number(input.getAttribute('data-cta-url'));
      const block = state.blocks.find((b) => b.id === state.expandedBlockId);
      if (block && block.ctas && block.ctas[idx]) {
        block.ctas[idx].url = input.value;
        renderPreview();
      }
    });
  });

  listEl.querySelectorAll('[data-remove-cta]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-remove-cta'));
      const block = state.blocks.find((b) => b.id === state.expandedBlockId);
      if (block && block.ctas) {
        block.ctas.splice(idx, 1);
        renderAll();
      }
    });
  });

  listEl.querySelectorAll('[data-insert-link]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-insert-link');
      const textarea = listEl.querySelector(`[data-edit-body="${id}"]`);
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end).trim() || 'Link Text';
      const enteredUrl = prompt(`Enter URL to attach to "${selectedText}":`, 'https://');
      if (!enteredUrl || !enteredUrl.trim()) return;

      const before = textarea.value.substring(0, start);
      const after = textarea.value.substring(end);
      const replacement = `[${selectedText}](${enteredUrl.trim()})`;

      textarea.value = before + replacement + after;
      textarea.focus();
      textarea.setSelectionRange(start, start + replacement.length);

      const block = state.blocks.find((b) => b.id === id);
      if (block) {
        reprocessBlockParagraphs(block, textarea.value);
        renderAll();
        showToast(`Attached link to "${selectedText}"`);
      }
    });
  });

  listEl.querySelectorAll('[data-add-archive-item]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-add-archive-item');
      const block = state.blocks.find((b) => b.id === id);
      if (block) {
        block.archiveItems = block.archiveItems || [];
        block.archiveItems.push({
          title: 'HOS Update - New Issue, 2026',
          url: 'https://docs.google.com/document/d/...',
        });
        block.paragraphs = block.archiveItems.map((it) => ({
          text: it.title,
          html: it.url ? `<strong><a href="${it.url}">${it.title}</a></strong>` : it.title,
          links: it.url ? [{ text: it.title, url: it.url }] : [],
        }));
        renderAll();
        showToast('Added new archive issue link');
      }
    });
  });

  listEl.querySelectorAll('[data-archive-title]').forEach((input) => {
    input.addEventListener('input', () => {
      const aIdx = Number(input.getAttribute('data-archive-title'));
      const block = state.blocks.find((b) => b.id === state.expandedBlockId);
      if (block && block.archiveItems && block.archiveItems[aIdx]) {
        block.archiveItems[aIdx].title = input.value;
        block.paragraphs = block.archiveItems.map((it) => ({
          text: it.title,
          html: it.url ? `<strong><a href="${it.url}">${it.title}</a></strong>` : it.title,
          links: it.url ? [{ text: it.title, url: it.url }] : [],
        }));
        renderPreview();
      }
    });
  });

  listEl.querySelectorAll('[data-archive-url]').forEach((input) => {
    input.addEventListener('input', () => {
      const aIdx = Number(input.getAttribute('data-archive-url'));
      const block = state.blocks.find((b) => b.id === state.expandedBlockId);
      if (block && block.archiveItems && block.archiveItems[aIdx]) {
        block.archiveItems[aIdx].url = input.value.trim();
        block.paragraphs = block.archiveItems.map((it) => ({
          text: it.title,
          html: it.url ? `<strong><a href="${it.url}">${it.title}</a></strong>` : it.title,
          links: it.url ? [{ text: it.title, url: it.url }] : [],
        }));
        renderPreview();
      }
    });
  });

  listEl.querySelectorAll('[data-remove-archive]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const aIdx = Number(btn.getAttribute('data-remove-archive'));
      const block = state.blocks.find((b) => b.id === state.expandedBlockId);
      if (block && block.archiveItems) {
        block.archiveItems.splice(aIdx, 1);
        block.paragraphs = block.archiveItems.map((it) => ({
          text: it.title,
          html: it.url ? `<strong><a href="${it.url}">${it.title}</a></strong>` : it.title,
          links: it.url ? [{ text: it.title, url: it.url }] : [],
        }));
        renderAll();
      }
    });
  });

  listEl.querySelectorAll('[data-inline-link-url]').forEach((input) => {
    input.addEventListener('input', () => {
      const lIdx = Number(input.getAttribute('data-inline-link-url'));
      const block = state.blocks.find((b) => b.id === state.expandedBlockId);
      if (!block) return;
      const allLinks = (block.paragraphs || []).flatMap((p) => p.links || []);
      if (allLinks[lIdx]) {
        const oldUrl = allLinks[lIdx].url;
        const newUrl = input.value.trim();
        allLinks[lIdx].url = newUrl;

        for (const p of block.paragraphs) {
          if (p.links) {
            for (const l of p.links) {
              if (l.url === oldUrl) l.url = newUrl;
            }
          }
          if (p.html && p.html.includes(oldUrl)) {
            p.html = p.html.split(oldUrl).join(newUrl);
          }
        }
        renderPreview();
      }
    });
  });

  listEl.querySelectorAll('[data-image-layout]').forEach((select) => {
    select.addEventListener('change', () => {
      const id = select.getAttribute('data-image-layout');
      const block = state.blocks.find((b) => b.id === id);
      if (block) {
        block.imageLayout = select.value;
        renderPreview();
      }
    });
  });

  listEl.querySelectorAll('[data-image-url]').forEach((input) => {
    input.addEventListener('change', () => {
      const id = input.getAttribute('data-image-url');
      const block = state.blocks.find((b) => b.id === id);
      if (block && input.value.trim()) {
        block.images = block.images || [];
        block.images.push({ src: input.value.trim(), alt: block.title });
        input.value = '';
        renderAll();
      }
    });
  });

  listEl.querySelectorAll('[data-image-upload]').forEach((fileInput) => {
    fileInput.addEventListener('change', () => {
      const id = fileInput.getAttribute('data-image-upload');
      const block = state.blocks.find((b) => b.id === id);
      const file = fileInput.files && fileInput.files[0];
      if (block && file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          block.images = block.images || [];
          block.images.push({ src: ev.target.result, alt: file.name });
          renderAll();
        };
        reader.readAsDataURL(file);
      }
    });
  });

  listEl.querySelectorAll('[data-clear-images]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-clear-images');
      const block = state.blocks.find((b) => b.id === id);
      if (block) {
        block.images = [];
        renderAll();
      }
    });
  });

  listEl.querySelectorAll('[data-delete-block]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-delete-block');
      state.blocks = state.blocks.filter((b) => b.id !== id);
      state.expandedBlockId = null;
      renderAll();
      showToast('Section removed');
    });
  });
}

function renderPreview() {
  const previewContainer = document.getElementById('newsletter-preview-mount');
  const codeContainer = document.getElementById('newsletter-html-code');
  const printMount = document.getElementById('print-only-mount');
  if (!previewContainer) return;

  const emailHtml = renderNewsletterEmailHtml({
    newsletterTitle: state.newsletterTitle,
    subtitle: state.subtitle,
    introNote: state.introNote,
    blocks: state.blocks,
    theme: getActiveTheme(),
    showBanner: state.showBanner,
    formatBirthdayFirstLast: state.formatBirthdayFirstLast,
  });

  previewContainer.innerHTML = emailHtml;
  if (printMount) {
    printMount.innerHTML = emailHtml;
  }
  if (codeContainer) {
    codeContainer.value = emailHtml;
  }

  const wrapper = document.getElementById('preview-viewport-wrapper');
  const codeWrap = document.getElementById('preview-code-wrapper');
  if (wrapper && codeWrap) {
    if (state.previewMode === 'html') {
      wrapper.classList.add('hidden');
      codeWrap.classList.remove('hidden');
    } else {
      wrapper.classList.remove('hidden');
      codeWrap.classList.add('hidden');
      if (state.previewMode === 'mobile') {
        wrapper.style.maxWidth = '420px';
      } else if (state.isFullView) {
        wrapper.style.maxWidth = '860px';
      } else {
        wrapper.style.maxWidth = '720px';
      }
    }
  }
}

function renderPriorityModalList() {
  const listEl = document.getElementById('priority-rules-list');
  if (!listEl) return;

  listEl.innerHTML = state.categoryOrder
    .map(
      (cat, idx) => `
      <div
        class="priority-rule-item flex items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-md"
        draggable="true"
        data-cat-index="${idx}"
      >
        <div class="flex items-center gap-3 min-w-0">
          <span class="cursor-grab text-slate-400 select-none font-mono text-xs">::</span>
          <span class="w-6 h-6 rounded bg-slate-900 text-white text-xs font-mono flex items-center justify-center shrink-0">
            0${idx + 1}
          </span>
          <div class="min-w-0">
            <div class="text-xs font-semibold text-slate-800">${cat.viLabel || cat.label}</div>
            <div class="text-[11px] text-slate-500 truncate">${cat.description}</div>
          </div>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <button
            type="button"
            data-cat-up="${idx}"
            ${idx === 0 ? 'disabled' : ''}
            class="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-30 cursor-pointer"
          >&uarr;</button>
          <button
            type="button"
            data-cat-down="${idx}"
            ${idx === state.categoryOrder.length - 1 ? 'disabled' : ''}
            class="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-30 cursor-pointer"
          >&darr;</button>
        </div>
      </div>
    `
    )
    .join('');

  listEl.querySelectorAll('[data-cat-up]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const i = Number(btn.getAttribute('data-cat-up'));
      if (i > 0) {
        const tmp = state.categoryOrder[i - 1];
        state.categoryOrder[i - 1] = state.categoryOrder[i];
        state.categoryOrder[i] = tmp;
        renderPriorityModalList();
      }
    });
  });

  listEl.querySelectorAll('[data-cat-down]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const i = Number(btn.getAttribute('data-cat-down'));
      if (i < state.categoryOrder.length - 1) {
        const tmp = state.categoryOrder[i + 1];
        state.categoryOrder[i + 1] = state.categoryOrder[i];
        state.categoryOrder[i] = tmp;
        renderPriorityModalList();
      }
    });
  });

  listEl.querySelectorAll('.priority-rule-item').forEach((item) => {
    item.addEventListener('dragstart', (e) => {
      state.draggedCategoryIndex = Number(item.getAttribute('data-cat-index'));
      item.classList.add('opacity-40');
      e.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('opacity-40');
      state.draggedCategoryIndex = null;
    });
    item.addEventListener('dragover', (e) => e.preventDefault());
    item.addEventListener('drop', (e) => {
      e.preventDefault();
      const targetIdx = Number(item.getAttribute('data-cat-index'));
      if (
        state.draggedCategoryIndex !== null &&
        state.draggedCategoryIndex !== targetIdx
      ) {
        const [moved] = state.categoryOrder.splice(state.draggedCategoryIndex, 1);
        state.categoryOrder.splice(targetIdx, 0, moved);
        state.draggedCategoryIndex = null;
        renderPriorityModalList();
      }
    });
  });
}

function renderAll() {
  const titleInput = document.getElementById('input-newsletter-title');
  if (titleInput && titleInput.value !== state.newsletterTitle) {
    titleInput.value = state.newsletterTitle;
  }
  const introInput = document.getElementById('input-intro-note');
  if (introInput && introInput.value !== state.introNote) {
    introInput.value = state.introNote;
  }
  renderThemeBar();
  renderBlocksList();
  renderPreview();
}

export async function copyNewsletterForEmail() {
  const mount = document.getElementById('newsletter-preview-mount');
  if (!mount) return;

  // Clone rendered DOM and rasterize any seasonal SVG illustrations into Retina PNGs for Gmail/Outlook compatibility
  const clone = mount.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.left = '-9999px';
  clone.style.width = '680px';
  document.body.appendChild(clone);

  try {
    await convertSvgElementsToPngInContainer(clone);
    const emailHtml = clone.innerHTML;

    if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
      const htmlBlob = new Blob([emailHtml], { type: 'text/html' });
      const plainText = mount.innerText || state.newsletterTitle;
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        }),
      ]);
      showToast('Copied formatted newsletter (including seasonal artwork). Press Cmd+V in Gmail or Outlook.');
      return;
    }
  } catch (err) {
    console.warn('ClipboardItem failed, falling back to selection copy:', err);
  } finally {
    clone.remove();
  }

  const range = document.createRange();
  range.selectNodeContents(mount);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  document.execCommand('copy');
  sel.removeAllRanges();
  showToast('Copied formatted newsletter. Press Cmd+V in Gmail or Outlook.');
}

export async function copyRawHtmlCode() {
  const emailHtml = renderNewsletterEmailHtml({
    newsletterTitle: state.newsletterTitle,
    subtitle: state.subtitle,
    introNote: state.introNote,
    blocks: state.blocks,
    theme: getActiveTheme(),
    showBanner: state.showBanner,
    formatBirthdayFirstLast: state.formatBirthdayFirstLast,
  });
  await navigator.clipboard.writeText(emailHtml);
  showToast('Copied HTML source code to clipboard.');
}

export function initApp() {
  const defaultSample = SAMPLE_UPDATES.november_2026;
  const parsed = parseNewsletterHtml(defaultSample.rawHtml);
  state.newsletterTitle = parsed.newsletterTitle;
  state.blocks = sortBlocksByPriority(
    parsed.blocks,
    state.categoryOrder,
    state.pinArchiveBottom
  );

  const titleInput = document.getElementById('input-newsletter-title');
  titleInput?.addEventListener('input', (e) => {
    state.newsletterTitle = e.target.value;
    renderPreview();
  });

  const introInput = document.getElementById('input-intro-note');
  introInput?.addEventListener('input', (e) => {
    state.introNote = e.target.value;
    renderPreview();
  });

  const bannerToggle = document.getElementById('toggle-concordia-banner');
  if (bannerToggle) {
    bannerToggle.checked = state.showBanner;
    bannerToggle.addEventListener('change', (e) => {
      state.showBanner = e.target.checked;
      renderPreview();
    });
  }

  const bdayToggle = document.getElementById('toggle-birthday-format');
  if (bdayToggle) {
    bdayToggle.checked = state.formatBirthdayFirstLast;
    bdayToggle.addEventListener('change', (e) => {
      state.formatBirthdayFirstLast = e.target.checked;
      localStorage.setItem(STORAGE_KEYS.BDAY_FIRST_LAST, String(state.formatBirthdayFirstLast));
      renderPreview();
    });
  }

  document.getElementById('btn-sample-nov')?.addEventListener('click', () => loadSample('november_2026'));
  document.getElementById('btn-sample-sep')?.addEventListener('click', () => loadSample('september_2026'));

  // Full View Toggles & Escape Key
  document.getElementById('btn-header-fullview')?.addEventListener('click', () => {
    setFullView(!state.isFullView);
  });
  document.getElementById('btn-exit-fullview')?.addEventListener('click', () => {
    setFullView(false);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.isFullView) {
      setFullView(false);
    }
  });

  document.getElementById('btn-resort-priority')?.addEventListener('click', () => {
    state.blocks = sortBlocksByPriority(
      state.blocks,
      state.categoryOrder,
      state.pinArchiveBottom
    );
    renderAll();
    showToast('Sections sorted by Priority Rules');
  });

  document.getElementById('btn-add-block')?.addEventListener('click', () => {
    const newBlock = {
      id: `block_${Date.now()}`,
      title: 'New Announcement',
      subtitle: '',
      category: 'featured_events',
      paragraphs: [
        {
          text: 'Enter announcement details here...',
          html: 'Enter announcement details here...',
          links: [],
        },
      ],
      bodyParagraphs: [
        {
          text: 'Enter announcement details here...',
          html: 'Enter announcement details here...',
          links: [],
        },
      ],
      tables: [],
      images: [],
      ctas: [],
    };
    state.blocks.unshift(newBlock);
    state.expandedBlockId = newBlock.id;
    renderAll();
  });

  document.querySelectorAll('[data-preview-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-preview-mode') || 'desktop';
      if (mode === 'full') {
        state.previewMode = 'desktop';
        setFullView(true);
      } else {
        state.previewMode = mode;
        if (state.isFullView && mode !== 'desktop') {
          setFullView(false);
        }
      }
      document.querySelectorAll('[data-preview-mode]').forEach((b) => {
        const bMode = b.getAttribute('data-preview-mode');
        const active =
          (state.isFullView && bMode === 'full') ||
          (!state.isFullView && bMode === state.previewMode);
        b.className = `px-3 py-1 text-xs font-medium rounded cursor-pointer transition-all ${
          active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
        }`;
      });
      renderPreview();
    });
  });

  document.getElementById('btn-copy-email')?.addEventListener('click', copyNewsletterForEmail);
  document.getElementById('btn-copy-html')?.addEventListener('click', copyRawHtmlCode);
  document.getElementById('btn-print-pdf')?.addEventListener('click', () => {
    window.print();
  });

  const pasteDialog = document.getElementById('dialog-paste-import');
  const richPasteArea = document.getElementById('rich-paste-editor');

  document.getElementById('btn-open-paste-modal')?.addEventListener('click', () => {
    if (richPasteArea) richPasteArea.innerHTML = '';
    pasteDialog?.showModal();
    setTimeout(() => richPasteArea?.focus(), 80);
  });

  document.getElementById('btn-close-paste-modal')?.addEventListener('click', () => {
    pasteDialog?.close();
  });

  document.getElementById('btn-parse-pasted-content')?.addEventListener('click', () => {
    const htmlContent = richPasteArea?.innerHTML || '';
    const textContent = richPasteArea?.innerText || '';
    if (!textContent.trim() && !htmlContent.includes('<img')) {
      showToast('Please paste content from Google Docs first.', 'error');
      return;
    }
    loadRawHtmlIntoStudio(htmlContent);
    pasteDialog?.close();
    showToast('Parsed and arranged by Priority Rules.');
  });

  const docxInput = document.getElementById('input-upload-docx');
  docxInput?.addEventListener('change', async () => {
    const file = docxInput.files && fileInput.files[0];
    if (!file) return;
    try {
      const html = await convertDocxFileToHtml(file);
      loadRawHtmlIntoStudio(html, file.name.replace(/\.docx$/i, ''));
      pasteDialog?.close();
      showToast(`Imported "${file.name}"`);
    } catch (err) {
      showToast(err.message || 'Failed to parse .docx file', 'error');
    } finally {
      docxInput.value = '';
    }
  });

  const priorityDialog = document.getElementById('dialog-priority-settings');
  const pinArchiveCheckbox = document.getElementById('checkbox-pin-archive');

  document.getElementById('btn-open-priority-modal')?.addEventListener('click', () => {
    if (pinArchiveCheckbox) pinArchiveCheckbox.checked = state.pinArchiveBottom;
    renderPriorityModalList();
    priorityDialog?.showModal();
  });

  document.getElementById('btn-close-priority-modal')?.addEventListener('click', () => {
    priorityDialog?.close();
  });

  document.getElementById('btn-reset-priority-defaults')?.addEventListener('click', () => {
    state.categoryOrder = DEFAULT_CATEGORIES.map((c) => ({ ...c }));
    state.pinArchiveBottom = true;
    if (pinArchiveCheckbox) pinArchiveCheckbox.checked = true;
    renderPriorityModalList();
  });

  document.getElementById('btn-save-priority-settings')?.addEventListener('click', () => {
    state.pinArchiveBottom = pinArchiveCheckbox ? pinArchiveCheckbox.checked : true;
    savePrioritySettings();
    state.blocks = sortBlocksByPriority(
      state.blocks,
      state.categoryOrder,
      state.pinArchiveBottom
    );
    priorityDialog?.close();
    renderAll();
    showToast('Saved Priority Rules');
  });

  const geminiKeyInput = document.getElementById('input-gemini-key');
  if (geminiKeyInput) {
    geminiKeyInput.value = state.geminiApiKey;
    geminiKeyInput.addEventListener('change', () => {
      state.geminiApiKey = geminiKeyInput.value.trim();
      localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, state.geminiApiKey);
    });
  }

  document.getElementById('btn-ai-generate-intro')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const key = document.getElementById('input-gemini-key')?.value?.trim() || state.geminiApiKey;
    if (!key) {
      showToast('Enter your Gemini API Key in the AI Assistant section first.', 'error');
      document.getElementById('input-gemini-key')?.focus();
      return;
    }
    state.geminiApiKey = key;
    localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, key);

    const origText = btn.textContent;
    btn.textContent = 'Drafting...';
    btn.disabled = true;
    try {
      const intro = await generateHosIntroWithGemini(key, state.newsletterTitle, state.blocks);
      state.introNote = intro;
      renderAll();
      showToast('Drafted opening note.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.textContent = origText;
      btn.disabled = false;
    }
  });

  document.getElementById('btn-ai-smart-classify')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const key = document.getElementById('input-gemini-key')?.value?.trim() || state.geminiApiKey;
    if (!key) {
      showToast('Enter your Gemini API Key first.', 'error');
      document.getElementById('input-gemini-key')?.focus();
      return;
    }
    state.geminiApiKey = key;
    localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, key);

    const origText = btn.textContent;
    btn.textContent = 'Refining...';
    btn.disabled = true;
    try {
      const refinements = await refineBlocksWithGemini(key, state.blocks);
      if (Array.isArray(refinements)) {
        for (const item of refinements) {
          const blk = state.blocks[item.index];
          if (blk && item.category) {
            blk.category = item.category;
            if (item.title) blk.title = item.title;
          }
        }
        state.blocks = sortBlocksByPriority(
          state.blocks,
          state.categoryOrder,
          state.pinArchiveBottom
        );
        renderAll();
        showToast('Refined categories and titles.');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.textContent = origText;
      btn.disabled = false;
    }
  });

  renderAll();
}
