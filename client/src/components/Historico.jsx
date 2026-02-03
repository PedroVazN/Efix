import { useState, useEffect } from 'react'
import './Historico.css'

function escapeCsv(val) {
  if (val == null) return ''
  const s = String(val)
  if (s.includes('"') || s.includes(',') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
  return s
}

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

function exportarExcel(lista) {
  const headers = ['Pessoa', 'Operação', 'Fluxo', 'NFC', 'Data e hora']
  const rows = lista.map((r) => [
    escapeCsv(r.pessoa),
    escapeCsv(r.operacao),
    escapeCsv(r.fluxo),
    escapeCsv(r.nfc || ''),
    escapeCsv(formatarDataHora(r.dataHora))
  ])
  const csv = '\uFEFF' + [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `eloger-registros-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Historico({ API_BASE }) {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [exportando, setExportando] = useState(false)

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
        <div className="historico-header">
          <h2>Últimos registros</h2>
          <button
            type="button"
            className="btn btn-export"
            onClick={() => {
              setExportando(true)
              exportarExcel(lista)
              setExportando(false)
            }}
            disabled={exportando || lista.length === 0}
          >
            {exportando ? 'Exportando...' : 'Exportar para Excel'}
          </button>
        </div>
        <ul className="historico-lista">
          {lista.map((item) => (
            <li key={item.id} className="historico-item">
              <span className="item-pessoa">{item.pessoa}</span>
              <span className="item-op">{item.operacao}</span>
              <span className="item-fluxo">{item.fluxo}</span>
              {item.nfc && (
                <span className="item-nfc" title="Pallet">Pallet: {item.nfc}</span>
              )}
              <span className="item-data-label">Data e hora</span>
              <time className="item-data" dateTime={item.dataHora}>{formatarDataHora(item.dataHora)}</time>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
