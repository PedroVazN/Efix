import { useState, useEffect, useMemo } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts'
import './Dashboard.css'

const CORES = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0']

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

    const dadosOperacao = [
      { name: 'Pegar', value: porOperacao.pegar || 0, fill: CORES[0] },
      { name: 'Entregar', value: porOperacao.entregar || 0, fill: CORES[1] }
    ]
    const dadosNfc = [
      { name: 'Com NFC', value: comNfc, fill: CORES[0] },
      { name: 'Sem NFC', value: total - comNfc, fill: '#94a3b8' }
    ]
    const dadosFluxo = Object.entries(porFluxo)
      .sort((a, b) => b[1] - a[1])
      .map(([nome, qtd]) => ({ name: nome.length > 20 ? nome.slice(0, 20) + '…' : nome, quantidade: qtd }))
    const dadosPessoa = Object.entries(porPessoa)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([nome, qtd]) => ({ name: nome, quantidade: qtd }))
    const dadosDia = Object.entries(porDia)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([dia, qtd]) => ({ dia: formatarDia(dia), quantidade: qtd }))

    return {
      total,
      porOperacao,
      comNfc,
      semNfc: total - comNfc,
      dadosOperacao,
      dadosNfc,
      dadosFluxo,
      dadosPessoa,
      dadosDia
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

  const { total, porOperacao, comNfc, dadosOperacao, dadosNfc, dadosFluxo, dadosPessoa, dadosDia } = stats

  return (
    <div className="dashboard">
      <section className="dashboard-cards">
        <div className="stat-card">
          <span className="stat-value">{total}</span>
          <span className="stat-label">Total</span>
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

      <div className="card dashboard-card chart-card">
        <h2>Operações (Pegar vs Entregar)</h2>
        <div className="chart-wrap chart-wrap-pie">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
              <Pie
                data={dadosOperacao}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="38%"
                outerRadius="62%"
                paddingAngle={2}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {dadosOperacao.map((_, i) => (
                  <Cell key={i} fill={dadosOperacao[i].fill} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [v, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card dashboard-card chart-card">
        <h2>NFC (com vs sem tag)</h2>
        <div className="chart-wrap chart-wrap-pie">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
              <Pie
                data={dadosNfc}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="38%"
                outerRadius="62%"
                paddingAngle={2}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {dadosNfc.map((_, i) => (
                  <Cell key={i} fill={dadosNfc[i].fill} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [v, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card dashboard-card chart-card">
        <h2>Registros por fluxo</h2>
        <div className="chart-wrap chart-wrap-bar-h">
          <ResponsiveContainer width="100%" height={Math.min(400, Math.max(220, dadosFluxo.length * 32 + 40))}>
            <BarChart
              data={dadosFluxo}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 4, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={88} tick={{ fill: 'var(--text)', fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border-light)' }} />
              <Bar dataKey="quantidade" fill="#059669" radius={[0, 6, 6, 0]} name="Registros" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card dashboard-card chart-card">
        <h2>Registros por pessoa</h2>
        <div className="chart-wrap chart-wrap-bar-v">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dadosPessoa} margin={{ top: 8, right: 8, left: 8, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                angle={-40}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} width={28} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border-light)' }} />
              <Bar dataKey="quantidade" fill="#10b981" radius={[6, 6, 0, 0]} name="Registros" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {dadosDia.length > 0 && (
        <div className="card dashboard-card chart-card">
          <h2>Registros por dia</h2>
          <div className="chart-wrap chart-wrap-line">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={dadosDia} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="dia" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} width={28} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border-light)' }} />
                <Line type="monotone" dataKey="quantidade" stroke="#059669" strokeWidth={2.5} dot={{ fill: '#059669', r: 3 }} name="Registros" />
              </LineChart>
            </ResponsiveContainer>
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
