

# More Tools to Add — Closing Every Gap

You currently have **26 tools**. Here's what's still missing compared to iLovePDF, Smallpdf, Adobe Acrobat Online, and PDF24 — all implementable 100% in the browser.

---

## New Tools to Add (12 more → 38 total)

### Conversion (4 new)
| Tool | How it works (browser-only) |
|---|---|
| **PDF to JSON** | Extract text via `pdfjs-dist`, output structured JSON with page/paragraph grouping |
| **PDF to HTML** | Extract text + positions via `pdfjs-dist`, generate semantic HTML with basic layout |
| **Excel to PDF** | Parse `.xlsx` with SheetJS (`xlsx` package), render table to canvas/HTML, convert to PDF via `pdf-lib` |
| **Word to PDF** | Parse `.docx` with `mammoth.js`, render HTML, print to PDF via browser pipeline |

### Editing (4 new)
| Tool | How it works (browser-only) |
|---|---|
| **Redact PDF** | Let users draw black rectangles over sensitive content, burn them into the page via canvas re-render + `pdf-lib` embed |
| **Add Bookmarks** | Let users define named bookmarks (outline entries) and save them into the PDF outline tree via `pdf-lib` |
| **PDF Annotate** | Add highlight boxes, text notes, and arrows — rendered as overlays and burned into pages |
| **Reverse PDF** | Simple — reverse page order using `pdf-lib` `copyPages` |

### Image Tools (2 new)
| Tool | How it works (browser-only) |
|---|---|
| **Convert Image Format** | Load image to canvas, export as PNG/JPG/WEBP — simple `canvas.toBlob` with format option |
| **Crop Image** | Draw a crop rectangle on canvas, export the cropped region |

### Utility (2 new)
| Tool | How it works (browser-only) |
|---|---|
| **Compare PDFs** | Render two PDFs page-by-page to canvas, pixel-diff them, highlight changes in red overlay |
| **PDF Page Size** | Analyze and display dimensions of each page, with option to resize/standardize all pages to A4/Letter/etc. |

---

## Also: Homepage & UX Improvements (from approved plan)

These were approved but not yet built:

1. **Category filter tabs** — `[All] [Edit] [Convert] [Security] [Images]` above the tool grid
2. **"How It Works" section** — 3-step visual explainer
3. **PWA manifest** — `manifest.json` + service worker registration for offline install
4. **Community section** — "Star on GitHub", "Report Bug", "Request Feature" links
5. **Footer update** — list all tools organized by category
6. **SEO fix** — update meta tags from "16 tools" to correct count

---

## Dependencies Needed

- `xlsx` (SheetJS) — for Excel parsing (Excel to PDF tool)
- `mammoth` — for Word-to-HTML conversion (Word to PDF tool)
- No other new dependencies; everything else uses existing `pdf-lib`, `pdfjs-dist`, and canvas APIs

---

## Implementation Order

**Phase 1 — Quick wins (simple tools):**
Reverse PDF, Convert Image Format, Crop Image, PDF to JSON, PDF Page Size

**Phase 2 — Medium complexity:**
Redact PDF, Add Bookmarks, PDF to HTML, Compare PDFs

**Phase 3 — Heavier tools:**
Excel to PDF (needs `xlsx`), Word to PDF (needs `mammoth`), PDF Annotate

**Phase 4 — UX & community:**
Category tabs, How It Works, PWA, footer update, SEO fixes

This brings the total to **38 free browser-based tools** — more than iLovePDF's free tier offers.

