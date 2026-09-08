import React, { useEffect, useCallback } from "react";
import DoctorCards from "./DoctorCards";
import QueueList from "./QueueList";
import CurrentPatient from "./CurrentPatient";
import OPDControls from "./OPDControls";
import PageHeader from "../layout/PageHeader";
import LiveClock from "../layout/LiveClock";
import {
  getConfirmedAppointments,
  getCurrentPatient,
  completeAppointment as completeAppointmentApi, // ⭐ API function, alag naam se
  callNext as callNextApi,
  skipPatient as skipPatientApi,
} from "../../api/backend";
import { useDispatch, useSelector } from "react-redux";
import {
  setOpdPaused,
  setOpdStarted,
  setCurrentAppointment,
  setAppointments,
} from "../../redux/slices/opdSlice";

const DoctorHome = () => {
  const dispatch = useDispatch();
  const { opdStarted, opdPaused, currentAppointment, appointments } = useSelector(
    (state) => state.opd
  );

  const fetchQueue = useCallback(async () => {
    try {
      const { data } = await getConfirmedAppointments();
      dispatch(setAppointments(data.appointments || data));
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  const fetchCurrentPatient = useCallback(async () => {
    try {
      const { data } = await getCurrentPatient();
      dispatch(setCurrentAppointment(data.currentAppointment));
      if (typeof data.opdPaused === "boolean") {
        dispatch(setOpdPaused(data.opdPaused));
      }
    } catch (error) {
          if (error.response?.status === 400 && error.response?.data?.message === "OPD not started") {
            dispatch(setOpdStarted(false));
            dispatch(setOpdPaused(false));
            dispatch(setCurrentAppointment(null));
          } else {
            console.log(error);
          }
        }
  }, [dispatch]);

  useEffect(() => {
    if (opdStarted) {
      fetchCurrentPatient();
      fetchQueue();
    } else {
      dispatch(setCurrentAppointment(null));
      dispatch(setAppointments([]));
    }
  }, [opdStarted]);

  // Complete → naya current patient + queue dono refresh karo
  const handleComplete = async (id) => {
    try {
      const {data} = await completeAppointmentApi(id);
      if(data.currentAppointment){
        dispatch(setCurrentAppointment(data.currentAppointment));

      }else{
        dispatch(setCurrentAppointment(null));
        if(data.message?.toLowerCase().includes("opd ended")){
          dispatch(setOpdStarted(false));
          dispatch(setOpdPaused(false));
        }
      }
      fetchQueue();
    } catch (error) {
      console.error('[DoctorHome] complete appointment failed:', error);
      alert(error.response?.data?.message || "Complete failed");
    }
  };

const handleCallNext = async () => {
  try {
    const { data } = await callNextApi();
    dispatch(setCurrentAppointment(data.currentAppointment || null));
    if (!data.currentAppointment && data.message?.toLowerCase().includes("opd ended")) {
      dispatch(setOpdStarted(false));
      dispatch(setOpdPaused(false));
    }
    fetchQueue();
  } catch (error) {
    console.error(error);
    alert(error.response?.data?.message || "Call next failed");
  }
};

const handleSkip = async () => {
  try {
    const { data } = await skipPatientApi();
    dispatch(setCurrentAppointment(data.currentAppointment || null));
    if (!data.currentAppointment && data.message?.toLowerCase().includes("ended")) {
      dispatch(setOpdStarted(false));
      dispatch(setOpdPaused(false));
    }
    fetchQueue();
  } catch (error) {
    console.error(error);
    alert(error.response?.data?.message || "Skip failed");
  }
};

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Doctor portal"
        title="OPD Console"
        description="Today's intake, the live consultation and the waiting queue in one view."
      >
        <LiveClock />
      </PageHeader>

      <DoctorCards />

      <OPDControls
        opdStarted={opdStarted}
        opdPaused={opdPaused}
        currentAppointment={currentAppointment}
        setOpdStarted={(val) => dispatch(setOpdStarted(val))}
        setOpdPaused={(val) => dispatch(setOpdPaused(val))}
        setCurrentAppointment={(val) => dispatch(setCurrentAppointment(val))}
        refreshQueue={fetchQueue}
      />

      {opdStarted && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
          <CurrentPatient
            appointment={currentAppointment}
            onComplete={handleComplete}
            onSkip={handleSkip}
            onCallNext={handleCallNext}
          />
          <QueueList appointments={appointments} />
        </div>
      )}
    </div>
  );
};

export default DoctorHome;
