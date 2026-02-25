import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const MergePage = lazy(() => import("./pages/MergePage"));
const SplitPage = lazy(() => import("./pages/SplitPage"));
const CompressPage = lazy(() => import("./pages/CompressPage"));
const PdfToImagesPage = lazy(() => import("./pages/PdfToImagesPage"));
const RotatePage = lazy(() => import("./pages/RotatePage"));
const WatermarkPage = lazy(() => import("./pages/WatermarkPage"));
const PageNumbersPage = lazy(() => import("./pages/PageNumbersPage"));
const ProtectPage = lazy(() => import("./pages/ProtectPage"));
const UnlockPage = lazy(() => import("./pages/UnlockPage"));
const ImagesToPdfPage = lazy(() => import("./pages/ImagesToPdfPage"));
const OrganizePage = lazy(() => import("./pages/OrganizePage"));
const EditMetadataPage = lazy(() => import("./pages/EditMetadataPage"));
const SignPdfPage = lazy(() => import("./pages/SignPdfPage"));
const PdfToWordPage = lazy(() => import("./pages/PdfToWordPage"));
const PdfToPptPage = lazy(() => import("./pages/PdfToPptPage"));
const PdfToTextPage = lazy(() => import("./pages/PdfToTextPage"));
const CropPdfPage = lazy(() => import("./pages/CropPdfPage"));
const FlattenPdfPage = lazy(() => import("./pages/FlattenPdfPage"));
const GrayscalePdfPage = lazy(() => import("./pages/GrayscalePdfPage"));
const PdfToCsvPage = lazy(() => import("./pages/PdfToCsvPage"));
const DeletePagesPage = lazy(() => import("./pages/DeletePagesPage"));
const ExtractPagesPage = lazy(() => import("./pages/ExtractPagesPage"));
const RepairPdfPage = lazy(() => import("./pages/RepairPdfPage"));
const HtmlToPdfPage = lazy(() => import("./pages/HtmlToPdfPage"));
const ResizeImagesPage = lazy(() => import("./pages/ResizeImagesPage"));
const CompressImagesPage = lazy(() => import("./pages/CompressImagesPage"));
// New Phase 1-3 tools
const ReversePdfPage = lazy(() => import("./pages/ReversePdfPage"));
const ConvertImagePage = lazy(() => import("./pages/ConvertImagePage"));
const CropImagePage = lazy(() => import("./pages/CropImagePage"));
const PdfToJsonPage = lazy(() => import("./pages/PdfToJsonPage"));
const PdfPageSizePage = lazy(() => import("./pages/PdfPageSizePage"));
const RedactPdfPage = lazy(() => import("./pages/RedactPdfPage"));
const AddBookmarksPage = lazy(() => import("./pages/AddBookmarksPage"));
const PdfToHtmlPage = lazy(() => import("./pages/PdfToHtmlPage"));
const ComparePdfsPage = lazy(() => import("./pages/ComparePdfsPage"));
const ExcelToPdfPage = lazy(() => import("./pages/ExcelToPdfPage"));
const WordToPdfPage = lazy(() => import("./pages/WordToPdfPage"));
const AnnotatePdfPage = lazy(() => import("./pages/AnnotatePdfPage"));
const PdfToMarkdownPage = lazy(() => import("./pages/PdfToMarkdownPage"));
const MarkdownToPdfPage = lazy(() => import("./pages/MarkdownToPdfPage"));
const HeaderFooterPage = lazy(() => import("./pages/HeaderFooterPage"));
const PdfToXmlPage2 = lazy(() => import("./pages/PdfToXmlPage"));
const DuplicatePagesPage = lazy(() => import("./pages/DuplicatePagesPage"));
const AddQrCodePage = lazy(() => import("./pages/AddQrCodePage"));
const PdfToTiffPage = lazy(() => import("./pages/PdfToTiffPage"));
const RotateImagePage = lazy(() => import("./pages/RotateImagePage"));
const FlipImagePage = lazy(() => import("./pages/FlipImagePage"));
const ImageToBase64Page = lazy(() => import("./pages/ImageToBase64Page"));
const BatchProcessPage = lazy(() => import("./pages/BatchProcessPage"));
const PdfDiffPage = lazy(() => import("./pages/PdfDiffPage"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/merge" element={<MergePage />} />
            <Route path="/split" element={<SplitPage />} />
            <Route path="/compress" element={<CompressPage />} />
            <Route path="/pdf-to-images" element={<PdfToImagesPage />} />
            <Route path="/images-to-pdf" element={<ImagesToPdfPage />} />
            <Route path="/rotate" element={<RotatePage />} />
            <Route path="/watermark" element={<WatermarkPage />} />
            <Route path="/page-numbers" element={<PageNumbersPage />} />
            <Route path="/protect" element={<ProtectPage />} />
            <Route path="/unlock" element={<UnlockPage />} />
            <Route path="/organize" element={<OrganizePage />} />
            <Route path="/edit-metadata" element={<EditMetadataPage />} />
            <Route path="/sign" element={<SignPdfPage />} />
            <Route path="/pdf-to-word" element={<PdfToWordPage />} />
            <Route path="/pdf-to-ppt" element={<PdfToPptPage />} />
            <Route path="/pdf-to-text" element={<PdfToTextPage />} />
            <Route path="/crop" element={<CropPdfPage />} />
            <Route path="/flatten" element={<FlattenPdfPage />} />
            <Route path="/grayscale" element={<GrayscalePdfPage />} />
            <Route path="/pdf-to-csv" element={<PdfToCsvPage />} />
            <Route path="/delete-pages" element={<DeletePagesPage />} />
            <Route path="/extract-pages" element={<ExtractPagesPage />} />
            <Route path="/repair" element={<RepairPdfPage />} />
            <Route path="/html-to-pdf" element={<HtmlToPdfPage />} />
            <Route path="/resize-images" element={<ResizeImagesPage />} />
            <Route path="/compress-images" element={<CompressImagesPage />} />
            <Route path="/reverse" element={<ReversePdfPage />} />
            <Route path="/convert-image" element={<ConvertImagePage />} />
            <Route path="/crop-image" element={<CropImagePage />} />
            <Route path="/pdf-to-json" element={<PdfToJsonPage />} />
            <Route path="/pdf-page-size" element={<PdfPageSizePage />} />
            <Route path="/redact" element={<RedactPdfPage />} />
            <Route path="/add-bookmarks" element={<AddBookmarksPage />} />
            <Route path="/pdf-to-html" element={<PdfToHtmlPage />} />
            <Route path="/compare" element={<ComparePdfsPage />} />
            <Route path="/excel-to-pdf" element={<ExcelToPdfPage />} />
            <Route path="/word-to-pdf" element={<WordToPdfPage />} />
            <Route path="/annotate" element={<AnnotatePdfPage />} />
            <Route path="/pdf-to-markdown" element={<PdfToMarkdownPage />} />
            <Route path="/markdown-to-pdf" element={<MarkdownToPdfPage />} />
            <Route path="/header-footer" element={<HeaderFooterPage />} />
            <Route path="/pdf-to-xml" element={<PdfToXmlPage2 />} />
            <Route path="/duplicate-pages" element={<DuplicatePagesPage />} />
            <Route path="/add-qr-code" element={<AddQrCodePage />} />
            <Route path="/pdf-to-tiff" element={<PdfToTiffPage />} />
            <Route path="/rotate-image" element={<RotateImagePage />} />
            <Route path="/flip-image" element={<FlipImagePage />} />
            <Route path="/image-to-base64" element={<ImageToBase64Page />} />
            <Route path="/batch" element={<BatchProcessPage />} />
            <Route path="/pdf-diff" element={<PdfDiffPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
