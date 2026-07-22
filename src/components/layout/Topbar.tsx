import { useState } from "react";
import { Moon, Sun, Plus, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/theme";
import { CompanyFormDialog } from "@/components/forms/CompanyFormDialog";
import { ContactFormDialog } from "@/components/forms/ContactFormDialog";
import { GlobalSearch } from "@/components/common/GlobalSearch";

export function Topbar() {
  const { theme, toggle } = useTheme();
  const [companyOpen, setCompanyOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <div className="flex-1 max-w-md">
        <Button
          variant="outline"
          className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-64 lg:w-80 shadow-none border-dashed bg-muted/50 hover:bg-muted"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="mr-2 h-4 w-4 shrink-0" />
          <span>Search CRM...</span>
          <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-9 gap-1.5">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setCompanyOpen(true)}>Add company</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setContactOpen(true)}>Add contact</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CompanyFormDialog open={companyOpen} onOpenChange={setCompanyOpen} />
      <ContactFormDialog open={contactOpen} onOpenChange={setContactOpen} />
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
