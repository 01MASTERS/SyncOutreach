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
import { OUTREACH_PLATFORMS, OUTREACH_TYPES, type OutreachPlatform, type OutreachType, type Outreach } from "@/lib/types";
import { useCreateOutreach, useUpdateOutreach } from "@/hooks/use-outreaches";
import { toast } from "sonner";

const PLATFORM_TYPE_MAP: Record<OutreachPlatform, OutreachType[]> = {
  Email: ["Cold Email", "Follow-up Email", "Referral Request"],
  LinkedIn: ["LinkedIn Request", "LinkedIn Message", "Referral Request"],
  Twitter: ["Twitter DM", "Referral Request"],
  Phone: ["Referral Request"],
};

export function OutreachFormDialog({
  open,
  onOpenChange,
  contactId,
  outreach,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  contactId: string;
  outreach?: Outreach | null;
}) {
  const createMutation = useCreateOutreach();
  const updateMutation = useUpdateOutreach();

  const [platform, setPlatform] = useState<OutreachPlatform>("Email");
  const [type, setType] = useState<OutreachType>("Cold Email");
  const [date, setDate] = useState("");
  const [nextFollowupDate, setNextFollowupDate] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");

  useEffect(() => {
    if (open) {
      if (outreach) {
        setPlatform(outreach.platform);
        setType(outreach.type);
        // Extract YYYY-MM-DD from ISO string
        setDate(outreach.date.split("T")[0]);
        setNextFollowupDate(outreach.nextFollowupDate ? outreach.nextFollowupDate.split("T")[0] : "");
        setReferenceUrl(outreach.referenceUrl || "");
      } else {
        setPlatform("Email");
        setType("Cold Email");
        setDate(new Date().toISOString().split("T")[0]);
        setNextFollowupDate("");
        setReferenceUrl("");
      }
    }
  }, [open, outreach]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error("Please provide a date");
      return;
    }

    const payload = {
      contactId,
      platform,
      type,
      date: new Date(date).toISOString(),
      nextFollowupDate: nextFollowupDate ? new Date(nextFollowupDate).toISOString() : null,
      referenceUrl: referenceUrl.trim() || null,
    };

    if (outreach) {
      updateMutation.mutate(
        { id: outreach.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Outreach updated");
            onOpenChange(false);
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Outreach added");
          onOpenChange(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{outreach ? "Edit Activity" : "Add Activity"}</DialogTitle>
            <DialogDescription>
              {outreach ? "Update this outreach record." : "Log a new communication."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={(v) => {
                const newPlatform = v as OutreachPlatform;
                setPlatform(newPlatform);
                if (!PLATFORM_TYPE_MAP[newPlatform].includes(type)) {
                  setType(PLATFORM_TYPE_MAP[newPlatform][0]);
                }
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OUTREACH_PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as OutreachType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLATFORM_TYPE_MAP[platform].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="odate">Date</Label>
                <Input id="odate" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="onext">Follow-up Date</Label>
                <Input id="onext" type="date" value={nextFollowupDate} onChange={(e) => setNextFollowupDate(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="oref">Reference URL (Optional)</Label>
              <Input id="oref" type="url" placeholder="https://..." value={referenceUrl} onChange={(e) => setReferenceUrl(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{outreach ? "Save changes" : "Add Activity"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
