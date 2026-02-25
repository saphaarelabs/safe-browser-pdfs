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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
