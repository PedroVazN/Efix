import { useState } from 'react'
import './IntegracoesBI.css'

const API_URL = typeof window !== 'undefined'
  ? `${window.location.origin}/api/registros`
  : ''

export default function IntegracoesBI() {
  const [copiado, setCopiado] = useState(false)

  const copiarUrl = () => {
    if (!API_URL) return
    navigator.clipboard.writeText(API_URL).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  return (
    <div className="integracoes-bi">
      <div className="card">
        <h2>URL da API (JSON)</h2>
        <p className="bi-desc">
          Use esta URL em ferramentas de BI para conectar aos dados. A API retorna um JSON com os campos: <code>id</code>, <code>pessoa</code>, <code>operacao</code>, <code>fluxo</code>, <code>nfc</code>, <code>dataHora</code>.
        </p>
        <div className="bi-url-box">
          <code className="bi-url">{API_URL}</code>
          <button type="button" className="btn btn-copiar" onClick={copiarUrl} disabled={!API_URL}>
            {copiado ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Power BI</h2>
        <ol className="bi-steps">
          <li>Em <strong>Obter dados</strong> → <strong>Web</strong>.</li>
          <li>Cole a URL da API acima e clique em <strong>OK</strong>.</li>
          <li>Selecione <strong>Lista</strong> (ou o registro que aparecer) e clique em <strong>Transformar dados</strong>.</li>
          <li>No Power Query, use <strong>Converter para Tabela</strong> se necessário e expanda as colunas.</li>
          <li>Feche e aplique para carregar no Power BI.</li>
        </ol>
      </div>

      <div className="card">
        <h2>Google Looker Studio</h2>
        <ol className="bi-steps">
          <li>Use um conector de <strong>API REST</strong> ou <strong>JSON</strong> (por ex.: conector da comunidade “API” ou “Supermetrics” para dados externos).</li>
          <li>Configure a URL da API como origem dos dados.</li>
          <li>Alternativa: exporte os dados em <strong>CSV</strong> na aba Histórico, importe no <strong>Google Sheets</strong> e no Looker Studio adicione uma fonte de dados do tipo <strong>Google Sheets</strong>.</li>
        </ol>
      </div>

      <div className="card">
        <h2>Excel / Google Sheets</h2>
        <p className="bi-desc">
          Na aba <strong>Histórico</strong>, use o botão <strong>Exportar para Excel</strong> para baixar um CSV. Abra no Excel ou importe no Google Sheets para análises ou como fonte para outros relatórios de BI.
        </p>
      </div>
    </div>
  )
}
