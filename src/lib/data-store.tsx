import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react";
import type { Company, Contact, Tag } from "./types";
import { initialCompanies, initialContacts, initialTags } from "./mock-data";

interface Store {
  companies: Company[];
  contacts: Contact[];
  tags: Tag[];
  addCompany: (c: Omit<Company, "id" | "created_at">) => Company;
  updateCompany: (id: string, patch: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  addContact: (c: Omit<Contact, "id" | "created_at">) => Contact;
  updateContact: (id: string, patch: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  addTag: (name: string) => Tag;
  getCompany: (id: string) => Company | undefined;
  getContact: (id: string) => Contact | undefined;
  getContactsByCompany: (id: string) => Contact[];
}

const StoreContext = createContext<Store | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [tags, setTags] = useState<Tag[]>(initialTags);

  const addCompany = useCallback((c: Omit<Company, "id" | "created_at">) => {
    const company: Company = { ...c, id: uid(), created_at: new Date().toISOString() };
    setCompanies((prev) => [company, ...prev]);
    return company;
  }, []);

  const updateCompany = useCallback((id: string, patch: Partial<Company>) => {
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const deleteCompany = useCallback((id: string) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id));
    setContacts((prev) => prev.map((c) => (c.company_id === id ? { ...c, company_id: null } : c)));
  }, []);

  const addContact = useCallback((c: Omit<Contact, "id" | "created_at">) => {
    const contact: Contact = { ...c, id: uid(), created_at: new Date().toISOString() };
    setContacts((prev) => [contact, ...prev]);
    return contact;
  }, []);

  const updateContact = useCallback((id: string, patch: Partial<Contact>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const deleteContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addTag = useCallback(
    (name: string): Tag => {
      const trimmed = name.trim();
      const existing = tags.find((t) => t.name.toLowerCase() === trimmed.toLowerCase());
      if (existing) return existing;
      const tag: Tag = { id: uid(), name: trimmed };
      setTags((prev) => [...prev, tag]);
      return tag;
    },
    [tags],
  );

  const value = useMemo<Store>(
    () => ({
      companies,
      contacts,
      tags,
      addCompany,
      updateCompany,
      deleteCompany,
      addContact,
      updateContact,
      deleteContact,
      addTag,
      getCompany: (id) => companies.find((c) => c.id === id),
      getContact: (id) => contacts.find((c) => c.id === id),
      getContactsByCompany: (id) => contacts.filter((c) => c.company_id === id),
    }),
    [companies, contacts, tags, addCompany, updateCompany, deleteCompany, addContact, updateContact, deleteContact, addTag],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within DataStoreProvider");
  return ctx;
}
