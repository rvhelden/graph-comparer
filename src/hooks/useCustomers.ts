import { useQuery } from "@tanstack/react-query";
import { useMsal } from "@azure/msal-react";
import { useMemo } from "react";
import ODataService from "../services/odataService";
import type { Customer, ODataQueryOptions, ODataResponse } from "../schemas/customerSchemas";

export interface UseCustomersParams {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: string;
  search?: string;
}

export const useCustomers = (params: UseCustomersParams = {}) => {
  const { instance } = useMsal();
  const odataService = useMemo(() => new ODataService(instance), [instance]);

  const { page = 1, pageSize = 10, sortField, sortOrder, search } = params;

  const queryKey = [
    "customers",
    {
      page,
      pageSize,
      sortField,
      sortOrder,
      search,
    },
  ];

  const queryFn = async (): Promise<ODataResponse<Customer>> => {
    const options: ODataQueryOptions = {
      $skip: (page - 1) * pageSize,
      $top: pageSize,
      $count: true,
    };

    if (sortField && sortOrder) {
      const direction = sortOrder === "ascend" ? "asc" : "desc";
      options.$orderby = `${sortField} ${direction}`;
    }

    if (search) {
      options.$filter = `contains(tolower(Name), '${search.toLowerCase()}') or contains(tolower(TenantName), '${search.toLowerCase()}') or contains(tolower(TenantDomain), '${search.toLowerCase()}')`;
    }

    return odataService.getCustomers(options);
  };

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 2 * 60 * 1000, // 2 minutes for customer data
    enabled: true, // Always enabled since we need customer data
  });
};

export const useCustomer = (id: string) => {
  const { instance } = useMsal();
  const odataService = useMemo(() => new ODataService(instance), [instance]);

  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => odataService.getCustomer(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for individual customer data
  });
};