import { useState } from 'react'
import FluxoForm from './components/FluxoForm'
import Historico from './components/Historico'
import Dashboard from './components/Dashboard'
import IntegracoesBI from './components/IntegracoesBI'
import RastrearPallet from './components/RastrearPallet'
import './App.css'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export { API_BASE }

export default function App() {
  const [aba, setAba] = useState('registro')
  const [refreshHistorico, setRefreshHistorico] = useState(0)

  const onRegistroSalvo = () => {
    setRefreshHistorico((n) => n + 1)
  }

  const navItems = [
    { id: 'registro', label: 'Registrar', short: 'Registrar', icon: 'M12 5v14M5 12h14' },
    { id: 'historico', label: 'Histórico', short: 'Histórico', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { id: 'rastrear', label: 'Rastrear pallet', short: 'Pallet', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { id: 'dashboard', label: 'Dashboard', short: 'Dashboard', icon: 'M3 12h2v8H3v-8zm4-4h2v12H7V8zm4-6h2v18h-2V2zm4 4h2v14h-2V6z' },
    { id: 'bi', label: 'Integrações BI', short: 'BI', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.172-1.172a4 4 0 105.656-5.656l4-4z' }
  ]

  return (
    <div className="app">
      <header className="header">
        <h1>eLoger NFC</h1>
      </header>
      <main className="main">
        {aba === 'registro' && (
          <FluxoForm API_BASE={API_BASE} onSalvo={onRegistroSalvo} />
        )}
        {aba === 'historico' && (
          <Historico API_BASE={API_BASE} key={refreshHistorico} />
        )}
        {aba === 'rastrear' && <RastrearPallet API_BASE={API_BASE} />}
        {aba === 'dashboard' && (
          <Dashboard API_BASE={API_BASE} key={refreshHistorico} />
        )}
        {aba === 'bi' && <IntegracoesBI />}
      </main>
      <nav className="bottom-nav" aria-label="Navegação do app">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`bottom-nav-item ${aba === item.id ? 'active' : ''}`}
            onClick={() => setAba(item.id)}
            aria-current={aba === item.id ? 'page' : undefined}
          >
            <span className="bottom-nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
            </span>
            <span className="bottom-nav-label full">{item.label}</span>
            <span className="bottom-nav-label short">{item.short}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
