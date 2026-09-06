import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./queries/queryKeys";
import { getPharmacyInventory } from "../api/backend";

/*
  Every pharmacy screen reads the same batch list, so it lives in one cache
  entry. Adding a medicine invalidates queryKeys.pharmacyInventory.
*/
export function usePharmacyInventory() {
  return useQuery({
    queryKey: queryKeys.pharmacyInventory,
    queryFn: async () => {
      const res = await getPharmacyInventory();
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}
