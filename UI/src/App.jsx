import { useState } from 'react'
import './App.css'
import AppRoutes from './Routes/AppRoutes'
import { useThemeSync } from './hooks/useThemeSync'

function App() {
useThemeSync()
  return (
     <AppRoutes />
  )
}

export default App
