import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { getAllDoctors } from "../../api/backend";
import { toggleTheme } from "../../redux/slices/themeSlice";

const DoctorStatus = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  const token = localStorage.getItem("token");

  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);

  // =========================================
  // Fetch all doctors
  // =========================================
  const fetchDoctors = async () => {
    try {
      setLoading(true);

      const response = await getAllDoctors();

      const doctorData =
        response.data.doctors || response.data;

      setDoctors(
        doctorData.map((doctor) => ({
          ...doctor,
          online: false,
        }))
      );

    } catch (error) {
      console.error(
        "Error fetching doctors:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // Socket connection
  // =========================================
  useEffect(() => {

    if (!token) {
      console.error("No token found");
      setLoading(false);
      return;
    }

    // First get all doctors
    fetchDoctors();

    // Create socket
    const socket = io("http://localhost:3000", {
      auth: {
        token,
      },
    });

    // =========================================
    // Admin socket connected
    // =========================================
    socket.on("connect", () => {

      console.log(
        "🟢 Admin socket connected:",
        socket.id
      );

      setSocketConnected(true);
    });

    // =========================================
    // Admin socket disconnected
    // =========================================
    socket.on("disconnect", () => {

      console.log(
        "🔴 Admin socket disconnected"
      );

      setSocketConnected(false);
    });

    // =========================================
    // Socket connection error
    // =========================================
    socket.on("connect_error", (error) => {

      console.error(
        "❌ Socket error:",
        error.message
      );

      setSocketConnected(false);
    });

    // =========================================
    // INITIAL DOCTOR STATUS
    // =========================================
    socket.on(
      "initial-doctor-status",
      ({ onlineDoctors }) => {

        console.log(
          "📋 Initial online doctors:",
          onlineDoctors
        );

        setDoctors((prevDoctors) => {

          return prevDoctors.map((doctor) => {

            const doctorId =
              doctor._id?.toString();

            return {
              ...doctor,
              online:
                onlineDoctors.includes(
                  doctorId
                ),
            };
          });

        });

      }
    );

    // =========================================
    // DOCTOR CAME ONLINE
    // =========================================
    socket.on(
      "doctor-online",
      ({ doctorId }) => {

        console.log(
          "🟢 Doctor online:",
          doctorId
        );

        setDoctors((prevDoctors) => {

          return prevDoctors.map((doctor) => {

            const currentDoctorId =
              doctor._id?.toString();

            if (
              currentDoctorId ===
              doctorId.toString()
            ) {

              return {
                ...doctor,
                online: true,
              };

            }

            return doctor;
          });

        });

      }
    );

    // =========================================
    // DOCTOR WENT OFFLINE
    // =========================================
    socket.on(
      "doctor-offline",
      ({ doctorId, lastSeen }) => {

        console.log(
          "🔴 Doctor offline:",
          doctorId
        );

        setDoctors((prevDoctors) => {

          return prevDoctors.map((doctor) => {

            const currentDoctorId =
              doctor._id?.toString();

            if (
              currentDoctorId ===
              doctorId.toString()
            ) {

              return {
                ...doctor,
                online: false,
                lastSeen,
              };

            }

            return doctor;
          });

        });

      }
    );

    // =========================================
    // CLEANUP
    // =========================================
    return () => {

      console.log(
        "Cleaning up admin socket..."
      );

      socket.disconnect();

    };

  }, []);

  // =========================================
  // Loading
  // =========================================
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-24 animate-pulse rounded-card bg-surface-container" />
        <div className="h-64 animate-pulse rounded-card bg-surface-container" />
      </div>
    );
  }

  // =========================================
  // Statistics
  // =========================================
  const totalDoctors = doctors.length;

  const onlineDoctors =
    doctors.filter(
      (doctor) => doctor.online
    ).length;

  const offlineDoctors =
    doctors.filter(
      (doctor) => !doctor.online
    ).length;

  // =========================================
  // UI
  // =========================================
  return (
    <section className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-headline-sm text-on-surface">Doctor status</h2>
          <p className="mt-0.5 text-body-md text-on-surface-variant">
            Monitor doctor availability in real time.
          </p>
        </div>

        {/* Admin socket status */}
        <span
          className={`inline-flex items-center gap-2 rounded-pill px-3 py-1.5 text-label-md font-medium ${
            socketConnected
              ? "bg-primary-container/20 text-primary"
              : "bg-error-container text-on-error-container"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-pill ${socketConnected ? "bg-primary" : "bg-error"}`}
          />
          {socketConnected ? "Live" : "Disconnected"}
        </span>
      </div>

      {/* Counts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-card border border-outline-variant bg-surface-lowest px-5 py-4">
          <p className="text-label-caps uppercase text-on-surface-variant">Total doctors</p>
          <p className="mt-1 font-display text-headline-lg text-on-surface tabular">
            {totalDoctors}
          </p>
        </div>

        <div className="rounded-card border border-outline-variant bg-surface-lowest px-5 py-4">
          <p className="text-label-caps uppercase text-on-surface-variant">Online</p>
          <p className="mt-1 font-display text-headline-lg text-primary tabular">
            {onlineDoctors}
          </p>
        </div>

        <div className="rounded-card border border-outline-variant bg-surface-lowest px-5 py-4">
          <p className="text-label-caps uppercase text-on-surface-variant">Offline</p>
          <p className="mt-1 font-display text-headline-lg text-on-surface-variant tabular">
            {offlineDoctors}
          </p>
        </div>
      </div>

      {/* Roster */}
      <div className="overflow-hidden rounded-card border border-outline-variant bg-surface-lowest">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="bg-surface-container">
                {["Doctor", "Department", "Status", "Last seen"].map((head) => (
                  <th
                    key={head}
                    className="border-b border-outline-variant px-5 py-2.5 text-label-caps uppercase text-on-surface-variant"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-5 py-12 text-center text-body-md text-on-surface-variant"
                  >
                    No doctors found.
                  </td>
                </tr>
              ) : (
                doctors.map((doctor) => (
                  <tr
                    key={doctor._id}
                    className="border-b border-outline-variant/70 transition last:border-b-0 hover:bg-surface-container"
                  >
                    {/* Doctor */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 flex-none items-center justify-center overflow-hidden rounded-pill bg-surface-high text-on-surface-variant">
                          {doctor.profile_photo ? (
                            <img
                              src={doctor.profile_photo}
                              alt={doctor.name || "Doctor"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="font-display text-title-card">
                              {(doctor.name || doctor.userId?.name || "D")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-body-md font-medium text-on-surface">
                            {doctor.name || doctor.userId?.name || "Unknown Doctor"}
                          </p>
                          <p className="truncate text-body-sm text-on-surface-variant">
                            {doctor.email || doctor.userId?.email || ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-5 py-3 text-body-md text-on-surface-variant">
                      {doctor.department?.name || doctor.department || "N/A"}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      {doctor.online ? (
                        <span className="inline-flex items-center gap-2 rounded-pill bg-primary-container/20 px-2.5 py-1 text-label-md font-medium text-primary">
                          <span className="h-2 w-2 rounded-pill bg-primary" />
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-pill bg-surface-high px-2.5 py-1 text-label-md font-medium text-on-surface-variant">
                          <span className="h-2 w-2 rounded-pill bg-outline" />
                          Offline
                        </span>
                      )}
                    </td>

                    {/* Last Seen */}
                    <td className="px-5 py-3 text-body-md text-on-surface-variant tabular">
                      {doctor.online
                        ? "Currently online"
                        : doctor.lastSeen
                        ? new Date(doctor.lastSeen).toLocaleString()
                        : "Never"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default DoctorStatus;
