

# Plan: Expand to 50+ Tools with Performance & UX Upgrades

## Current State
38 tools across Edit, Convert, Security, Image, and Utility categories. All browser-based with pdf-lib, pdfjs-dist, xlsx, mammoth. Homepage has category tabs, search, FAQ, comparison table, dark mode.

---

## New Tools to Add (12 more, reaching 50 total)

### PDF Tools (7 new)

| Tool | Route | How it works |
|---|---|---|
| **PDF to Markdown** | `/pdf-to-markdown` | Extract text via pdfjs-dist, convert headings/paragraphs to markdown syntax |
| **Markdown to PDF** | `/markdown-to-pdf` | Parse markdown to HTML, open print dialog for save-as-PDF (like HTML to PDF) |
| **Add Header/Footer** | `/header-footer` | Add custom text to top/bottom of every page via pdf-lib drawText |
| **PDF to XML** | `/pdf-to-xml` | Extract text via pdfjs-dist, output structured XML with page/paragraph tags |
| **Duplicate PDF** | `/duplicate-pages` | Duplicate specific pages N times within the same PDF via pdf-lib copyPages |
| **Add QR Code** | `/add-qr-code` | Generate QR code on canvas from user text/URL, embed as image on PDF pages via pdf-lib embedPng |
| **PDF to TIFF** | `/pdf-to-tiff` | Render pages via pdfjs canvas, export as TIFF-compatible PNG downloads (bundled in ZIP) |

### Image Tools (3 new)

| Tool | Route | How it works |
|---|---|---|
| **Rotate Image** | `/rotate-image` | Load to canvas, rotate 90/180/270 degrees, export |
| **Flip Image** | `/flip-image` | Load to canvas, flip horizontal/vertical via scale(-1,1) or scale(1,-1), export |
| **Image to Base64** | `/image-to-base64` | Read file as data URL, display base64 string for copying |

### Utility (2 new)

| Tool | Route | How it works |
|---|---|---|
| **Batch Process** | `/batch` | Upload multiple PDFs, apply a single operation (compress/rotate/grayscale) to all at once, download as ZIP |
| **PDF Diff (Text)** | `/pdf-diff` | Extract text from two PDFs, show side-by-side text diff with highlighted additions/deletions |

---

## Performance & UX Upgrades

### 1. Navbar Update
- Add the 12 new tools to the `moreTools` array in `Navbar.tsx` so they appear in the "More" dropdown and mobile menu.

### 2. Homepage Updates (`Index.tsx`)
- Add all 12 new tools to the `tools` array with proper categories
- Update hero subtitle count from "38" to "50"
- Update "How It Works" step 1 text to say "50 free tools"

### 3. Footer Update (`Footer.tsx`)
- Add all 12 new tools to the appropriate footer sections
- Update the "38 free" text to "50 free"

### 4. SEO Updates
- Update `index.html` meta tags and JSON-LD to reference 50 tools
- Add new routes to `public/sitemap.xml`
- Update `document.title` in `Index.tsx`

### 5. App Router (`App.tsx`)
- Add lazy imports and Route entries for all 12 new pages

---

## Technical Details

### Dependencies
- **No new dependencies needed.** QR code generation uses canvas drawing (simple black/white grid). All other tools use existing pdf-lib, pdfjs-dist, jszip, and canvas APIs.

### File Changes Summary

**New files (12 tool pages):**
- `src/pages/PdfToMarkdownPage.tsx`
- `src/pages/MarkdownToPdfPage.tsx`
- `src/pages/HeaderFooterPage.tsx`
- `src/pages/PdfToXmlPage.tsx`
- `src/pages/DuplicatePagesPage.tsx`
- `src/pages/AddQrCodePage.tsx`
- `src/pages/PdfToTiffPage.tsx`
- `src/pages/RotateImagePage.tsx`
- `src/pages/FlipImagePage.tsx`
- `src/pages/ImageToBase64Page.tsx`
- `src/pages/BatchProcessPage.tsx`
- `src/pages/PdfDiffPage.tsx`

**Modified files:**
- `src/App.tsx` — 12 new lazy imports + routes
- `src/pages/Index.tsx` — 12 new tool entries, updated count
- `src/components/Navbar.tsx` — add new tools to moreTools array
- `src/components/Footer.tsx` — add new tools to footer sections, update count
- `index.html` — update meta/JSON-LD to "50 tools"
- `public/sitemap.xml` — 12 new route entries

### Implementation Pattern
Each new tool follows the established pattern: FileDropZone for upload, processing with existing libraries, download via Blob + anchor click or saveAs. All use `ToolPageLayout` wrapper for consistent SEO and UI.

