import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TaskBoard from './components/TaskBoard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TaskBoard/>
  </StrictMode>,
)
