import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Building2, Pencil, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCompanies, useDeleteCompany } from "@/hooks/use-companies";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { EmptyState } from "@/components/common/EmptyState";
import { CompanyFormDialog } from "@/components/forms/CompanyFormDialog";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import type { CompanyResponse } from "@/lib/api";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { PaginationControls } from "@/components/common/PaginationControls";

export const Route = createFileRoute("/companies/")({
  validateSearch: (s: Record<string, unknown>) => ({ 
    q: typeof s.q === "string" ? s.q : "",
    page: Number(s.page ?? 0)
  }),
  component: CompaniesPage,
});

function CompaniesPage() {
  const { q, page } = Route.useSearch();
  const navigate = useNavigate();
  const [query, setQuery] = useState(q ?? "");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CompanyResponse | null>(null);
  const [deleting, setDeleting] = useState<CompanyResponse | null>(null);

  const { data, isLoading } = useCompanies({ search: query, page, size: 10 });
  const filtered = data?.content ?? [];
  const deleteMutation = useDeleteCompany();

  const updateQuery = (v: string) => {
    setQuery(v);
    navigate({ to: "/companies", search: { q: v }, replace: true });
  };

  const openRow = (id: string) => navigate({ to: "/companies/$id", params: { id } });

  if (isLoading && filtered.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-6 animate-in fade-in duration-500">
        <PageHeader title="Companies" description="Organizations you're tracking in your outreach." />
        <TableSkeleton columns={6} rows={10} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <PageHeader
        title="Companies"
        description="Organizations you're tracking in your outreach."
        actions={
          <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" /> Add company
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <SearchInput value={query} onChange={updateQuery} placeholder="Search companies..." className="max-w-xs" />
        <span className="text-xs text-muted-foreground">{data?.totalElements ?? 0} total</span>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-border bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description="Add your first company to start tracking your network."
          action={
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="mr-1.5 h-4 w-4" /> Add company
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-sky-50/30 dark:bg-sky-900/10 hover:bg-sky-50/30 dark:hover:bg-sky-900/10">
                <TableHead className="font-semibold text-sky-900 dark:text-sky-100">Company</TableHead>
                <TableHead className="font-semibold text-sky-900 dark:text-sky-100">Website</TableHead>
                <TableHead className="font-semibold text-sky-900 dark:text-sky-100">LinkedIn</TableHead>
                <TableHead className="font-semibold text-sky-900 dark:text-sky-100">Size</TableHead>
                <TableHead className="text-right font-semibold text-sky-900 dark:text-sky-100">Contacts</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                return (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer group transition-colors hover:bg-muted/50"
                    onClick={() => openRow(c.id)}
                  >
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        {c.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {c.website ? (
                        <a
                          href={c.website}
                          onClick={(e) => e.stopPropagation()}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-sky-600 dark:hover:text-sky-400"
                        >
                          {c.website.replace(/^https?:\/\//, "")}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {c.linkedin ? (
                        <a
                          href={c.linkedin}
                          onClick={(e) => e.stopPropagation()}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-muted-foreground hover:text-sky-600 dark:hover:text-sky-400"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell><span className="text-sm text-muted-foreground capitalize">{c.size}</span></TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">{c.contactCount}</span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setFormOpen(true); }} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleting(c)} aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <PaginationControls
            page={page}
            totalPages={data?.totalPages ?? 0}
            onPageChange={(p) => navigate({ search: (prev: any) => ({ ...prev, page: p }), replace: true })}
          />
        </Card>
      )}

      <CompanyFormDialog open={formOpen} onOpenChange={setFormOpen} company={editing} />
      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name}?`}
        description="Contacts linked to this company will remain but be unassigned."
        onConfirm={() => {
          if (deleting) {
            deleteMutation.mutate(deleting.id, {
              onSuccess: () => {
                toast.success("Company deleted");
                setDeleting(null);
              }
            });
          }
        }}
      />
      <Link to="/companies" className="hidden" />
    </div>
  );
}
