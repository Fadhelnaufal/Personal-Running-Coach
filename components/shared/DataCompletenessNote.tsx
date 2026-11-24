import { Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DataCompletenessNoteProps {
  title: string;
  message: string;
  className?: string;
}

export function DataCompletenessNote({ title, message, className }: DataCompletenessNoteProps) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-xl border border-[#fde68a] bg-[var(--status-warning-bg)] px-4 py-3 text-sm text-[var(--status-warning)]",
        className
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold">{title}</span>
        <span className="text-xs leading-relaxed text-[#78350f]">{message}</span>
      </div>
    </div>
  );
}
