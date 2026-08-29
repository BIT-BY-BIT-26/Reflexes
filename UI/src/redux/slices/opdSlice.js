import { createSlice } from '@reduxjs/toolkit'
const initialState = {
  opdStarted: false,
  opdPaused: false,
  currentAppointment: null,   // ⭐ boolean nahi, poora appointment object
  appointments: [],           // sirf waiting queue (CONFIRMED status)
}
const opdSlice = createSlice({
  name: 'opd',
  initialState,
  reducers: {
    setOpdStarted: (state, action) => { state.opdStarted = action.payload },
    setOpdPaused: (state, action) => { state.opdPaused = action.payload },
    setCurrentAppointment: (state, action) => { state.currentAppointment = action.payload },
    setAppointments: (state, action) => { state.appointments = action.payload },
    resetOpd: () => initialState,
  },
})
export const {
  setOpdStarted,
  setOpdPaused,
  setCurrentAppointment,
  setAppointments,
  resetOpd,
} = opdSlice.actions
export default opdSlice.reducer