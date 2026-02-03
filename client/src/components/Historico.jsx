import { useState, useEffect } from 'react'
import './Historico.css'

export default function Historico({ API_BASE }) {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    let cancelled = false
    setCarregando(true)
    setErro(null)
    fetch(`${API_BASE}/registros`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setLista(Array.isArray(data) ? data : data.registros || [])
      })
      .catch((err) => {
        if (!cancelled) setErro(err.message || 'Erro ao carregar histórico.')
      })
      .finally(() => {
        if (!cancelled) setCarregando(false)
      })
    return () => { cancelled = true }
  }, [API_BASE])

  if (carregando) {
    return (
      <div className="card">
        <p className="historico-msg">Carregando histórico...</p>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="card">
        <p className="historico-msg error">{erro}</p>
      </div>
    )
  }

  if (lista.length === 0) {
    return (
      <div className="card">
        <p className="historico-msg">Nenhum registro ainda.</p>
      </div>
    )
  }

  return (
    <div className="historico">
      <div className="card">
        <h2>Últimos registros</h2>
        <ul className="historico-lista">
          {lista.map((item) => (
            <li key={item.id} className="historico-item">
              <span className="item-pessoa">{item.pessoa}</span>
              <span className="item-op">{item.operacao}</span>
              <span className="item-fluxo">{item.fluxo}</span>
              {item.nfc && (
                <span className="item-nfc" title="NFC">{item.nfc}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
