import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Building2, Users, Search, Loader2 } from "lucide-react";
import { useCompanies } from "@/hooks/use-companies";
import { useContacts } from "@/hooks/use-contacts";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: companiesData, isLoading: companiesLoading } = useCompanies({ search: searchQuery, size: 5 });
  const { data: contactsData, isLoading: contactsLoading } = useContacts({ search: searchQuery, size: 5 });

  const companies = companiesData?.content || [];
  const contacts = contactsData?.content || [];
  const isLoading = companiesLoading || contactsLoading;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
    setSearchQuery("");
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Type a command or search..." 
        value={searchQuery} 
        onValueChange={setSearchQuery} 
      />
      <CommandList>
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading && <CommandEmpty>No results found.</CommandEmpty>}
        
        {!isLoading && contacts.length > 0 && (
          <CommandGroup heading="Contacts">
            {contacts.map((contact) => (
              <CommandItem
                key={contact.id}
                value={`contact-${contact.id}-${contact.name}`}
                onSelect={() => runCommand(() => navigate({ to: "/contacts/$id", params: { id: contact.id } }))}
              >
                <Users className="mr-2 h-4 w-4" />
                <span>{contact.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">{contact.role} {contact.companyName ? `at ${contact.companyName}` : ""}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!isLoading && companies.length > 0 && (
          <CommandGroup heading="Companies">
            {companies.map((company) => (
              <CommandItem
                key={company.id}
                value={`company-${company.id}-${company.name}`}
                onSelect={() => runCommand(() => navigate({ to: "/companies/$id", params: { id: company.id } }))}
              >
                <Building2 className="mr-2 h-4 w-4" />
                <span>{company.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">{company.size} employees</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
