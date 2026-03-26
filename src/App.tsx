import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotesProvider } from "@/contexts/NotesContext";
import PostLoginRedirect from "@/components/PostLoginRedirect";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Interests from "./pages/Interests";
import Dashboard from "./pages/Dashboard";
import MyNotes from "./pages/MyNotes";
import NoteDetail from "./pages/NoteDetail";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import TestTranscribe from "./pages/TestTranscribe";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7834/ingest/e70bfa47-b8c9-42cc-82af-74e47d9233d1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "4b09f5",
      },
      body: JSON.stringify({
        sessionId: "4b09f5",
        runId: "vercel-deeplink-check",
        hypothesisId: "H2",
        location: "src/App.tsx:App_mount",
        message: "SPA app booted",
        data: {
          pathname: typeof window !== "undefined" ? window.location.pathname : "(no-window)",
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotesProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <PostLoginRedirect />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/interests" element={<Interests />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/my-notes" element={<MyNotes />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/notes/:id" element={<NoteDetail />} />
                <Route path="/test-transcribe" element={<TestTranscribe />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </NotesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
