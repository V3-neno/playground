import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles'
import './workshop/workshop.css'
import './workshop/views.css'
import App from './workshop/App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
