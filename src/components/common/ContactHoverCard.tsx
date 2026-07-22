import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, Building2, MapPin } from "lucide-react";
import type { ContactResponse } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { StatusBadge } from "./StatusBadge";

export function ContactHoverCard({ contact, children }: { contact: ContactResponse; children: React.ReactNode }) {
  const initials = contact.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80" side="right" align="start">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-semibold">{contact.name}</h4>
            <p className="text-sm text-muted-foreground">{contact.role}</p>
            <div className="flex items-center pt-2">
              <Building2 className="mr-2 h-4 w-4 opacity-70" />
              <span className="text-xs text-muted-foreground">
                {contact.companyName || "No Company"}
              </span>
            </div>
            <div className="flex items-center pt-1">
              <MapPin className="mr-2 h-4 w-4 opacity-70" />
              <span className="text-xs text-muted-foreground">
                {contact.location || "Unknown Location"}
              </span>
            </div>
            <div className="flex items-center pt-1">
              <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
              <span className="text-xs text-muted-foreground">
                Added {formatDistanceToNow(new Date(contact.createdAt))} ago
              </span>
            </div>
            <div className="pt-2">
              <StatusBadge status={contact.status} />
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
