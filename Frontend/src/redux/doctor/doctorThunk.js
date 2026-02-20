import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchDoctorProfile = createAsyncThunk(
    //sliceName/actionName
  "doctor/fetchDoctorProfile",
  async (_, { rejectWithValue }) => {
    //👉 _ ka matlab:
// "Thunk ko koi parameter nahi mil raha
    try {
      const res = await api.get("/doctors/me");
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error");
    }
  }
);
export const fetchTodayStats = createAsyncThunk(
  "appointment/fetchTodayStats",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/appointments/today-stats");
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Error");
    }
  }
);
export const fetchTodayAppointments = createAsyncThunk(
  "appointment/fetchTodayAppointments",
  async () => {
    const res = await api.get("/appointments/today");
    return res.data.patients;
  }
);
export const toggleDoctorOnline = createAsyncThunk(
  "doctor/toggleOnline",
  async(_,{rejectWithValue})=>{
    try{
      const res = await api.patch("/doctors/toggle-online");
      return {
        isOnline: res.data.isOnline   // ⭐ mapping
      };

    }catch(error){
      return rejectWithValue(error.response?.data || "Error");
    }
  }
);

export const toggleDoctorOpd = createAsyncThunk(
  "doctor/toggleOpd",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.patch("/doctors/toggle-opd");
      return {
        opdStarted: res.data.opdStarted
      };

    } catch (error) {
      return rejectWithValue(error.response?.data || "Error");
    }
  }
);

