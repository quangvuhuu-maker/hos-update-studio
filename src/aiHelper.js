// Optional Gemini AI Assistant for Executive Summary generation & Smart Block Classification

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export async function generateHosIntroWithGemini(apiKey, newsletterTitle, blocks) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Please enter a valid Gemini API Key in AI Settings first.');
  }

  const summaryPoints = blocks
    .filter((b) => b.category !== 'archive')
    .map((b) => `- [${b.category}] ${b.title}: ${(b.paragraphs[0]?.text || '').slice(0, 140)}`)
    .join('\n');

  const prompt = `You are the Head of School at Concordia International School Hanoi.
Write a warm, concise, and professional 2-to-3 sentence opening greeting for our faculty and staff newsletter titled "${newsletterTitle}".
Highlight 2 or 3 key themes or upcoming events from the summary below, express appreciation for the faculty and staff, and keep the tone uplifting and collegial. Return ONLY the plain text greeting paragraph (no markdown quotes or subject line).

Newsletter sections:
${summaryPoints}`;

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey.trim())}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 250,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errText.slice(0, 160)}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text.trim();
}

export async function refineBlocksWithGemini(apiKey, blocks) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Please enter a valid Gemini API Key in AI Settings first.');
  }

  const payload = blocks.map((b, index) => ({
    index,
    title: b.title,
    currentCategory: b.category,
    sampleText: b.paragraphs.map((p) => p.text).join(' ').slice(0, 260),
  }));

  const prompt = `You are an executive assistant organizing the Head of School Monthly Update at Concordia International School Hanoi.
For each block below, verify the best category from this exact allowed list:
["calendar", "announcements", "professional_training", "personnel", "bus_duty", "birthdays", "qa_concerns", "devotions", "archive"]
Also provide a clean, concise, professional title if the current title is overly verbose or missing spacing.
Return ONLY a valid JSON array of objects: [{"index": number, "category": string, "title": string}].

Blocks:
${JSON.stringify(payload, null, 2)}`;

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey.trim())}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errText.slice(0, 160)}`);
  }

  const data = await response.json();
  const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  return JSON.parse(rawJson);
}

