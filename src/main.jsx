import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import OwnerRoom from './features/owner-room/OwnerRoom.jsx'

// react-router等は導入せず、/owner-room だけを最小限のパス判定で切り替える。
const isOwnerRoom = window.location.pathname.replace(/\/+$/, '') === '/owner-room'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isOwnerRoom ? <OwnerRoom /> : <App />}
  </StrictMode>,
)
