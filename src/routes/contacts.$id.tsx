import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Mail, Linkedin, Twitter, Pencil, Trash2, MessageSquare, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContact, useDeleteContact } from "@/hooks/use-contacts";
import { useTags } from "@/hooks/use-tags";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TagChip } from "@/components/common/TagChip";
import { EmptyState } from "@/components/common/EmptyState";
import { ContactFormDialog } from "@/components/forms/ContactFormDialog";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { toast } from "sonner";
import { useOutreachesByContact, useDeleteOutreach } from "@/hooks/use-outreaches";
import { OutreachFormDialog } from "@/components/forms/OutreachFormDialog";
import { Plus, Calendar, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/contacts/$id")({
  component: ContactProfile,
});

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="mt-0.5 truncate text-sm text-foreground">{value}</div>
      </div>
    </div>
  );
}

function ContactProfile() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: contact, isLoading } = useContact(id);
  const { data: tags = [] } = useTags();
  const deleteMutation = useDeleteContact();
  const { data: outreaches = [], isLoading: isLoadingOutreaches } = useOutreachesByContact(id);
  const deleteOutreachMutation = useDeleteOutreach();

  const [outreachFormOpen, setOutreachFormOpen] = useState(false);
  const [outreachToEdit, setOutreachToEdit] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={User}
          title="Contact not found"
          description="This contact may have been deleted."
          action={
            <Button asChild variant="outline">
              <Link to="/contacts"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to contacts</Link>
            </Button>
          }
        />
      </div>
    );
  }
  const initials = contact.name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <Link to="/contacts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Contacts
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-base font-semibold text-foreground">
            {initials || "?"}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{contact.name}</h1>
              <StatusBadge status={contact.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {contact.role}
              {contact.companyId && contact.companyName && (
                <>
                  {" · "}
                  <Link to="/companies/$id" params={{ id: contact.companyId }} className="hover:text-foreground">
                    {contact.companyName}
                  </Link>
                </>
              )}
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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-sm">Details</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border py-0">
            <InfoRow
              icon={Mail}
              label="Email"
              value={contact.email ? <a href={`mailto:${contact.email}`} className="hover:text-foreground">{contact.email}</a> : <span className="text-muted-foreground">—</span>}
            />
            <InfoRow
              icon={Linkedin}
              label="LinkedIn"
              value={contact.linkedin ? <a href={contact.linkedin} target="_blank" rel="noreferrer" className="hover:text-foreground">View profile</a> : <span className="text-muted-foreground">—</span>}
            />
            <InfoRow
              icon={Twitter}
              label="Twitter"
              value={contact.twitter ? <a href={contact.twitter} target="_blank" rel="noreferrer" className="hover:text-foreground">View profile</a> : <span className="text-muted-foreground">—</span>}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-sm">Tags</CardTitle></CardHeader>
            <CardContent>
              {contact.tagIds.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tags yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {contact.tagIds.map((tid) => {
                    const t = tags.find((x) => x.id === tid);
                    return t ? <TagChip key={tid} label={t.name} /> : null;
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b px-6 py-4">
              <CardTitle className="text-sm">Communication timeline</CardTitle>
              <Button size="sm" onClick={() => { setOutreachToEdit(null); setOutreachFormOpen(true); }}>
                <Plus className="mr-1.5 h-4 w-4" /> Add Activity
              </Button>
            </div>
            <CardContent className="pt-6">
              {isLoadingOutreaches ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : outreaches.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No activity yet"
                  description="Log emails, calls, and meetings here."
                  className="border-none bg-transparent py-8"
                />
              ) : (
                <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {outreaches.map((outreach) => {
                    const isEmail = outreach.platform === "Email";
                    const isLinkedIn = outreach.platform === "LinkedIn";
                    const isTwitter = outreach.platform === "Twitter";
                    return (
                      <div key={outreach.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          {isEmail ? <Mail className="h-4 w-4 text-blue-500" /> : isLinkedIn ? <Linkedin className="h-4 w-4 text-sky-600" /> : isTwitter ? <Twitter className="h-4 w-4 text-blue-400" /> : <MessageSquare className="h-4 w-4 text-slate-500" />}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col gap-2 relative">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{outreach.type}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                {new Date(outreach.date).toLocaleDateString()}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => { setOutreachToEdit(outreach); setOutreachFormOpen(true); }}>Edit</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => {
                                    if(confirm("Delete this activity?")) {
                                      deleteOutreachMutation.mutate({ id: outreach.id, contactId: contact.id }, {
                                        onSuccess: () => toast.success("Activity deleted")
                                      });
                                    }
                                  }}>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          {outreach.referenceUrl && (
                            <a href={outreach.referenceUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline line-clamp-1">
                              {outreach.referenceUrl}
                            </a>
                          )}
                          {outreach.nextFollowupDate && (
                            <div className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-1 rounded-md mt-1 self-start">
                              Follow-up: {new Date(outreach.nextFollowupDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ContactFormDialog open={editOpen} onOpenChange={setEditOpen} contact={contact} />
      <OutreachFormDialog open={outreachFormOpen} onOpenChange={setOutreachFormOpen} contactId={contact.id} outreach={outreachToEdit} />
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${contact.name}?`}
        onConfirm={() => {
          deleteMutation.mutate(contact.id, {
            onSuccess: () => {
              toast.success("Contact deleted");
              navigate({ to: "/contacts" });
            }
          });
        }}
      />
    </div>
  );
}
