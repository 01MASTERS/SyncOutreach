import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { Calendar, CheckCircle, Clock, ArrowUpRight } from "lucide-react";
import type { Outreach } from "@/lib/types";
import { isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";

interface FollowUpCardProps {
  outreach: Outreach;
  onReschedule: (outreach: Outreach) => void;
  onComplete: (id: string) => void;
}

export function FollowUpCard({ outreach, onReschedule, onComplete }: FollowUpCardProps) {
  const nextDate = new Date(outreach.nextFollowupDate!);
  const isOverdue = isPast(nextDate) && !isToday(nextDate);
  const isDueToday = isToday(nextDate);

  return (
    <Card className={cn(
      "flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
      isOverdue ? "border-t-[3px] border-t-destructive dark:border-t-destructive" : 
      isDueToday ? "border-t-[3px] border-t-amber-500 dark:border-t-amber-400" : 
      "border-t-[3px] border-t-transparent hover:border-t-border"
    )}>
      <CardHeader className={cn("pb-4 border-b", isOverdue ? "bg-destructive/5" : isDueToday ? "bg-amber-50/50 dark:bg-amber-900/10" : "bg-muted/10")}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold",
              isOverdue ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : 
              isDueToday ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
              "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            )}>
              {outreach.contactName.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                <Link to="/contacts/$id" params={{ id: outreach.contactId }} className="hover:underline flex items-center gap-1">
                  {outreach.contactName}
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-50" />
                </Link>
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs font-medium">
                {outreach.companyName || "No company"}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <Badge variant={isOverdue ? "destructive" : isDueToday ? "default" : "secondary"} className={cn(isDueToday && "bg-amber-500 hover:bg-amber-600 text-white")}>
            {outreach.platform}
          </Badge>
          <span className="text-xs font-medium capitalize px-2 py-1 bg-muted rounded-md text-muted-foreground">{outreach.type}</span>
        </div>
        
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Previous</span>
            <span className="font-medium">{new Date(outreach.date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center font-medium">
            <span className={cn("flex items-center gap-1.5", isOverdue ? "text-destructive" : isDueToday ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground")}>
              <Calendar className="h-3.5 w-3.5" /> Due
            </span>
            <span className={cn(
              "px-2 py-0.5 rounded-md text-xs",
              isOverdue ? "bg-destructive/10 text-destructive" : 
              isDueToday ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : 
              "bg-muted text-muted-foreground"
            )}>
              {nextDate.toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-0 pb-4 px-4 bg-muted/5 border-t mt-auto pt-4">
        <Button variant="outline" className="w-full text-xs font-semibold shadow-sm" onClick={() => onReschedule(outreach)}>
          Reschedule
        </Button>
        <Button className={cn("w-full text-xs font-semibold shadow-sm", isDueToday && "bg-amber-500 hover:bg-amber-600 text-white")} onClick={() => onComplete(outreach.id)}>
          <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
          Complete
        </Button>
      </CardFooter>
    </Card>
  );
}
