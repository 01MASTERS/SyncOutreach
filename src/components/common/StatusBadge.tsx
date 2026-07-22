import { cn } from "@/lib/utils";
import type { ContactStatus } from "@/lib/types";

const LABELS: Record<ContactStatus, string> = {
  new: "New",
  contacted: "Contacted",
  in_conversation: "In Conversation",
  waiting: "Waiting",
  closed: "Closed",
};

const STYLES: Record<ContactStatus, string> = {
  new: "bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-sky-500/20",
  contacted: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20",
  in_conversation: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
  waiting: "bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-violet-500/20",
  closed: "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20",
};

export function StatusBadge({ status, className }: { status: ContactStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap shrink-0 gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STYLES[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {LABELS[status]}
    </span>
  );
}

export const STATUS_LABELS = LABELS;
