import React, { useState } from "react";
import { CirclePause, Play, Power, Stethoscope } from "lucide-react";
import {
  startOPD,
  startConsultation,
  stopConsultation,
  pauseConsultation,
  resumeConsultation
} from "../../api/backend";

/*
  Session bar for the OPD state machine.

  The render conditions below are deliberately identical to the previous UI -
  the backend allows at most one CURRENT appointment per doctor per day and
  refuses to stop OPD while a consultation is running, so showing every control
  at once would just produce 409s. Same handlers, same API calls, same setters.
*/

const OPDControls = ({
  opdStarted,
  opdPaused,
  currentAppointment,
  setOpdStarted,
  setOpdPaused,
  setCurrentAppointment,
  refreshQueue // parent se aaya function jo queue list refetch kare
}) => {
  const [loading, setLoading] = useState(false);

  const handleOPDToggle = async () => {
    try {
      setLoading(true);
      if (!opdStarted) {
        // Start OPD
        await startOPD();
        setOpdStarted(true);
      } else {
        // Stop OPD — poora session end karo
        await stopConsultation();
        setOpdStarted(false);
        setOpdPaused(false);
        setCurrentAppointment(null);
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "OPD toggle failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStartConsultation = async () => {
    try {
      setLoading(true);
      const res = await startConsultation();
      setCurrentAppointment(res.data.currentAppointment);
      setOpdPaused(false);
      refreshQueue?.(); // queue se yeh patient hat jaayega
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "No patients in queue");
    } finally {
      setLoading(false);
    }
  };

  const handlePauseConsultation = async () => {
    try {
      setLoading(true);
      await pauseConsultation();
      setOpdPaused(true);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Pause failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeConsultation = async () => {
    try {
      setLoading(true);
      await resumeConsultation();
      setOpdPaused(false);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Resume failed");
    } finally {
      setLoading(false);
    }
  };

  const status = !opdStarted
    ? { label: "OPD closed", hint: "Start OPD to open the token queue for today.", tone: "text-on-surface-variant", dot: "bg-outline" }
    : opdPaused
    ? { label: "OPD paused", hint: "The queue is held. Resume when you are ready.", tone: "text-warning", dot: "bg-warning" }
    : currentAppointment
    ? { label: "Consultation running", hint: `Token #${currentAppointment.token} is with you now.`, tone: "text-primary", dot: "bg-primary" }
    : { label: "OPD live", hint: "Call the first confirmed patient to begin.", tone: "text-primary", dot: "bg-primary" };

  const secondaryBtn =
    "inline-flex items-center gap-2 rounded-control border border-outline-variant bg-surface-lowest px-4 py-2.5 text-body-md font-medium text-on-surface transition hover:bg-surface-container disabled:opacity-50";

  return (
    <div className="flex flex-col gap-4 rounded-card border border-outline-variant bg-surface-lowest px-5 py-4 md:flex-row md:items-center md:justify-between">
      {/* Status */}
      <div className="flex items-center gap-3">
        <span className="relative flex h-9 w-9 flex-none items-center justify-center rounded-control bg-surface-container">
          <Stethoscope size={18} className={status.tone} />
          <span
            className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-pill ring-2 ring-surface-lowest ${status.dot}`}
          />
        </span>
        <div>
          <p className={`font-display text-title-card ${status.tone}`}>{status.label}</p>
          <p className="text-body-sm text-on-surface-variant">{status.hint}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Start Consultation — sirf jab koi current patient nahi hai */}
        {opdStarted && !opdPaused && !currentAppointment && (
          <button onClick={handleStartConsultation} disabled={loading} className={secondaryBtn}>
            <Play size={16} />
            Start Consultation
          </button>
        )}

        {/* Pause — sirf jab consultation chal rahi ho */}
        {opdStarted && !opdPaused && currentAppointment && (
          <button onClick={handlePauseConsultation} disabled={loading} className={secondaryBtn}>
            <CirclePause size={16} />
            Pause Consultation
          </button>
        )}

        {/* Resume — sirf jab paused ho */}
        {opdStarted && opdPaused && (
          <button onClick={handleResumeConsultation} disabled={loading} className={secondaryBtn}>
            <Play size={16} />
            Resume Consultation
          </button>
        )}

        {/* Start / Stop OPD — hamesha visible */}
        <button
          onClick={handleOPDToggle}
          disabled={loading}
          className={`inline-flex items-center gap-2 rounded-control px-5 py-2.5 text-body-md font-semibold transition disabled:opacity-50 ${
            opdStarted
              ? "bg-error text-on-error hover:brightness-110"
              : "bg-primary text-on-primary hover:brightness-110"
          }`}
        >
          <Power size={16} />
          {opdStarted ? "Stop OPD" : "Start OPD"}
        </button>
      </div>
    </div>
  );
};

export default OPDControls;
