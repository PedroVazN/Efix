import { useState, useEffect, useCallback } from 'react'
import { lerNFC } from '../nfc'
import './RastrearPallet.css'

function formatarDataHora(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function RastrearPallet({ API_BASE }) {
  const [nfcBusca, setNfcBusca] = useState('')
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [lendoNfc, setLendoNfc] = useState(false)
  const [msg, setMsg] = useState(null)

  const buscar = useCallback(() => {
    const valor = nfcBusca.trim()
    if (!valor) {
      setMsg({ tipo: 'error', texto: 'Informe o código NFC do pallet.' })
      return
    }
    setMsg(null)
    setCarregando(true)
    fetch(`${API_BASE}/registros`)
      .then((r) => r.json())
      .then((data) => {
        const todos = Array.isArray(data) ? data : data.registros || []
        const filtrado = todos
          .filter((r) => r.nfc && String(r.nfc).toLowerCase() === valor.toLowerCase())
          .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))
        setLista(filtrado)
        if (filtrado.length === 0) {
          setMsg({ tipo: 'error', texto: `Nenhum movimento encontrado para o pallet "${valor}".` })
        }
      })
      .catch((err) => setMsg({ tipo: 'error', texto: err.message || 'Erro ao buscar.' }))
      .finally(() => setCarregando(false))
  }, [API_BASE, nfcBusca])

  const handleLerNFC = useCallback(async () => {
    setMsg(null)
    if (!('NDEFReader' in window)) {
      setMsg({ tipo: 'error', texto: 'NFC não disponível. Use Chrome no Android com HTTPS.' })
      return
    }
    setLendoNfc(true)
    try {
      const valor = await lerNFC()
      setNfcBusca(valor)
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMsg({ tipo: 'error', texto: err.message || 'Erro ao ler NFC.' })
      }
    } finally {
      setLendoNfc(false)
    }
  }, [])

  return (
    <div className="rastrear-pallet">
      <div className="card">
        <h2>Onde está o pallet?</h2>
        <p className="rastrear-desc">
          Informe o código NFC do pallet (ou leia a tag) para ver todo o histórico de movimentos: quem pegou ou entregou, em qual fluxo e quando.
        </p>
        <div className="rastrear-input-group">
          <input
            type="text"
            className="input-text"
            placeholder="Ex: TAG-001 ou leia a tag"
            value={nfcBusca}
            onChange={(e) => setNfcBusca(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), buscar())}
          />
          <button
            type="button"
            className="btn btn-secondary btn-ler-nfc"
            onClick={handleLerNFC}
            disabled={lendoNfc}
          >
            {lendoNfc ? 'Lendo...' : 'Ler NFC'}
          </button>
        </div>
        <button type="button" className="btn btn-primary" onClick={buscar} disabled={carregando}>
          {carregando ? 'Buscando...' : 'Rastrear pallet'}
        </button>
      </div>

      {msg && <div className={`msg ${msg.tipo}`}>{msg.texto}</div>}

      {lista.length > 0 && (
        <div className="card">
          <h2>Histórico do pallet {nfcBusca.trim()}</h2>
          <p className="rastrear-total">{lista.length} movimento(s) registrado(s).</p>
          <ul className="rastrear-timeline">
            {lista.map((item, index) => (
              <li key={item.id} className="rastrear-item">
                <span className="rastrear-ordem">{index + 1}</span>
                <div className="rastrear-conteudo">
                  <span className="rastrear-pessoa">{item.pessoa}</span>
                  <span className="rastrear-op">{item.operacao === 'pegar' ? 'Pegou' : 'Entregou'}</span>
                  <span className="rastrear-fluxo">{item.fluxo}</span>
                  <time className="rastrear-data" dateTime={item.dataHora}>
                    {formatarDataHora(item.dataHora)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
