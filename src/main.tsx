import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerPwa, requestPersistentStorage } from './pwa'
import './index.css'
import App from './App.tsx'

registerPwa()
void requestPersistentStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
