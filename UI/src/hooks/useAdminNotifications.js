import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import socket from "../socket";
import { addNotification } from "../redux/slices/notificationSlice";

/*
  Feeds the Navbar bell for a hospital admin.

  Mounted from HospitalLayout rather than a page so the feed keeps filling
  while the admin moves around /hospital-dashboard/*.

  Only events the server actually sends an admin are handled:
    - emergency-created / emergency-cancelled go to the `hospital:<id>` room,
      which socket.js now joins for HOSPITAL_ADMIN on connect.
    - doctor-online / doctor-offline are broadcast with io.emit, so they
      arrive on any authenticated socket.

  `new-appointment` is deliberately absent - it is emitted only into
  `doctor_<id>`, so an admin never receives it.
*/
const useAdminNotifications = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  useEffect(() => {
    // The shared socket is autoConnect:false and reads the JWT from
    // localStorage, which the io.use() guard on the server requires.
    if (!socket.connected) {
      socket.connect();
    }

    const handleEmergencyCreated = (emergency) => {
      const patientName = emergency?.patient?.name || "A patient";

      // The bell is the alert; /hospital-dashboard/emergencies is the record.
      // Refetching keeps the dispatch queue current for an admin already
      // sitting on it, without making the socket the source of truth.
      queryClient.invalidateQueries({ queryKey: ["hospital", "emergencies"] });

      dispatch(
        addNotification({
          id: `emergency-created-${emergency?._id}`,
          type: "EMERGENCY_CREATED",
          message: `Emergency request from ${patientName}`,
          description: emergency?.message || undefined,
          reason: emergency?.reason,
          createdAt: emergency?.createdAt || new Date().toISOString(),
        })
      );
    };

    const handleEmergencyCancelled = (emergency) => {
      const patientName = emergency?.patient?.name || "A patient";

      queryClient.invalidateQueries({ queryKey: ["hospital", "emergencies"] });

      dispatch(
        addNotification({
          id: `emergency-cancelled-${emergency?._id}`,
          type: "EMERGENCY_CANCELLED",
          message: `${patientName} cancelled their emergency request`,
          createdAt: new Date().toISOString(),
        })
      );
    };

    // These carry only an id, so the copy stays generic rather than
    // pretending to know the doctor's name.
    const handleDoctorOnline = ({ doctorId }) => {
      dispatch(
        addNotification({
          id: `doctor-online-${doctorId}-${Date.now()}`,
          type: "DOCTOR_ONLINE",
          message: "A doctor came online",
          createdAt: new Date().toISOString(),
        })
      );
    };

    const handleDoctorOffline = ({ doctorId }) => {
      dispatch(
        addNotification({
          id: `doctor-offline-${doctorId}-${Date.now()}`,
          type: "DOCTOR_OFFLINE",
          message: "A doctor went offline",
          createdAt: new Date().toISOString(),
        })
      );
    };

    socket.on("emergency-created", handleEmergencyCreated);
    socket.on("emergency-cancelled", handleEmergencyCancelled);
    socket.on("doctor-online", handleDoctorOnline);
    socket.on("doctor-offline", handleDoctorOffline);

    return () => {
      socket.off("emergency-created", handleEmergencyCreated);
      socket.off("emergency-cancelled", handleEmergencyCancelled);
      socket.off("doctor-online", handleDoctorOnline);
      socket.off("doctor-offline", handleDoctorOffline);
    };
  }, [dispatch, queryClient]);
};

export default useAdminNotifications;
