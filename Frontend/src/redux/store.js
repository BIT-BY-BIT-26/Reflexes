import { configureStore } from "@reduxjs/toolkit";
import doctorReducer from "./doctor/doctorSlice";
import appointmentReducer from "./doctor/appointmentSlice";
export const store = configureStore({
    reducer:{
        doctor:doctorReducer,
        appointment:appointmentReducer
    },
});