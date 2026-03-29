import { useState } from "react";
import NavigationRail from "./NavigationRail";
import ManuscriptPane from "./ManuscriptPane";
import InspectorPane from "./InspectorPane";
import { ArrowLeft } from "lucide-react";
import type { RiskFlag } from "./RiskCard";
import type { AnalysisMetrics } from "@/lib/analyzeText";

interface AnalysisViewProps {
  paragraphs: string[];
  flags: RiskFlag[];
  verdict: string;
  metrics: AnalysisMetrics;
  onBack: () => void;
}

const AnalysisView = ({ paragraphs, flags, verdict, metrics, onBack }: AnalysisViewProps) => {
  const [activeSection, setActiveSection] = useState("abstract");
  const [hoveredFlagId, setHoveredFlagId] = useState<string | null>(null);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <NavigationRail activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-foreground">
                Forensic Manuscript Analysis
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {metrics.totalWords.toLocaleString()} words · {metrics.totalSentences} sentences · {metrics.totalParagraphs} paragraphs · {flags.length} evidence points
              </p>
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
            Aura v2.0
          </div>
        </header>

        {/* Split Pane */}
        <div className="flex flex-1 overflow-hidden">
          <ManuscriptPane
            paragraphs={paragraphs}
            flags={flags}
            hoveredFlagId={hoveredFlagId}
          />
          <InspectorPane
            flags={flags}
            hoveredFlagId={hoveredFlagId}
            onHoverFlag={setHoveredFlagId}
            verdict={verdict}
            metrics={metrics}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
