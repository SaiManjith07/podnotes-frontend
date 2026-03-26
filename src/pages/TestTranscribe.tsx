import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { API_BASE } from "@/lib/api";
import { Loader2, ArrowLeft } from "lucide-react";

type ExtractAudioResponse = {
  videoTitle: string;
  sourceType: "youtube";
  sourceUrl: string;
  transcript: string;
};

export default function TestTranscribe() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleTranscribe = async () => {
    const trimmed = youtubeUrl.trim();
    if (!trimmed) {
      toast({
        title: "Missing YouTube URL",
        description: "Paste a valid YouTube link (watch URL, youtu.be, or shorts).",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError("");
    setVideoTitle("");
    setTranscript("");

    try {
      const res = await fetch(`${API_BASE}/api/podcast/extract-audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeUrl: trimmed }),
      });

      if (!res.ok) {
        const maybeJson = await res.json().catch(() => null);
        const detail = maybeJson?.detail ?? `Request failed with status ${res.status}`;
        throw new Error(detail);
      }

      const data = (await res.json()) as ExtractAudioResponse;
      setVideoTitle(data.videoTitle);
      setTranscript(data.transcript);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to transcribe YouTube video.";
      setError(message);
      toast({
        title: "Transcription failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen-safe gradient-warm safe-px p-4 sm:p-8 pb-10 relative overflow-x-hidden safe-pb">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/10 blur-3xl animate-float delay-500" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" aria-label="Back to home">
            <Button variant="outline" className="font-body min-h-[44px]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl font-display">YouTube to Text Test</CardTitle>
            <CardDescription className="font-body">
              Paste a YouTube URL and get the transcript back from the backend.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 px-4 sm:px-6 pb-6">
            <div className="space-y-2">
              <Label htmlFor="youtube-url" className="font-body">
                YouTube URL
              </Label>
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                disabled={isLoading}
                className="text-base min-h-[48px]"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                onClick={handleTranscribe}
                disabled={isLoading}
                className="gradient-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity min-h-[48px] sm:min-h-10 flex-1 sm:flex-initial"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Transcribing...
                  </span>
                ) : (
                  "Transcribe"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="font-body min-h-[48px] sm:min-h-10"
                disabled={isLoading || (!youtubeUrl.trim() && !transcript && !videoTitle)}
                onClick={() => {
                  setYoutubeUrl("");
                  setVideoTitle("");
                  setTranscript("");
                  setError("");
                }}
              >
                Clear
              </Button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive font-body">
                {error}
              </div>
            )}

            {videoTitle && (
              <div className="space-y-1">
                <Label className="font-body text-sm">Video title</Label>
                <div className="p-3 rounded-lg bg-background border border-border text-sm font-body">
                  {videoTitle}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="font-body text-sm">Transcript</Label>
              <Textarea
                value={transcript}
                readOnly
                placeholder="Transcript will appear here..."
                className="min-h-[200px] sm:min-h-[240px] text-base"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

