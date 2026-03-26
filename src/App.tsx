import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

const App = () => (
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

export default App;
