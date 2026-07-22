import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { useOutreaches, useCompleteOutreach } from "@/hooks/use-outreaches";
import { FollowUpCard } from "@/components/common/FollowUpCard";
import { OutreachFormDialog } from "@/components/forms/OutreachFormDialog";
import { isPast, isToday } from "date-fns";
import { Loader2, CheckCircle2 } from "lucide-react";
import type { Outreach } from "@/lib/types";

import { CardSkeleton } from "@/components/common/CardSkeleton";

export const Route = createFileRoute("/follow-ups")({
  component: FollowUpsPage,
});

function FollowUpsPage() {
  const { data: outreachesData, isLoading } = useOutreaches({ size: 1000, hasFollowup: true });
  const completeMutation = useCompleteOutreach();

  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleOutreach, setRescheduleOutreach] = useState<Outreach | null>(null);

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-8 animate-in fade-in duration-500">
        <PageHeader title="Follow-ups" description="Manage your pending outreach tasks and stay on top of communications." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  // Filter out completed ones just in case API returns them (it shouldn't if we filter, but we didn't add filter for completed to backend yet, let's filter here)
  const pendingFollowups = (outreachesData?.content ?? []).filter(o => !o.followupCompleted);

  const overdue = pendingFollowups.filter(o => isPast(new Date(o.nextFollowupDate!)) && !isToday(new Date(o.nextFollowupDate!)));
  const dueToday = pendingFollowups.filter(o => isToday(new Date(o.nextFollowupDate!)));
  const upcoming = pendingFollowups.filter(o => !isPast(new Date(o.nextFollowupDate!)) && !isToday(new Date(o.nextFollowupDate!)));

  const handleComplete = (id: string) => {
    completeMutation.mutate(id);
  };

  const handleReschedule = (outreach: Outreach) => {
    setRescheduleOutreach(outreach);
    setRescheduleOpen(true);
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <PageHeader
        title="Follow-ups"
        description="Manage your pending outreach tasks and stay on top of communications."
      />

      {pendingFollowups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CheckCircle2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">All caught up!</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            You don't have any pending follow-ups. Enjoy your day or add new activities from a contact profile.
          </p>
        </div>
      ) : (
        <div className="grid gap-8">
          {overdue.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-destructive mb-4 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-destructive"></span>
                Overdue ({overdue.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {overdue.map(o => (
                  <FollowUpCard key={o.id} outreach={o} onReschedule={handleReschedule} onComplete={handleComplete} />
                ))}
              </div>
            </section>
          )}

          {dueToday.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                Due Today ({dueToday.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {dueToday.map(o => (
                  <FollowUpCard key={o.id} outreach={o} onReschedule={handleReschedule} onComplete={handleComplete} />
                ))}
              </div>
            </section>
          )}

          {upcoming.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-muted-foreground mb-4">
                Upcoming ({upcoming.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {upcoming.map(o => (
                  <FollowUpCard key={o.id} outreach={o} onReschedule={handleReschedule} onComplete={handleComplete} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {rescheduleOutreach && (
        <OutreachFormDialog
          open={rescheduleOpen}
          onOpenChange={setRescheduleOpen}
          contactId={rescheduleOutreach.contactId}
          outreach={rescheduleOutreach}
        />
      )}
    </div>
  );
}
