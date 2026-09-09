import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./queries/queryKeys";
import { getHospitalEmergencies } from "../api/backend";

/*
  Durable view of the hospital's own emergency requests.

  The `emergency-created` socket event only reaches an admin who is connected
  at that instant, so it is treated as a hint to refetch (see
  useAdminNotifications) rather than as the source of truth. This query is the
  source of truth, which is what makes a request survive a refresh or an admin
  who logs in late.

  Polled as a backstop: an alert missed while the socket was down would
  otherwise sit unseen until the admin navigated away and back.
*/
export function useHospitalEmergencies(scope = "active") {
  return useQuery({
    queryKey: queryKeys.hospitalEmergencies(scope),

    queryFn: async () => {
      const res = await getHospitalEmergencies(scope);

      return {
        emergencies: res.data.emergencies ?? [],
        activeCount: res.data.activeCount ?? 0,
      };
    },

    staleTime: 10 * 1000,
    refetchInterval: scope === "active" ? 30 * 1000 : false,
    refetchOnWindowFocus: true,
  });
}

export default useHospitalEmergencies;
