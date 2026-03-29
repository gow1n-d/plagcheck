import { useState } from "react";
import InputView from "@/components/InputView";
import AnalysisView from "@/components/AnalysisView";
import { analyzeText, type AnalysisMetrics } from "@/lib/analyzeText";
import type { RiskFlag } from "@/components/RiskCard";

interface AnalysisResult {
  paragraphs: string[];
  flags: RiskFlag[];
  verdict: string;
  metrics: AnalysisMetrics;
}

const Index = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (text: string) => {
    setLoading(true);
    try {
      const analysis = await analyzeText(text);
      setResult(analysis);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze text. Ensure the backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium tracking-wider uppercase text-muted-foreground animate-pulse">Running Nvidia AI Analysis & Scrapy Web Mining...</p>
      </div>
    );
  }

  if (result) {
    return (
      <AnalysisView
        paragraphs={result.paragraphs}
        flags={result.flags}
        verdict={result.verdict}
        metrics={result.metrics}
        onBack={() => setResult(null)}
      />
    );
  }

  return <InputView onSubmit={handleSubmit} />;
};

export default Index;
