import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Send, Loader2, Check, ExternalLink, Mail, Linkedin, Twitter, Phone, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOutreaches } from "@/hooks/use-outreaches";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { format } from "date-fns";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { PaginationControls } from "@/components/common/PaginationControls";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/outreach")({
  validateSearch: (s: Record<string, unknown>) => ({ 
    page: Number(s.page ?? 0)
  }),
  component: OutreachPage,
});

function getTypeStyles(type: string) {
  switch (type.toLowerCase()) {
    case "cold": return "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20";
    case "warm": return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
    case "follow-up": return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
    case "reply": return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    default: return "bg-muted text-muted-foreground border-border";
  }
}

function getPlatformDetails(platform: string) {
  switch (platform.toLowerCase()) {
    case "email": return { icon: Mail, styles: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20" };
    case "linkedin": return { icon: Linkedin, styles: "bg-blue-600/10 text-blue-700 dark:text-blue-400 border-blue-600/20" };
    case "twitter": return { icon: Twitter, styles: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20" };
    case "phone": return { icon: Phone, styles: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" };
    default: return { icon: MessageSquare, styles: "bg-muted text-muted-foreground border-border" };
  }
}

function OutreachPage() {
  const { page } = Route.useSearch();
  const navigate = useNavigate();

  const { data, isLoading } = useOutreaches({
    page,
    size: 10
  });
  const outreaches = data?.content ?? [];

  const openContact = (contactId: string) => navigate({ to: "/contacts/$id", params: { id: contactId } });

  if (isLoading && outreaches.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-6 animate-in fade-in duration-500">
        <PageHeader title="Outreach Logs" description="A history of all your outreach activities." />
        <TableSkeleton columns={5} rows={10} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <PageHeader
        title="Outreach Logs"
        description="A history of all your outreach activities."
      />

      {isLoading ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-border bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : outreaches.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No outreach logged"
          description="You haven't logged any outreach activities yet."
        />
      ) : (
        <Card className="overflow-hidden p-0 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-50/30 dark:bg-emerald-900/10 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10">
                <TableHead className="font-semibold text-emerald-900 dark:text-emerald-100">Contact</TableHead>
                <TableHead className="font-semibold text-emerald-900 dark:text-emerald-100">Type</TableHead>
                <TableHead className="font-semibold text-emerald-900 dark:text-emerald-100">Platform</TableHead>
                <TableHead className="font-semibold text-emerald-900 dark:text-emerald-100">Date</TableHead>
                <TableHead className="font-semibold text-emerald-900 dark:text-emerald-100">Follow-up</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {outreaches.map((o: any) => {
                const PlatformIcon = getPlatformDetails(o.platform).icon;
                return (
                  <TableRow key={o.id} className="cursor-pointer group transition-colors hover:bg-muted/50" onClick={() => openContact(o.contactId)}>
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          {o.contactName.charAt(0).toUpperCase()}
                        </div>
                        {o.contactName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold capitalize", getTypeStyles(o.type))}>
                        {o.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold", getPlatformDetails(o.platform).styles)}>
                        <PlatformIcon className="h-3 w-3" />
                        {o.platform}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(o.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {o.nextFollowupDate ? (
                        <div className="flex items-center gap-1.5">
                          {o.followupCompleted ? (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                              <Check className="h-3.5 w-3.5" />
                            </div>
                          ) : (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20">
                              <span className="h-2 w-2 rounded-full bg-amber-500" />
                            </div>
                          )}
                          <span className={cn("text-sm font-medium", o.followupCompleted ? "text-muted-foreground line-through" : "text-amber-700 dark:text-amber-400")}>
                            {format(new Date(o.nextFollowupDate), "MMM d")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {o.referenceUrl && (
                        <a 
                          href={o.referenceUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-emerald-100 text-muted-foreground hover:text-emerald-700 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-300 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          <div className="border-t border-border p-4 bg-muted/10">
            <PaginationControls
              currentPage={data?.page ?? 0}
              totalPages={data?.totalPages ?? 0}
              onPageChange={(p) => navigate({ to: "/outreach", search: { page: p } })}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
