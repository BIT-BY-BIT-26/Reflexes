import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  opdStarted: false,
  opdPaused: false,
  consultationStarted: false,
  appointments: [],
}

const opdSlice = createSlice({
  name: 'opd',
  initialState,
  reducers: {
    setOpdStarted: (state, action) => {
      state.opdStarted = action.payload
    },
    setOpdPaused: (state, action) => {
      state.opdPaused = action.payload
    },
    setConsultationStarted: (state, action) => {
      state.consultationStarted = action.payload
    },
    setAppointments: (state, action) => {
      state.appointments = action.payload
    },
    removeAppointment: (state, action) => {
      state.appointments = state.appointments.filter((a) => a._id !== action.payload)
    },
    completeAppointment: (state, action) => {
      const id = action.payload
      state.appointments = state.appointments.map((a) =>
        a._id === id ? { ...a, status: 'COMPLETED' } : a   // ✅ return ab implicit hai (no braces)
      )
    },
    resetOpd: () => initialState,
  },
})

export const {
  setOpdStarted,
  setOpdPaused,
  setConsultationStarted,
  setAppointments,
  removeAppointment,
  completeAppointment,
  resetOpd,
} = opdSlice.actions

export default opdSlice.reducer