import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEmergencyStatus } from "../api/backend";

/*
  Advances one emergency to its next status.

  No optimistic update here, unlike useConfirmAppointment: the server owns the
  transition table and rejects an illegal step with a 400, and a status that
  flickered forward before being rolled back would be actively misleading on an
  ambulance dispatch screen. The list is refetched from the server instead.
*/
export function useUpdateEmergencyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ emergencyId, status, ambulance }) =>
      updateEmergencyStatus(emergencyId, status, ambulance),

    // A completed or cancelled request leaves the active queue and joins the
    // history log, so both scopes are invalidated regardless of which one the
    // admin is looking at.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["hospital", "emergencies"] });
    },
  });
}

export default useUpdateEmergencyStatus;
