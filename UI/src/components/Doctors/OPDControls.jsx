import React, { useState } from "react";
import { startConsultation, startOPD, stopConsultation } from "../../api/backend";


const OPDControls = ({
  opdStarted,
  opdPaused,
  consultationStarted,
  setOpdStarted,
  setOpdPaused,
  setConsultationStarted
}) => {

  const [loading, setLoading] = useState(false);

   const handleOPDToggle = async () => {
    try {
      setLoading(true);

      if (!opdStarted) {
        await startOPD();
        setOpdStarted(true);
      } else {
        await startOPD();
        setOpdStarted(false);
        setOpdPaused(false);
        setConsultationStarted(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


  const handleStartConsultation = async () => {
    try {
      setLoading(true);

      await stopConsultation();
      setOpdPaused(true);
        setConsultationStarted(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


  const handleResumeConsultation = async () => {
    try {
      setLoading(true);

      await resumeConsultation();

      setOpdPaused(false);
      setConsultationStarted(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


    const handleStopConsultation = async () => {
    try {
      setLoading(true);

      await stopConsultation();

      setOpdPaused(true);
      setConsultationStarted(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

 return (
    <div className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl shadow">

      <button
        onClick={handleOPDToggle}
        disabled={loading}
        className={`px-6 py-3 rounded-lg text-white font-medium ${
          opdStarted
            ? "bg-red-600 hover:bg-red-700"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {opdStarted ? "Stop OPD" : "Start OPD"}
      </button>

      <button
        onClick={handleStartConsultation}
        disabled={!opdStarted || opdPaused || consultationStarted || loading}
        className="px-6 py-3 rounded-lg bg-green-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Start Consultation
      </button>

      <button
        onClick={handleStopConsultation}
        disabled={!opdStarted || !consultationStarted || loading}
        className="px-6 py-3 rounded-lg bg-yellow-500 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Stop Consultation
      </button>

      <button
        onClick={handleResumeConsultation}
        disabled={!opdStarted || !opdPaused || loading}
        className="px-6 py-3 rounded-lg bg-green-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Resume Consultation
      </button>

    </div>
  );
};

export default OPDControls;