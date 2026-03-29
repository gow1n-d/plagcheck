import { cn } from "@/lib/utils";
import type { RiskFlag } from "./RiskCard";
import { useMemo } from "react";

interface ManuscriptPaneProps {
  paragraphs: string[];
  flags: RiskFlag[];
  hoveredFlagId: string | null;
}

const riskUnderlineClass = {
  high: "risk-underline-high",
  medium: "risk-underline-medium",
  low: "risk-underline-low",
};

const riskBgClass = {
  high: "risk-bg-high",
  medium: "risk-bg-medium",
  low: "risk-bg-low",
};

/** Split paragraph text into segments, marking which are flagged */
function splitIntoSegments(
  paragraph: string,
  flagsForPara: RiskFlag[],
  hoveredFlagId: string | null
): { text: string; flag: RiskFlag | null; isHovered: boolean }[] {
  if (!flagsForPara.length) {
    return [{ text: paragraph, flag: null, isHovered: false }];
  }

  // Build list of match ranges
  const ranges: { start: number; end: number; flag: RiskFlag }[] = [];

  for (const flag of flagsForPara) {
    // Clean the flag text for matching (remove quotes and ellipsis markers)
    let searchText = flag.text;
    // Remove wrapping quotes
    if (searchText.startsWith('"') && searchText.endsWith('"')) {
      searchText = searchText.slice(1, -1);
    }
    // Remove trailing ellipsis added by truncation
    searchText = searchText.replace(/…$/, "");

    if (searchText.length < 10) continue;

    // Try to find in paragraph
    const idx = paragraph.indexOf(searchText);
    if (idx !== -1) {
      ranges.push({ start: idx, end: idx + searchText.length, flag });
    } else {
      // Try first 60 chars as fuzzy match
      const shortSearch = searchText.slice(0, 60);
      const shortIdx = paragraph.indexOf(shortSearch);
      if (shortIdx !== -1) {
        // Find sentence boundary
        const sentEnd = paragraph.indexOf(".", shortIdx + shortSearch.length);
        const end = sentEnd !== -1 ? sentEnd + 1 : shortIdx + shortSearch.length;
        ranges.push({ start: shortIdx, end, flag });
      }
    }
  }

  if (!ranges.length) {
    return [{ text: paragraph, flag: null, isHovered: false }];
  }

  // Sort by start position
  ranges.sort((a, b) => a.start - b.start);

  // Build segments
  const segments: { text: string; flag: RiskFlag | null; isHovered: boolean }[] = [];
  let cursor = 0;

  for (const range of ranges) {
    if (range.start > cursor) {
      segments.push({ text: paragraph.slice(cursor, range.start), flag: null, isHovered: false });
    }
    if (range.start >= cursor) {
      segments.push({
        text: paragraph.slice(range.start, range.end),
        flag: range.flag,
        isHovered: hoveredFlagId === range.flag.id,
      });
      cursor = range.end;
    }
  }

  if (cursor < paragraph.length) {
    segments.push({ text: paragraph.slice(cursor), flag: null, isHovered: false });
  }

  return segments;
}

const ManuscriptPane = ({ paragraphs, flags, hoveredFlagId }: ManuscriptPaneProps) => {
  const flagsByParagraph = useMemo(() => {
    const map: Record<number, RiskFlag[]> = {};
    for (const flag of flags) {
      if (!map[flag.paragraphIndex]) map[flag.paragraphIndex] = [];
      map[flag.paragraphIndex].push(flag);
    }
    return map;
  }, [flags]);

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12">
      <div className="manuscript-text mx-auto">
        {paragraphs.map((paragraph, idx) => {
          const paraFlags = flagsByParagraph[idx] || [];
          const segments = splitIntoSegments(paragraph, paraFlags, hoveredFlagId);

          return (
            <p key={idx} className="mb-6 text-foreground/90 transition-all duration-200">
              {segments.map((seg, sIdx) => {
                if (!seg.flag) {
                  return <span key={sIdx}>{seg.text}</span>;
                }

                return (
                  <span
                    key={sIdx}
                    className={cn(
                      "transition-all duration-200 rounded-sm",
                      riskUnderlineClass[seg.flag.level],
                      seg.isHovered && riskBgClass[seg.flag.level],
                      seg.isHovered && "px-0.5 py-0.5"
                    )}
                    title={`${seg.flag.level.toUpperCase()} RISK: ${seg.flag.explanation.slice(0, 100)}…`}
                  >
                    {seg.text}
                  </span>
                );
              })}
            </p>
          );
        })}
      </div>
    </div>
  );
};

export default ManuscriptPane;
