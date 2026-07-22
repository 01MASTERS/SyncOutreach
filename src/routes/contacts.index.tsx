import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2, Users, Loader2 } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContacts, useDeleteContact } from "@/hooks/use-contacts";
import { useTags } from "@/hooks/use-tags";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge, STATUS_LABELS } from "@/components/common/StatusBadge";
import { TagChip } from "@/components/common/TagChip";
import { ContactFormDialog } from "@/components/forms/ContactFormDialog";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { CONTACT_STATUSES, type ContactStatus } from "@/lib/types";
import type { ContactResponse } from "@/lib/api";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { PaginationControls } from "@/components/common/PaginationControls";

export const Route = createFileRoute("/contacts/")({
  validateSearch: (s: Record<string, unknown>) => ({ 
    q: typeof s.q === "string" ? s.q : "",
    page: Number(s.page ?? 0)
  }),
  component: ContactsPage,
});

function ContactsPage() {
  const { q, page } = Route.useSearch();
  const navigate = useNavigate();
  const [query, setQuery] = useState(q ?? "");
  const [status, setStatus] = useState<ContactStatus | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ContactResponse | null>(null);
  const [deleting, setDeleting] = useState<ContactResponse | null>(null);

  const { data: contactsData, isLoading } = useContacts({
    search: query,
    status: status === "all" ? undefined : status,
    page: page,
    size: 10
  });
  const filtered = contactsData?.content ?? [];
  const { data: tags = [] } = useTags();
  const deleteMutation = useDeleteContact();

  const updateQuery = (v: string) => {
    setQuery(v);
    navigate({ to: "/contacts", search: { q: v }, replace: true });
  };

  const openRow = (id: string) => navigate({ to: "/contacts/$id", params: { id } });

  if (isLoading && filtered.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-6 animate-in fade-in duration-500">
        <PageHeader title="Contacts" description="People in your professional network." />
        <TableSkeleton columns={6} rows={10} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <PageHeader
        title="Contacts"
        description="People in your professional network and outreach pipeline."
        actions={
          <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" /> Add contact
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={query}
          onChange={updateQuery}
          placeholder="Search name, role, company..."
          className="max-w-xs flex-1"
        />
        <Select value={status} onValueChange={(v) => setStatus(v as ContactStatus | "all")}>
          <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {CONTACT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{contactsData?.totalElements ?? 0} total</span>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-border bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No contacts found"
          description="Try a different search, or add a new contact."
          action={
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="mr-1.5 h-4 w-4" /> Add contact
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-indigo-50/30 dark:bg-indigo-900/10 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10">
                <TableHead className="font-semibold text-indigo-900 dark:text-indigo-100">Name</TableHead>
                <TableHead className="font-semibold text-indigo-900 dark:text-indigo-100">Company</TableHead>
                <TableHead className="font-semibold text-indigo-900 dark:text-indigo-100">Role</TableHead>
                <TableHead className="font-semibold text-indigo-900 dark:text-indigo-100">Status</TableHead>
                <TableHead className="font-semibold text-indigo-900 dark:text-indigo-100">Tags</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                return (
                  <TableRow key={c.id} className="cursor-pointer group transition-colors hover:bg-muted/50" onClick={() => openRow(c.id)}>
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        {c.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.companyName ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.role}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {c.tagIds.slice(0, 3).map((tid) => {
                          const t = tags.find((x) => x.id === tid);
                          return t ? <TagChip key={tid} label={t.name} /> : null;
                        })}
                        {c.tagIds.length > 3 && (
                          <span className="text-xs font-medium text-indigo-600/70 dark:text-indigo-400/70">+{c.tagIds.length - 3}</span>
                        )}
                      </div>
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
            totalPages={contactsData?.totalPages ?? 0}
            onPageChange={(p) => navigate({ search: (prev: any) => ({ ...prev, page: p }), replace: true })}
          />
        </Card>
      )}

      <ContactFormDialog open={formOpen} onOpenChange={setFormOpen} contact={editing} />
      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name}?`}
        onConfirm={() => {
          if (deleting) {
            deleteMutation.mutate(deleting.id, {
              onSuccess: () => {
                toast.success("Contact deleted");
                setDeleting(null);
              }
            });
          }
        }}
      />
    </div>
  );
}
