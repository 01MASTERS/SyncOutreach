import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTags, createTag, type TagRequest } from "@/lib/api";

export const tagKeys = {
  all: ["tags"] as const,
};

export function useTags() {
  return useQuery({
    queryKey: tagKeys.all,
    queryFn: fetchTags,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TagRequest) => createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });
}
