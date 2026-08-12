"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { getClientAppServices } from "@/services/client";
import type {
  UpdateCustomerPhotoCaptionInput,
  UploadCustomerPhotoInput,
} from "@/services/schemas";
import type { CustomerPhotoWithUrl } from "@/types/database";
import { isSupabaseConfigured } from "@/utils/env";

export function useCustomerPhotosQuery(
  customerId: string,
  options?: Omit<
    UseQueryOptions<CustomerPhotoWithUrl[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.customerPhotos.list(customerId),
    queryFn: () => getClientAppServices().customerPhoto.listWithSignedUrls(customerId),
    enabled: isSupabaseConfigured() && Boolean(customerId),
    ...options,
  });
}

export function useUploadCustomerPhotoMutation(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    networkMode: "always",
    mutationFn: (input: UploadCustomerPhotoInput) =>
      getClientAppServices().customerPhoto.upload(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.customerPhotos.list(variables.customer_id),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.customers.list(businessId),
      });
    },
  });
}

export function useUpdateCustomerPhotoCaptionMutation(
  businessId: string,
  customerId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      photoId,
      input,
    }: {
      photoId: string;
      input: UpdateCustomerPhotoCaptionInput;
    }) =>
      getClientAppServices().customerPhoto.updateCaption(businessId, photoId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.customerPhotos.list(customerId),
      });
    },
  });
}

export function useDeleteCustomerPhotoMutation(businessId: string, customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    networkMode: "always",
    mutationFn: (photoId: string) =>
      getClientAppServices().customerPhoto.delete(businessId, photoId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.customerPhotos.list(customerId),
      });
    },
  });
}
