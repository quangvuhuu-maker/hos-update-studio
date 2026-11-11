# HOS Monthly Update Studio
**Concordia International School Hanoi**

A dedicated editorial publishing studio for designing, formatting, and generating beautiful, high-priority Head of School bulletins from Google Docs content.

---

## 🌟 Key Features

1. **Smart Google Docs Importer**:
   - Paste directly from Google Docs or upload `.docx` files.
   - Preserves tables, links, bold/italic text, and inline images.
2. **Priority-First Auto Sorting**:
   - Automatically re-orders incoming sections by custom priority:
     - 📌 Major Calendar / Key Events
     - 🎓 Professional Development & Academic Focus
     - 👥 Personnel & Staff Updates
     - 🚌 Campus Operations & Bus Duty
     - 🎂 Community Birthdays
     - 💬 Questions & Responses
     - ✝️ Devotion Sign-ups
     - 📚 Archives / Past Issues Index (always docked at the bottom)
   - Supports drag-and-drop manual re-ordering.
3. **Bespoke Festive Themes & Vector Art**:
   - **Concordia Editorial** (Official Forest Green & Warm Gold)
   - **Christmas & Advent** (Subtle pine boughs, ornaments, winter motifs)
   - **Tết Nguyên Đán** (Peach blossoms, apricot flowers, traditional patterns)
   - **Easter & Spring** (Pastel botanical accents, festive eggs)
   - **Autumn & Thanksgiving** (Warm amber, harvest leaves, subtle pumpkins)
   - **Mid-Autumn Festival** (Full moon, lanterns, lotus motifs)
4. **Interactive Editing & Link Tools**:
   - Inline text link attachment tool (`[text](url)`).
   - Dedicated Archive & Past Issues link manager (add, re-order, edit URLs).
   - View Full mode for distraction-free reading.
5. **1-Click Multi-Channel Export**:
   - **Copy for Email (Gmail / Outlook)**: Generates 100% inline CSS table layout compatible with major email clients, automatically rasterizing SVGs to 2x Retina PNGs.
   - **HTML Code Export**: Clean, standalone code.
   - **Print / PDF**: Printer-friendly CSS stylesheet.

---

## 🚀 How to Run Locally

No build tools or npm installation required. Run with any local HTTP server:

```bash
# Python 3
cd hos-update-studio
python3 -m http.server 8080
```

Open your browser at `http://localhost:8080`.

---

## 🌐 Deploy to GitHub Pages (Free)

1. Go to repository **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
3. Select branch `main` and folder `/ (root)`.
4. Click **Save**. Your site will be live at `https://quangvuhuu-maker.github.io/hos-update-studio/` within 1 minute!
