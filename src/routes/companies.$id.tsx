import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Building2, ExternalLink, Pencil, Plus, Trash2, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompany, useDeleteCompany } from "@/hooks/use-companies";
import { useContactsByCompany } from "@/hooks/use-contacts";
import { CompanyFormDialog } from "@/components/forms/CompanyFormDialog";
import { ContactFormDialog } from "@/components/forms/ContactFormDialog";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/companies/$id")({
  component: CompanyDetail,
});

function CompanyDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: company, isLoading } = useCompany(id);
  const { data: contactsData } = useContactsByCompany(id);
  const contacts = contactsData ?? [];
  const deleteMutation = useDeleteCompany();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={Building2}
          title="Company not found"
          description="This company may have been deleted."
          action={
            <Button asChild variant="outline">
              <Link to="/companies"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to companies</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <Link to="/companies" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Companies
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {company.size} employees · Added {format(new Date(company.createdAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-1.5 h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-1.5 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Website</CardTitle></CardHeader>
          <CardContent>
            {company.website ? (
              <a href={company.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium hover:text-foreground">
                {company.website.replace(/^https?:\/\//, "")}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : <p className="text-sm text-muted-foreground">—</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">LinkedIn</CardTitle></CardHeader>
          <CardContent>
            {company.linkedin ? (
              <a href={company.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium hover:text-foreground">
                {company.linkedin.replace(/^https?:\/\//, "")}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : <p className="text-sm text-muted-foreground">—</p>}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between pt-2">
        <h2 className="text-lg font-semibold">Contacts</h2>
        <Button size="sm" onClick={() => setContactOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Add contact
        </Button>
      </div>

      {contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No contacts yet"
          description={`Add people you know at ${company.name}.`}
          action={
            <Button onClick={() => setContactOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Add contact
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-border">
            {contacts.map((c) => (
              <li key={c.id}>
                <Link
                  to="/contacts/$id"
                  params={{ id: c.id }}
                  className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.role}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <CompanyFormDialog open={editOpen} onOpenChange={setEditOpen} company={company} />
      <ContactFormDialog open={contactOpen} onOpenChange={setContactOpen} defaultCompanyId={company.id} />
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${company.name}?`}
        description="Contacts linked to this company will remain but be unassigned."
        onConfirm={() => {
          deleteMutation.mutate(company.id, {
            onSuccess: () => {
              toast.success("Company deleted");
              navigate({ to: "/companies" });
            }
          });
        }}
      />
    </div>
  );
}
