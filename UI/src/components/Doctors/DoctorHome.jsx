import React, { useEffect } from "react";
import DoctorCards from "./DoctorCards";
import IntroSection from "../Hospitals/IntroSection";
import QueueList from "./QueueList";
import CurrentPatient from "./CurrentPatient";
import OPDControls from "./OPDControls";
import { completeAppointment as completeAppointmentApi, getConfirmedAppointments } from "../../api/backend";
import { useDispatch, useSelector } from "react-redux";
import {
  setConsultationStarted,
  setOpdPaused,
  setOpdStarted,
  setAppointments,
  completeAppointment,
} from "../../redux/slices/opdSlice";

const DoctorHome = () => {
  const dispatch = useDispatch();
  const { opdStarted, opdPaused, consultationStarted, appointments } = useSelector(
    (state) => state.opd
  );

  const activeAppointments = appointments.filter((a) => a.status !== "COMPLETED");

  const fetchQueue = async () => {
    try {
      const { data } = await getConfirmedAppointments();
      dispatch(setAppointments(data.appointments));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (appointments.length === 0) {
      fetchQueue();
    }
  }, []);

  const handleComplete = async (id) => {
    try {
      await completeAppointmentApi(id);       // backend call
      dispatch(completeAppointment(id));       // redux action — naming collision fix
    } catch (error) {
      console.error('[DoctorHome] complete appointment failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <IntroSection />
      <DoctorCards />
      <OPDControls
        opdStarted={opdStarted}
        opdPaused={opdPaused}
        consultationStarted={consultationStarted}
        setOpdStarted={(val) => dispatch(setOpdStarted(val))}
        setOpdPaused={(val) => dispatch(setOpdPaused(val))}
        setConsultationStarted={(val) => dispatch(setConsultationStarted(val))}
      />

      {opdStarted && (
        <div className="h-screen flex gap-6">
          <div className="flex-1 h-96">
            <CurrentPatient
              appointment={activeAppointments[0]}
              onComplete={handleComplete}   // ✅ fix — purana setAppointments hata diya
            />
          </div>

          <div className="flex-1 h-96">
            <QueueList appointments={activeAppointments.slice(1)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorHome;