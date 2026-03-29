import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export type RiskLevel = "high" | "medium" | "low";

export interface RiskFlag {
  id: string;
  level: RiskLevel;
  text: string;
  explanation: string;
  suggestion?: string;
  paragraphIndex: number;
  sourceUrl?: string; // Appended for External Database Comparison
  similarity?: number; // Appended for Paraphrase Detection
}

interface RiskCardProps {
  flag: RiskFlag;
  onHover: (id: string | null) => void;
  isHovered: boolean;
}

const riskConfig = {
  high: {
    label: "High Risk",
    dotClass: "bg-risk-high",
    bgClass: "risk-bg-high",
    borderAccent: "border-l-risk-high",
  },
  medium: {
    label: "Medium Risk",
    dotClass: "bg-risk-medium",
    bgClass: "risk-bg-medium",
    borderAccent: "border-l-risk-medium",
  },
  low: {
    label: "Low Risk",
    dotClass: "bg-risk-low",
    bgClass: "risk-bg-low",
    borderAccent: "border-l-risk-low",
  },
};

const RiskCard = ({ flag, onHover, isHovered }: RiskCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const config = riskConfig[flag.level];

  return (
    <div
      className={cn(
        "surface-card surface-card-hover border-l-2 p-4 cursor-pointer animate-fade-in",
        config.borderAccent,
        isHovered && config.bgClass
      )}
      onMouseEnter={() => onHover(flag.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn("w-2 h-2 rounded-full shrink-0", config.dotClass)} />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {config.label}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={cn(
            "text-muted-foreground shrink-0 transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </div>

      <blockquote className="mt-3 text-sm font-manuscript leading-relaxed text-foreground/90 border-l-0 pl-0 italic">
        "{flag.text}"
      </blockquote>

      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
        {flag.explanation}
      </p>

      {(flag.sourceUrl || flag.similarity) && (
        <div className="mt-3 flex flex-col gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
              Exact Source Match Found
            </span>
            {flag.similarity && (
              <span className="inline-flex items-center text-xs font-bold px-2 py-1 rounded bg-red-500 text-white shadow-sm">
                {flag.similarity}% Match
              </span>
            )}
          </div>
          {flag.sourceUrl && (
            <a
              href={flag.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-blue-600 hover:text-blue-800 hover:underline break-all"
              onClick={(e) => e.stopPropagation()}
            >
              Source: {flag.sourceUrl}
            </a>
          )}
        </div>
      )}

      {expanded && flag.suggestion && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
            Rewrite Suggestion
          </p>
          <div className="text-sm font-manuscript leading-relaxed">
            <span className="line-through text-risk-high/60 mr-1">{flag.text.slice(0, 40)}…</span>
            <span className="text-risk-low">{flag.suggestion}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskCard;
