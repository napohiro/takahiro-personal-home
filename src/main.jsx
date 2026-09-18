import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import OwnerRoom from './features/owner-room/OwnerRoom.jsx'
import MemberPage from './features/member-page/MemberPage.jsx'

// react-router等は導入せず、パスだけを見た最小限の判定で切り替える。
const pathname = window.location.pathname.replace(/\/+$/, '')

function resolvePage() {
  if (pathname === '/owner-room') return <OwnerRoom />
  if (pathname === '/member') return <MemberPage />
  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {resolvePage()}
  </StrictMode>,
)
