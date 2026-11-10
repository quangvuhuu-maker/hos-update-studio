// Pure Browser .docx Unzipper & Rich HTML Converter (zero external dependencies, uses Web DecompressionStream + DOMParser)

async function unzipDocxEntries(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  const bytes = new Uint8Array(arrayBuffer);
  const entries = {};

  // Find End of Central Directory (EOCD) signature 0x06054b50
  let eocdOffset = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) {
    throw new Error('Invalid .docx file (ZIP Central Directory not found)');
  }

  const cdCount = view.getUint16(eocdOffset + 10, true);
  const cdOffset = view.getUint32(eocdOffset + 16, true);

  let ptr = cdOffset;
  const decoder = new TextDecoder('utf-8');

  for (let i = 0; i < cdCount; i++) {
    if (view.getUint32(ptr, true) !== 0x02014b50) break;
    const compressionMethod = view.getUint16(ptr + 10, true);
    const compressedSize = view.getUint32(ptr + 20, true);
    const fileNameLen = view.getUint16(ptr + 28, true);
    const extraLen = view.getUint16(ptr + 30, true);
    const commentLen = view.getUint16(ptr + 32, true);
    const localHeaderOffset = view.getUint32(ptr + 42, true);

    const fileName = decoder.decode(bytes.subarray(ptr + 46, ptr + 46 + fileNameLen));
    ptr += 46 + fileNameLen + extraLen + commentLen;

    // Read local file header at localHeaderOffset
    const localNameLen = view.getUint16(localHeaderOffset + 26, true);
    const localExtraLen = view.getUint16(localHeaderOffset + 28, true);
    const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
    const compressedData = bytes.subarray(dataStart, dataStart + compressedSize);

    if (
      fileName === 'word/document.xml' ||
      fileName === 'word/_rels/document.xml.rels'
    ) {
      let rawBytes;
      if (compressionMethod === 0) {
        rawBytes = compressedData;
      } else if (compressionMethod === 8) {
        const ds = new DecompressionStream('deflate-raw');
        const writer = ds.writable.getWriter();
        writer.write(compressedData);
        writer.close();
        const resp = new Response(ds.readable);
        const ab = await resp.arrayBuffer();
        rawBytes = new Uint8Array(ab);
      }
      if (rawBytes) {
        entries[fileName] = decoder.decode(rawBytes);
      }
    }
  }

  return entries;
}

export async function convertDocxFileToHtml(file) {
  const arrayBuffer = await file.arrayBuffer();
  const entries = await unzipDocxEntries(arrayBuffer);

  const docXml = entries['word/document.xml'];
  if (!docXml) {
    throw new Error('Could not find word/document.xml inside the uploaded .docx file.');
  }

  const relsMap = {};
  if (entries['word/_rels/document.xml.rels']) {
    const relsDoc = new DOMParser().parseFromString(entries['word/_rels/document.xml.rels'], 'application/xml');
    for (const rel of Array.from(relsDoc.getElementsByTagName('Relationship'))) {
      const id = rel.getAttribute('Id');
      const target = rel.getAttribute('Target');
      if (id && target) {
        relsMap[id] = target;
      }
    }
  }

  const xmlDoc = new DOMParser().parseFromString(docXml, 'application/xml');
  const body = xmlDoc.getElementsByTagNameNS('*', 'body')[0];
  if (!body) {
    throw new Error('Invalid Word document structure.');
  }

  const parseParagraph = (pNode) => {
    const parts = [];
    for (const child of Array.from(pNode.childNodes)) {
      const local = child.localName;
      if (local === 'r') {
        const tNodes = Array.from(child.getElementsByTagNameNS('*', 't'));
        const text = tNodes.map((n) => n.textContent || '').join('');
        if (!text) continue;
        const rPr = child.getElementsByTagNameNS('*', 'rPr')[0];
        const isBold = rPr && rPr.getElementsByTagNameNS('*', 'b').length > 0;
        const isItalic = rPr && rPr.getElementsByTagNameNS('*', 'i').length > 0;
        let escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if (isBold) escaped = `<strong>${escaped}</strong>`;
        if (isItalic) escaped = `<em>${escaped}</em>`;
        parts.push(escaped);
      } else if (local === 'hyperlink') {
        const rId =
          child.getAttribute('r:id') ||
          child.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
        const url = (rId && relsMap[rId]) || '#';
        const tNodes = Array.from(child.getElementsByTagNameNS('*', 't'));
        const text = tNodes.map((n) => n.textContent || '').join('');
        if (text) {
          const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          parts.push(`<strong><a href="${url.replace(/"/g, '&quot;')}">${escaped}</a></strong>`);
        }
      }
    }
    const joined = parts.join('').trim();
    return joined ? `<p>${joined}</p>` : '';
  };

  const htmlLines = [];
  for (const elem of Array.from(body.childNodes)) {
    const local = elem.localName;
    if (local === 'p') {
      const pHtml = parseParagraph(elem);
      if (pHtml) htmlLines.push(pHtml);
    } else if (local === 'tbl') {
      const trs = Array.from(elem.getElementsByTagNameNS('*', 'tr'));
      const rowsHtml = trs.map((tr, rIdx) => {
        const tag = rIdx === 0 ? 'th' : 'td';
        const tcs = Array.from(tr.getElementsByTagNameNS('*', 'tc'));
        const cellsHtml = tcs
          .map((tc) => {
            const ps = Array.from(tc.getElementsByTagNameNS('*', 'p'))
              .map(parseParagraph)
              .filter(Boolean)
              .map((p) => p.replace(/^<p>|<\/p>$/g, ''));
            return `<${tag}>${ps.join('<br/>')}</${tag}>`;
          })
          .join('');
        return `<tr>${cellsHtml}</tr>`;
      });
      htmlLines.push(`<table>${rowsHtml.join('')}</table>`);
    }
  }

  return htmlLines.join('\n');
}

