

# What's Missing to Make This the Best PDF Toolkit

## Current State (16 tools)
Merge, Split, Compress, PDF→Images, Images→PDF, Rotate, Watermark, Page Numbers, Protect, Unlock, Organize Pages, Edit Metadata, Sign PDF, PDF→Word, PDF→PowerPoint, PDF→Text.

## Gap Analysis vs. iLovePDF / Smallpdf / Adobe Acrobat Online

Here's what the app still needs across several categories:

---

### 1. Missing Tools (New Pages)

**Conversion tools:**
- **HTML to PDF** — paste a URL or HTML snippet, render it to PDF using the browser's print-to-PDF pipeline
- **PDF to Excel / CSV** — extract tabular data from PDFs into spreadsheet format (using `pdfjs-dist` text extraction + heuristic table detection)

**Editing tools:**
- **Crop PDF** — let users draw a crop box on a page preview and apply it to all or selected pages (using `pdf-lib` mediaBox/cropBox manipulation)
- **Flatten PDF** — remove form fields and annotations, baking them into the page content
- **Grayscale PDF** — convert a color PDF to grayscale (render pages via canvas, desaturate, re-embed)
- **Delete Pages** — a simpler, focused version of Organize (just pick pages to remove)
- **Extract Pages** — pull specific pages into a new PDF (overlaps with Split but is a common standalone tool)
- **Repair PDF** — attempt to re-save a corrupted PDF by parsing and re-serializing with `pdf-lib`

**Image tools:**
- **Resize Images** — resize images before/independently of PDF conversion
- **Compress Images** — reduce image file size using canvas quality settings

---

### 2. UX & Design Improvements

- **Dark mode toggle** — a theme switcher in the navbar (using `next-themes` which is already installed)
- **Batch processing indicator** — progress bars for multi-file operations
- **Recent files / history** — store recent operations in localStorage so users can quickly re-download
- **Drag-and-drop reorder** — proper drag reordering in Merge and Organize tools (currently just buttons)
- **PDF preview panel** — show a thumbnail preview of uploaded PDFs on every tool page using `pdfjs-dist`
- **Keyboard shortcuts** — Ctrl+O to open, Ctrl+S to save/download
- **Toast notifications** — better success/error feedback (already have Sonner installed)
- **Mobile optimization** — ensure every tool works well on small screens
- **Tool search** — a search/filter bar on the homepage to quickly find tools

---

### 3. SEO & Marketing Improvements

- **Individual tool SEO** — each tool page should have its own `<title>`, `<meta description>`, and structured data (currently only the homepage has meta tags)
- **FAQ section** — add an FAQ accordion on the homepage answering common questions ("Is it really free?", "Are my files safe?", etc.) — great for SEO
- **Sitemap** — generate a `sitemap.xml` for all tool routes
- **Canonical URLs** — add canonical link tags
- **Performance (Core Web Vitals)** — lazy-load tool pages with `React.lazy` + `Suspense` for faster initial load

---

### 4. Trust & Community

- **Comparison section** — "Why choose us over iLovePDF?" table highlighting privacy, no uploads, open source
- **Contributor guide link** — prominent "Contribute" CTA on homepage
- **Star count badge** — show GitHub stars dynamically
- **PWA support** — add a `manifest.json` and service worker so the app can be installed and truly works offline

---

## Recommended Priority (what to build now)

I'd recommend implementing these in this order:

1. **Dark mode toggle** — quick win, already have `next-themes`
2. **Tool search on homepage** — filter the 16+ tools instantly
3. **Per-page SEO** — dynamic `<title>` and meta tags via `react-helmet-async`
4. **FAQ section** — accordion on homepage for SEO juice
5. **PDF preview on all tool pages** — thumbnail rendering using pdfjs
6. **New tools: Crop PDF, Flatten PDF, Grayscale PDF, PDF to CSV** — 4 more tools to close the gap
7. **PWA support** — manifest + service worker for true offline use
8. **Comparison section** — marketing content to convert visitors

### Technical Details

- Dark mode: use `next-themes` `ThemeProvider`, add a `Moon/Sun` toggle button in `Navbar.tsx`
- Tool search: a simple `useState` filter on the tools array in `Index.tsx`
- Per-page SEO: install `react-helmet-async`, wrap app in `HelmetProvider`, add `<Helmet>` to each tool page
- FAQ: use the existing `Accordion` component from shadcn/ui
- PDF preview: create a shared `PdfThumbnail` component using `pdfjs-dist` canvas rendering
- Crop PDF: render page to canvas for visual crop selection, then modify `CropBox` in `pdf-lib`
- PWA: add `vite-plugin-pwa` for automatic service worker generation

Would you like me to implement all of these, or would you prefer to pick specific items?

