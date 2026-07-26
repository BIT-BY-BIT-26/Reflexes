import { useState } from 'react'
import './App.css'
import AppRoutes from './Routes/AppRoutes'
import { useThemeSync } from './hooks/useThemeSync'
import { ToastContainer } from 'react-toastify'

function App() {
useThemeSync()
  return (
     <>
     <AppRoutes />
     <ToastContainer
      position='top-right'
      autoClose={3000}
      theme='dark'
     >
      
     </ToastContainer>
     </>
  )
}

export default App
