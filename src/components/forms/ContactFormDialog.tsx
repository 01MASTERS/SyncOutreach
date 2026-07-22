import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CONTACT_STATUSES, type ContactStatus } from "@/lib/types";
import { useCreateContact, useUpdateContact } from "@/hooks/use-contacts";
import { useCompanies } from "@/hooks/use-companies";
import { useTags, useCreateTag } from "@/hooks/use-tags";
import type { ContactResponse } from "@/lib/api";
import { toast } from "sonner";
import { TagChip } from "@/components/common/TagChip";
import { STATUS_LABELS } from "@/components/common/StatusBadge";

export function ContactFormDialog({
  open,
  onOpenChange,
  contact,
  defaultCompanyId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  contact?: ContactResponse | null;
  defaultCompanyId?: string | null;
}) {
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();
  const { data: companiesData } = useCompanies({ size: 100 });
  const companies = companiesData?.content ?? [];
  const { data: tags = [] } = useTags();
  const createTagMutation = useCreateTag();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [companyId, setCompanyId] = useState<string | "none">("none");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [status, setStatus] = useState<ContactStatus>("new");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (open) {
      setName(contact?.name ?? "");
      setRole(contact?.role ?? "");
      setCompanyId((contact?.companyId ?? defaultCompanyId ?? "none") as string | "none");
      setEmail(contact?.email ?? "");
      setLinkedin(contact?.linkedin ?? "");
      setTwitter(contact?.twitter ?? "");
      setStatus(contact?.status ?? "new");
      setTagIds(contact?.tagIds ?? []);
      setTagInput("");
    }
  }, [open, contact, defaultCompanyId]);

  const addTagFromInput = () => {
    const val = tagInput.trim();
    if (!val) return;
    createTagMutation.mutate(
      { name: val },
      {
        onSuccess: (newTag) => {
          if (!tagIds.includes(newTag.id)) setTagIds((p) => [...p, newTag.id]);
          setTagInput("");
        }
      }
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const payload = {
      name,
      role,
      companyId: companyId === "none" ? null : companyId,
      email: email.trim() || null,
      linkedin,
      twitter: twitter.trim() || null,
      status,
      tagIds,
    };
    if (contact) {
      updateMutation.mutate(
        { id: contact.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Contact updated");
            onOpenChange(false);
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Contact added");
          onOpenChange(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{contact ? "Edit contact" : "Add contact"}</DialogTitle>
            <DialogDescription>
              {contact ? "Update contact details." : "Add a new person to your outreach."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="cname">Name</Label>
                <Input id="cname" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="crole">Role</Label>
                <Input id="crole" value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Company</Label>
              <Select value={companyId} onValueChange={(v) => setCompanyId(v as string | "none")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No company</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="cemail">Email</Label>
                <Input id="cemail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ContactStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONTACT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="clinkedin">LinkedIn</Label>
                <Input id="clinkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ctwitter">Twitter</Label>
                <Input id="ctwitter" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1.5">
                {tagIds.map((id) => {
                  const t = tags.find((x) => x.id === id);
                  if (!t) return null;
                  return (
                    <TagChip
                      key={id}
                      label={t.name}
                      onRemove={() => setTagIds((p) => p.filter((x) => x !== id))}
                    />
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTagFromInput();
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={addTagFromInput}>Add</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags
                    .filter((t) => !tagIds.includes(t.id))
                    .map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTagIds((p) => [...p, t.id])}
                        className="rounded-md border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/40"
                      >
                        + {t.name}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{contact ? "Save changes" : "Add contact"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
