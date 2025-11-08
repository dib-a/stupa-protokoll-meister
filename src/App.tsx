import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SitzungenProvider } from "./contexts/SitzungenContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { TemplatesProvider } from "./contexts/TemplatesContext";
import { Layout } from "./components/Layout";
import SitzungenList from "./pages/SitzungenList";
import NewSitzung from "./pages/NewSitzung";
import SitzungDetail from "./pages/SitzungDetail";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SettingsProvider>
          <TemplatesProvider>
            <SitzungenProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<SitzungenList />} />
                  <Route path="/new" element={<NewSitzung />} />
                  <Route path="/sitzung/:id" element={<SitzungDetail />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </SitzungenProvider>
          </TemplatesProvider>
        </SettingsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
