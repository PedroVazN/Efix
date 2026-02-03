import { useState, useEffect, useMemo } from 'react'
import './Dashboard.css'

export default function Dashboard({ API_BASE }) {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const carregarRegistros = () => {
    setCarregando(true)
    setErro(null)
    fetch(`${API_BASE}/registros`)
      .then((r) => r.json())
      .then((data) => setLista(Array.isArray(data) ? data : data.registros || []))
      .catch((err) => setErro(err.message || 'Erro ao carregar dados.'))
      .finally(() => setCarregando(false))
  }

  useEffect(() => {
    carregarRegistros()
  }, [API_BASE])

  const stats = useMemo(() => {
    const total = lista.length
    const porOperacao = { pegar: 0, entregar: 0 }
    const porFluxo = {}
    const porPessoa = {}
    let comNfc = 0
    const porDia = {}

    lista.forEach((r) => {
      porOperacao[r.operacao] = (porOperacao[r.operacao] || 0) + 1
      porFluxo[r.fluxo] = (porFluxo[r.fluxo] || 0) + 1
      porPessoa[r.pessoa] = (porPessoa[r.pessoa] || 0) + 1
      if (r.nfc) comNfc++
      if (r.dataHora) {
        const dia = r.dataHora.slice(0, 10)
        porDia[dia] = (porDia[dia] || 0) + 1
      }
    })

    const maxFluxo = Math.max(0, ...Object.values(porFluxo))
    const maxPessoa = Math.max(0, ...Object.values(porPessoa))
    const diasOrdenados = Object.entries(porDia).sort((a, b) => a[0].localeCompare(b[0]))
    const maxDia = Math.max(0, ...diasOrdenados.map(([, n]) => n))

    return {
      total,
      porOperacao,
      porFluxo,
      porPessoa,
      comNfc,
      semNfc: total - comNfc,
      porDia: diasOrdenados,
      maxFluxo,
      maxPessoa,
      maxDia
    }
  }, [lista])

  if (carregando) {
    return (
      <div className="dashboard">
        <div className="card"><p className="dashboard-msg">Carregando dashboard...</p></div>
      </div>
    )
  }
  if (erro) {
    return (
      <div className="dashboard">
        <div className="card"><p className="dashboard-msg error">{erro}</p></div>
      </div>
    )
  }

  const { total, porOperacao, porFluxo, porPessoa, comNfc, semNfc, porDia, maxFluxo, maxPessoa, maxDia } = stats

  return (
    <div className="dashboard">
      <section className="dashboard-cards">
        <div className="stat-card">
          <span className="stat-value">{total}</span>
          <span className="stat-label">Total de registros</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{porOperacao.pegar || 0}</span>
          <span className="stat-label">Pegar</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{porOperacao.entregar || 0}</span>
          <span className="stat-label">Entregar</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{comNfc}</span>
          <span className="stat-label">Com NFC</span>
        </div>
      </section>

      <div className="card dashboard-card">
        <h2>Operações (Pegar vs Entregar)</h2>
        <div className="chart-bars horizontal">
          <div className="chart-row">
            <span className="chart-label">Pegar</span>
            <div className="chart-track">
              <div
                className="chart-bar accent"
                style={{ width: total ? `${(porOperacao.pegar / total) * 100}%` : 0 }}
              />
            </div>
            <span className="chart-value">{porOperacao.pegar || 0}</span>
          </div>
          <div className="chart-row">
            <span className="chart-label">Entregar</span>
            <div className="chart-track">
              <div
                className="chart-bar accent"
                style={{ width: total ? `${(porOperacao.entregar / total) * 100}%` : 0 }}
              />
            </div>
            <span className="chart-value">{porOperacao.entregar || 0}</span>
          </div>
        </div>
      </div>

      <div className="card dashboard-card">
        <h2>Registros por fluxo</h2>
        <div className="chart-bars horizontal">
          {Object.entries(porFluxo)
            .sort((a, b) => b[1] - a[1])
            .map(([nome, qtd]) => (
              <div key={nome} className="chart-row">
                <span className="chart-label" title={nome}>{nome.length > 22 ? nome.slice(0, 22) + '…' : nome}</span>
                <div className="chart-track">
                  <div
                    className="chart-bar"
                    style={{ width: maxFluxo ? `${(qtd / maxFluxo) * 100}%` : 0 }}
                  />
                </div>
                <span className="chart-value">{qtd}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="card dashboard-card">
        <h2>Registros por pessoa</h2>
        <div className="chart-bars horizontal">
          {Object.entries(porPessoa)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([nome, qtd]) => (
              <div key={nome} className="chart-row">
                <span className="chart-label">{nome}</span>
                <div className="chart-track">
                  <div
                    className="chart-bar"
                    style={{ width: maxPessoa ? `${(qtd / maxPessoa) * 100}%` : 0 }}
                  />
                </div>
                <span className="chart-value">{qtd}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="card dashboard-card">
        <h2>NFC (com vs sem tag)</h2>
        <div className="chart-bars horizontal">
          <div className="chart-row">
            <span className="chart-label">Com NFC</span>
            <div className="chart-track">
              <div
                className="chart-bar accent"
                style={{ width: total ? `${(comNfc / total) * 100}%` : 0 }}
              />
            </div>
            <span className="chart-value">{comNfc}</span>
          </div>
          <div className="chart-row">
            <span className="chart-label">Sem NFC</span>
            <div className="chart-track">
              <div
                className="chart-bar muted"
                style={{ width: total ? `${(semNfc / total) * 100}%` : 0 }}
              />
            </div>
            <span className="chart-value">{semNfc}</span>
          </div>
        </div>
      </div>

      {porDia.length > 0 && (
        <div className="card dashboard-card">
          <h2>Registros por dia</h2>
          <div className="chart-bars horizontal compact">
            {porDia.slice(-14).map(([dia, qtd]) => (
              <div key={dia} className="chart-row">
                <span className="chart-label">{formatarDia(dia)}</span>
                <div className="chart-track">
                  <div
                    className="chart-bar"
                    style={{ width: maxDia ? `${(qtd / maxDia) * 100}%` : 0 }}
                  />
                </div>
                <span className="chart-value">{qtd}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="card">
          <p className="dashboard-msg">Nenhum registro ainda. Use &quot;Registrar&quot; para adicionar.</p>
        </div>
      )}
    </div>
  )
}

function formatarDia(iso) {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}
