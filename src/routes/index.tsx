import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Users, Send, Clock, ArrowUpRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanies } from "@/hooks/use-companies";
import { useContacts } from "@/hooks/use-contacts";
import { useOutreaches } from "@/hooks/use-outreaches";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/common/PageHeader";
import { formatDistanceToNow } from "date-fns";

import { CardSkeleton } from "@/components/common/CardSkeleton";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

import { cn } from "@/lib/utils";

type StatCardVariant = "default" | "blue" | "purple" | "emerald" | "amber";

const STAT_STYLES: Record<StatCardVariant, {
  card: string;
  iconBg: string;
  iconText: string;
  valueText: string;
}> = {
  default: {
    card: "",
    iconBg: "bg-muted",
    iconText: "text-muted-foreground",
    valueText: "text-foreground",
  },
  blue: {
    card: "group-hover:bg-sky-50/50 dark:group-hover:bg-sky-900/20",
    iconBg: "bg-sky-100 dark:bg-sky-900/30",
    iconText: "text-sky-600 dark:text-sky-400",
    valueText: "text-sky-700 dark:text-sky-400",
  },
  purple: {
    card: "group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/20",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
    iconText: "text-indigo-600 dark:text-indigo-400",
    valueText: "text-indigo-700 dark:text-indigo-400",
  },
  emerald: {
    card: "group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-900/20",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconText: "text-emerald-600 dark:text-emerald-400",
    valueText: "text-emerald-700 dark:text-emerald-400",
  },
  amber: {
    card: "group-hover:bg-amber-50/50 dark:group-hover:bg-amber-900/20",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconText: "text-amber-600 dark:text-amber-400",
    valueText: "text-amber-700 dark:text-amber-400",
  },
};

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  variant = "default",
  to,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: StatCardVariant;
  to: string;
}) {
  const styles = STAT_STYLES[variant];
  return (
    <Link to={to as any} className="block h-full group outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
      <Card className={cn("h-full transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-0.5", styles.card)}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className={cn("mt-2 text-3xl font-semibold tracking-tight", styles.valueText)}>{value}</p>
              {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
            </div>
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", styles.iconBg, styles.iconText)}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function Dashboard() {
  const { data: companiesData, isLoading: companiesLoading } = useCompanies({ size: 5 });
  const { data: contactsData, isLoading: contactsLoading } = useContacts({ size: 5 });
  const { data: outreachesData, isLoading: outreachesLoading } = useOutreaches({ size: 5 });
  const { data: followupsData, isLoading: followupsLoading } = useOutreaches({ size: 1000, hasFollowup: true });

  const recentContacts = contactsData?.content ?? [];
  const recentCompanies = companiesData?.content ?? [];
  const recentOutreaches = outreachesData?.content ?? [];
  
  const totalCompanies = companiesData?.totalElements ?? 0;
  const totalContacts = contactsData?.totalElements ?? 0;
  const totalOutreach = outreachesData?.totalElements ?? 0;

  const pendingFollowups = (followupsData?.content ?? []).filter(o => !o.followupCompleted);
  const pendingCount = pendingFollowups.length;

  if (companiesLoading || contactsLoading || outreachesLoading || followupsLoading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-8 animate-in fade-in duration-500">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <PageHeader
        title="Dashboard"
        description="A quick pulse on your network and outreach activity."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Companies" value={totalCompanies} icon={Building2} variant="blue" to="/companies" />
        <StatCard label="Contacts" value={totalContacts} icon={Users} variant="purple" to="/contacts" />
        <StatCard label="Outreach" value={totalOutreach} hint="Total logged" icon={Send} variant="emerald" to="/outreach" />
        <StatCard label="Follow-ups" value={pendingCount} hint="Pending" icon={Clock} variant="amber" to="/follow-ups" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-t-[3px] border-t-indigo-500 dark:border-t-indigo-400 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 py-4 border-b bg-indigo-50/50 dark:bg-indigo-900/20">
            <CardTitle className="text-base text-indigo-700 dark:text-indigo-300">Recent contacts</CardTitle>
            <Link to="/contacts" className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {recentContacts.map((c) => {
                return (
                  <li key={c.id}>
                    <Link
                      to="/contacts/$id"
                      params={{ id: c.id }}
                      className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.role}{c.companyName ? ` · ${c.companyName}` : ""}
                        </p>
                      </div>
                      <StatusBadge status={c.status} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-t-[3px] border-t-emerald-500 dark:border-t-emerald-400 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 py-4 border-b bg-emerald-50/50 dark:bg-emerald-900/20">
            <CardTitle className="text-base text-emerald-700 dark:text-emerald-300">Recent outreach</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentOutreaches.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No outreach logged yet.</div>
            ) : (
              <ul className="divide-y divide-border">
                {recentOutreaches.map((o) => (
                  <li key={o.id}>
                    <Link
                      to="/contacts/$id"
                      params={{ id: o.contactId }}
                      className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{o.contactName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {o.type} via {o.platform}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(o.date), { addSuffix: true })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-t-[3px] border-t-sky-500 dark:border-t-sky-400 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 py-4 border-b bg-sky-50/50 dark:bg-sky-900/20">
            <CardTitle className="text-base text-sky-700 dark:text-sky-300">Recently added companies</CardTitle>
            <Link to="/companies" className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-200">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {recentCompanies.map((c) => {
                return (
                  <li key={c.id}>
                    <Link
                      to="/companies/$id"
                      params={{ id: c.id }}
                      className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.size} employees · Added {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {c.contactCount} {c.contactCount === 1 ? "contact" : "contacts"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
