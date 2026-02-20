import { createSlice } from "@reduxjs/toolkit";
import { fetchDoctorProfile } from "./doctorThunk";
import { toggleDoctorOnline, toggleDoctorOpd } from "./doctorThunk";

const doctorSlice = createSlice({
    name:"doctor",
    initialState:{
        doctor:null,
        profileCompleted:false,
        loading:false,
        toggleLoading:false,
        error:null,
        isOnline:false,
        opdStarted:false
    },
    reducers:{
        clearDoctor:(state)=>{
            state.doctor=  null;
        },
        setOpdStarted:(state,action)=>{
            if(state.isOnline){
                state.opdStarted = action.payload;
            }
        }
    },
    // Yeh tumhare async API call ke liye hota hai.->extraReducers
    extraReducers: (builder) => {
    builder
//         👉 Jab API hit hoti hai
// 👉 Loading spinner show kar sakti ho
      .addCase(fetchDoctorProfile.pending, (state) => {
        state.loading = true;
      })

// Jab backend se data mil jata hai
      .addCase(fetchDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.doctor = action.payload.doctor;
        state.profileCompleted = action.payload.doctor.profileCompleted || false;
        state.isOnline = action.payload.doctor.isOnline;
        state.opdStarted = action.payload.doctor.opdStarted;

        if (!state.isOnline) {
          state.opdStarted = false;
        }
      })
      .addCase(toggleDoctorOnline.pending, (state) => {
        state.toggleLoading = true;
        })
      .addCase(toggleDoctorOnline.fulfilled ,(state,action)=>{
        state.toggleLoading = false;
        state.isOnline  = action.payload.isOnline ;

        if(!state.isOnline ){
            state.opdStarted = false;
        }
      })
      .addCase(toggleDoctorOnline.rejected, (state, action) => {
        state.toggleLoading = false;
        state.error = action.payload;
    })
    .addCase(toggleDoctorOpd.fulfilled, (state, action) => {
        state.opdStarted = action.payload.opdStarted;

        if (state.doctor) {
            state.doctor.opdStarted = action.payload.opdStarted;
        }
    })

  },

})

export const { clearDoctor, setOpdStarted } = doctorSlice.actions;
export default doctorSlice.reducer;