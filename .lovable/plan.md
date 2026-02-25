

# PDF Tools — Local Browser-Based Toolkit

An open-source, privacy-first PDF toolkit that runs entirely in the user's browser. No uploads, no servers, no database — all processing happens locally using JavaScript libraries.

## Design & Branding
- **Colorful & friendly** visual style with a vibrant gradient hero, playful icons, and rounded UI elements
- Bright accent colors for each tool (e.g., blue for Merge, green for Split, orange for Compress, purple for PDF to Images)
- Clear privacy messaging: "Your files never leave your browser"
- Responsive layout that works on desktop and mobile

## Pages & Layout

### Home Page
- Hero section with app name, tagline ("Free PDF tools that respect your privacy"), and a grid of tool cards
- Each tool card has an icon, title, short description, and a CTA button
- Footer with open-source badge/link

### Tool Pages (one per feature)
Each tool page has a consistent layout:
- Drag-and-drop file upload zone (with click-to-browse fallback)
- Tool-specific options panel
- Action button to process
- Download result button
- "Back to all tools" navigation

## Features

### 1. Merge PDFs
- Upload multiple PDF files via drag & drop
- Reorder files by dragging them in a list
- Preview file names and page counts
- Merge and download as a single PDF

### 2. Split PDF
- Upload a single PDF
- Show page count and thumbnail previews
- Options: extract specific pages (e.g., "1, 3-5"), split into individual pages, or split every N pages
- Download result(s) as PDF (or ZIP if multiple files)

### 3. Compress / Resize PDF
- Upload a PDF
- Choose quality level: Low (smaller file), Medium, High (better quality)
- Show estimated file size before/after
- Download compressed PDF

### 4. PDF to Images
- Upload a PDF
- Choose output format (PNG or JPG) and resolution/quality
- Preview generated images
- Download individual images or all as a ZIP

## Technical Approach
- Use **pdf-lib** for merging, splitting, and manipulating PDFs
- Use **pdf.js** (Mozilla's library) for rendering PDF pages to canvas (for previews and image export)
- Use **JSZip** for bundling multiple output files into a ZIP download
- All processing runs client-side in the browser — zero server calls
- Clean, well-structured code suitable for open-source contribution

## Navigation
- Top navbar with app logo/name, links to each tool, and a GitHub icon link
- Breadcrumb on tool pages for easy navigation back

