import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ContactStatus } from "@/lib/types";
import {
  fetchContacts,
  fetchContact,
  fetchContactsByCompany,
  createContact,
  updateContact,
  deleteContact,
  type ContactRequest,
} from "@/lib/api";

export const contactKeys = {
  all: ["contacts"] as const,
  lists: () => [...contactKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...contactKeys.lists(), params] as const,
  details: () => [...contactKeys.all, "detail"] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
  byCompany: (companyId: string) =>
    [...contactKeys.all, "by-company", companyId] as const,
};

export function useContacts(params?: {
  search?: string;
  companyId?: string;
  role?: string;
  status?: ContactStatus;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: contactKeys.list(params ?? {}),
    queryFn: () => fetchContacts(params),
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => fetchContact(id),
    enabled: !!id,
  });
}

export function useContactsByCompany(companyId: string) {
  return useQuery({
    queryKey: contactKeys.byCompany(companyId),
    queryFn: () => fetchContactsByCompany(companyId),
    enabled: !!companyId,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ContactRequest) => createContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContactRequest }) =>
      updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
  });
}
