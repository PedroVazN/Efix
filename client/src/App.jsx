import { useState } from 'react'
import FluxoForm from './components/FluxoForm'
import Historico from './components/Historico'
import Dashboard from './components/Dashboard'
import './App.css'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export { API_BASE }

export default function App() {
  const [aba, setAba] = useState('registro')
  const [refreshHistorico, setRefreshHistorico] = useState(0)

  const onRegistroSalvo = () => {
    setRefreshHistorico((n) => n + 1)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>eLoger NFC</h1>
        <nav className="tabs">
          <button
            className={aba === 'registro' ? 'active' : ''}
            onClick={() => setAba('registro')}
          >
            Registrar
          </button>
          <button
            className={aba === 'historico' ? 'active' : ''}
            onClick={() => setAba('historico')}
          >
            Histórico
          </button>
          <button
            className={aba === 'dashboard' ? 'active' : ''}
            onClick={() => setAba('dashboard')}
          >
            Dashboard
          </button>
        </nav>
      </header>
      <main className="main">
        {aba === 'registro' && (
          <FluxoForm API_BASE={API_BASE} onSalvo={onRegistroSalvo} />
        )}
        {aba === 'historico' && (
          <Historico API_BASE={API_BASE} key={refreshHistorico} />
        )}
        {aba === 'dashboard' && (
          <Dashboard API_BASE={API_BASE} key={refreshHistorico} />
        )}
      </main>
    </div>
  )
}
