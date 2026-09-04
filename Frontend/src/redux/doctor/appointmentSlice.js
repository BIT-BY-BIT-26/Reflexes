import { createSlice } from "@reduxjs/toolkit";
import { fetchTodayAppointments, fetchTodayStats } from "./doctorThunk";

const appointmentSlice = createSlice({
    name: "appointment",
    initialState: {
        stats: {
            total: 0,
            pending: 0,
            confirmed: 0,
            cancelled: 0
        },
        todayAppointments: []
    },
    reducers: {
        setStats: (state, action) => {
            state.stats = action.payload;
        },
        addAppointment: (state, action) => {
            state.todayAppointments.unshift(action.payload);
            state.stats.total += 1;
            state.stats.pending += 1;
        },
        // NEW: single appointment ka status update karo, poori list refetch kiye bina
        updateAppointmentStatus: (state, action) => {
            const { appointmentId, status, token } = action.payload;
            const appt = state.todayAppointments.find(
                a => a.appointmentId === appointmentId
            );
            if (appt) {
                const prevStatus = appt.status;
                appt.status = status;
                if (token) appt.token = token;

                // stats bhi sync rakho
                if (prevStatus === "PENDING" && status === "CONFIRMED") {
                    state.stats.pending = Math.max(0, state.stats.pending - 1);
                    state.stats.confirmed += 1;
                }
            }

            // agar completed hua to list se hata do (jaise refetch filter karta hai)
            if (status === "COMPLETED") {
                state.todayAppointments = state.todayAppointments.filter(
                    a => a.appointmentId !== appointmentId
                );
            }
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTodayStats.fulfilled, (state, action) => {
            state.stats = action.payload;
        });

        builder.addCase(fetchTodayAppointments.fulfilled, (state, action) => {
            state.todayAppointments = action.payload.filter(
                appt => appt.status !== "COMPLETED"
            );
        });
    }
});

export const { setStats, addAppointment, updateAppointmentStatus } = appointmentSlice.actions;
export default appointmentSlice.reducer;