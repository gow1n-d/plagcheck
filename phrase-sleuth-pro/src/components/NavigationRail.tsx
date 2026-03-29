import { FileText, AlignLeft, Beaker, BookOpen, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationRailProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sections = [
  { id: "abstract", icon: FileText, label: "Abstract" },
  { id: "introduction", icon: AlignLeft, label: "Introduction" },
  { id: "methodology", icon: Beaker, label: "Methodology" },
  { id: "results", icon: BarChart3, label: "Results" },
  { id: "references", icon: BookOpen, label: "References" },
];

const NavigationRail = ({ activeSection, onSectionChange }: NavigationRailProps) => {
  return (
    <nav className="flex flex-col items-center w-16 bg-surface py-6 gap-1" style={{ boxShadow: "var(--surface-shadow)" }}>
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary mb-6">
        <span className="text-primary-foreground font-ui font-bold text-sm">A</span>
      </div>

      <div className="flex flex-col gap-1 flex-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              title={section.label}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-150",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon size={18} strokeWidth={1.5} />
            </button>
          );
        })}
      </div>

      <button
        title="Settings"
        className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150"
      >
        <Settings size={18} strokeWidth={1.5} />
      </button>
    </nav>
  );
};

export default NavigationRail;
