import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerPwa } from './pwa'
import './index.css'
import App from './App.tsx'

registerPwa()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
