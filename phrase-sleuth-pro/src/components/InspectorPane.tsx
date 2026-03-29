import RiskCard, { type RiskFlag, type RiskLevel } from "./RiskCard";
import { Shield, AlertTriangle, CheckCircle, BarChart3, BookOpen, Type, Gauge, Download } from "lucide-react";
import type { AnalysisMetrics } from "@/lib/analyzeText";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { exportReportAsHtml } from "@/lib/exportReport";

interface InspectorPaneProps {
  flags: RiskFlag[];
  hoveredFlagId: string | null;
  onHoverFlag: (id: string | null) => void;
  verdict: string;
  metrics: AnalysisMetrics;
}

const MetricCell = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <div className="surface-card p-3">
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
    <p className="text-base font-semibold font-mono text-foreground mt-1">{value}</p>
    {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

const InspectorPane = ({ flags, hoveredFlagId, onHoverFlag, verdict, metrics }: InspectorPaneProps) => {
  const highCount = flags.filter((f) => f.level === "high").length;
  const medCount = flags.filter((f) => f.level === "medium").length;
  const lowCount = flags.filter((f) => f.level === "low").length;

  const groupedFlags: Record<RiskLevel, RiskFlag[]> = {
    high: flags.filter((f) => f.level === "high"),
    medium: flags.filter((f) => f.level === "medium"),
    low: flags.filter((f) => f.level === "low"),
  };

  const consistencyColor = metrics.consistencyScore >= 75
    ? "text-risk-low"
    : metrics.consistencyScore >= 50
      ? "text-risk-medium"
      : "text-risk-high";

  return (
    <aside className="w-full lg:w-[420px] xl:w-[480px] bg-inspector overflow-y-auto flex flex-col">
      {/* Risk Counts */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-2">
            <BarChart3 size={12} />
            Diagnostic Summary
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-7"
            onClick={() => exportReportAsHtml(flags, verdict, metrics)}
          >
            <Download size={12} />
            Export
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="surface-card p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <AlertTriangle size={14} className="text-risk-high" />
            </div>
            <p className="text-lg font-semibold font-mono text-foreground">{highCount}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">High</p>
          </div>
          <div className="surface-card p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Shield size={14} className="text-risk-medium" />
            </div>
            <p className="text-lg font-semibold font-mono text-foreground">{medCount}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Medium</p>
          </div>
          <div className="surface-card p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle size={14} className="text-risk-low" />
            </div>
            <p className="text-lg font-semibold font-mono text-foreground">{lowCount}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Low</p>
          </div>
        </div>

        <div className="mt-4 surface-card p-3 flex flex-col items-center justify-center border-2 border-primary/20 bg-primary/5">
          <p className="text-[10px] uppercase tracking-wider text-primary font-bold mb-1">
            Overall Similarity
          </p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-black font-mono text-primary">{metrics.similarityScore}%</p>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 text-center font-medium">
            Matches external databases & paraphrasing algorithms
          </p>
        </div>

        <div className="mt-4 surface-card p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
            Verdict
          </p>
          <p className="text-sm text-foreground font-medium leading-relaxed">{verdict}</p>
        </div>
      </div>

      {/* Forensic Metrics */}
      <div className="p-5 border-b border-border">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4 flex items-center gap-2">
          <Gauge size={12} />
          Forensic Metrics
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <MetricCell
            label="Consistency"
            value={`${metrics.consistencyScore}/100`}
            sub={metrics.consistencyScore >= 75 ? "Consistent" : metrics.consistencyScore >= 50 ? "Some variance" : "Inconsistent"}
          />
          <MetricCell
            label="Readability"
            value={`Grade ${metrics.overallReadability.fleschKincaid}`}
            sub={`${metrics.overallReadability.avgSentenceLength} words/sent`}
          />
          <MetricCell
            label="Vocab Richness"
            value={metrics.vocabMetrics.typeTokenRatio}
            sub={`${metrics.vocabMetrics.hapaxLegomena} unique-once words`}
          />
          <MetricCell
            label="Vocab Density"
            value={metrics.vocabMetrics.vocabularyDensity}
            sub={`Hapax ratio: ${metrics.vocabMetrics.hapaxRatio}`}
          />
        </div>
        
        {/* Advanced Turnitin-like Metrics */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <MetricCell
            label="AI Probability"
            value={metrics.aiMetrics.isAiGenerated ? "High Risk" : "Low Risk"}
            sub={`Perplexity: ${metrics.aiMetrics.perplexity}`}
          />
          <MetricCell
            label="AI Burstiness"
            value={metrics.aiMetrics.burstiness}
            sub="Sentence length variance"
          />
          <MetricCell
            label="Translation Risk"
            value={`${metrics.crossLanguageRisk}%`}
            sub="Cross-language pattern match"
          />
          <MetricCell
            label="Author Voice"
            value={`${metrics.authorVoiceMatch}%`}
            sub="Match with past submissions"
          />
        </div>

        {/* Citation Gap Bar */}
        <div className="mt-3 surface-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={12} className="text-muted-foreground" />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Citation Coverage
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  metrics.citationGaps.ratio >= 0.7 ? "bg-risk-low" : metrics.citationGaps.ratio >= 0.4 ? "bg-risk-medium" : "bg-risk-high"
                )}
                style={{ width: `${Math.round(metrics.citationGaps.ratio * 100)}%` }}
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {metrics.citationGaps.cited}/{metrics.citationGaps.cited + metrics.citationGaps.uncited}
            </span>
          </div>
          {metrics.citationGaps.uncited > 0 && (
            <p className="text-[10px] text-risk-high mt-1.5">
              {metrics.citationGaps.uncited} factual claim{metrics.citationGaps.uncited !== 1 ? "s" : ""} without citation
            </p>
          )}
        </div>

        {/* Consistency Visual */}
        <div className="mt-2 surface-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <Type size={12} className="text-muted-foreground" />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Writing Consistency
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", consistencyColor === "text-risk-low" ? "bg-risk-low" : consistencyColor === "text-risk-medium" ? "bg-risk-medium" : "bg-risk-high")}
                style={{ width: `${metrics.consistencyScore}%` }}
              />
            </div>
            <span className={cn("text-xs font-mono font-semibold", consistencyColor)}>
              {metrics.consistencyScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Evidence Points */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Evidence Points ({flags.length})
        </h3>

        {(["high", "medium", "low"] as RiskLevel[]).map((level) =>
          groupedFlags[level].length > 0 ? (
            <div key={level} className="flex flex-col gap-2">
              {groupedFlags[level].map((flag) => (
                <RiskCard
                  key={flag.id}
                  flag={flag}
                  onHover={onHoverFlag}
                  isHovered={hoveredFlagId === flag.id}
                />
              ))}
            </div>
          ) : null
        )}
      </div>
    </aside>
  );
};

export default InspectorPane;
