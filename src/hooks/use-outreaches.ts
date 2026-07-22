import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOutreachesByContact,
  fetchOutreaches,
  createOutreach,
  updateOutreach,
  completeOutreach,
  deleteOutreach,
  OutreachRequest,
} from "@/lib/api";

export const outreachKeys = {
  all: ["outreaches"] as const,
  lists: () => [...outreachKeys.all, "list"] as const,
  list: (filters: string) => [...outreachKeys.lists(), { filters }] as const,
  byContact: (contactId: string) => [...outreachKeys.all, "by-contact", contactId] as const,
};

export function useOutreaches(params?: { page?: number; size?: number; hasFollowup?: boolean }) {
  return useQuery({
    queryKey: outreachKeys.list(JSON.stringify(params || {})),
    queryFn: () => fetchOutreaches(params),
  });
}

export function useOutreachesByContact(contactId: string) {
  return useQuery({
    queryKey: outreachKeys.byContact(contactId),
    queryFn: () => fetchOutreachesByContact(contactId),
    enabled: !!contactId,
  });
}

export function useCreateOutreach() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OutreachRequest) => createOutreach(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: outreachKeys.byContact(variables.contactId) });
      queryClient.invalidateQueries({ queryKey: outreachKeys.lists() });
    },
  });
}

export function useUpdateOutreach() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OutreachRequest }) =>
      updateOutreach(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: outreachKeys.byContact(variables.data.contactId) });
      queryClient.invalidateQueries({ queryKey: outreachKeys.lists() });
    },
  });
}

export function useCompleteOutreach() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => completeOutreach(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: outreachKeys.all });
      const previousOutreaches = queryClient.getQueriesData({ queryKey: outreachKeys.lists() });
      
      // Optimistically update lists to mark it as completed
      queryClient.setQueriesData({ queryKey: outreachKeys.lists() }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          content: old.content.map((o: any) => 
            o.id === id ? { ...o, followupCompleted: true } : o
          )
        };
      });

      return { previousOutreaches };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousOutreaches) {
        context.previousOutreaches.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: outreachKeys.all });
    },
  });
}

export function useDeleteOutreach() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, contactId }: { id: string; contactId: string }) => deleteOutreach(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: outreachKeys.byContact(variables.contactId) });
      queryClient.invalidateQueries({ queryKey: outreachKeys.lists() });
    },
  });
}
