import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MergePage from "./pages/MergePage";
import SplitPage from "./pages/SplitPage";
import CompressPage from "./pages/CompressPage";
import PdfToImagesPage from "./pages/PdfToImagesPage";
import RotatePage from "./pages/RotatePage";
import WatermarkPage from "./pages/WatermarkPage";
import PageNumbersPage from "./pages/PageNumbersPage";
import ProtectPage from "./pages/ProtectPage";
import UnlockPage from "./pages/UnlockPage";
import ImagesToPdfPage from "./pages/ImagesToPdfPage";
import OrganizePage from "./pages/OrganizePage";
import EditMetadataPage from "./pages/EditMetadataPage";
import SignPdfPage from "./pages/SignPdfPage";
import PdfToWordPage from "./pages/PdfToWordPage";
import PdfToPptPage from "./pages/PdfToPptPage";
import PdfToTextPage from "./pages/PdfToTextPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
