import { createSlice } from "@reduxjs/toolkit";
import { fetchTodayAppointments, fetchTodayStats } from "./doctorThunk";

const appointmentSlice = createSlice({
    name:"appointment",
    initialState:{
        stats:{
            total:0,
            pending:0,
            confirmed:0,
            cancelled:0
        },
        todayAppointments:[]
    },
    reducers:{
        setStats:(state,action)=>{
            state.stats = action.payload;
        },
        addAppointment:(state,action)=>{
            state.todayAppointments.unshift(action.payload);
            state.stats.total+=1;
            state.stats.pending+=1;
        }
    },
    extraReducers:(builder)=>{
        builder.addCase(fetchTodayStats.fulfilled,(state,action)=>{
            state.stats = action.payload;
        })

        builder.addCase(fetchTodayAppointments.fulfilled,(state,action)=>{
            state.todayAppointments  = action.payload.filter(
                appt => appt.status !== "COMPLETED"
            );
        });
    }
})

export const {setStats,addAppointment} = appointmentSlice.actions;
export default appointmentSlice.reducer;