import { useState, useCallback } from 'react'
import { PESSOAS, OPERACOES, FLUXOS } from '../constants'
import { lerNFC } from '../nfc'
import './FluxoForm.css'

export default function FluxoForm({ API_BASE, onSalvo }) {
  const [pessoa, setPessoa] = useState('')
  const [operacao, setOperacao] = useState('')
  const [fluxo, setFluxo] = useState('')
  const [nfcLido, setNfcLido] = useState('')
  const [nfcAtivo, setNfcAtivo] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState({ tipo: null, texto: '' })

  const handleLerNFC = useCallback(async () => {
    setMsg({ tipo: null, texto: '' })
    if (!('NDEFReader' in window)) {
      setMsg({
        tipo: 'error',
        texto: 'NFC não disponível neste navegador. Use Chrome no Android com HTTPS.'
      })
      return
    }
    setNfcAtivo(true)
    try {
      const valor = await lerNFC()
      setNfcLido(valor)
      setMsg({ tipo: 'success', texto: 'NFC lido com sucesso!' })
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMsg({
          tipo: 'error',
          texto: err.message || 'Erro ao ler NFC. Aproxime a tag novamente.'
        })
      }
    } finally {
      setNfcAtivo(false)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg({ tipo: null, texto: '' })
    if (!pessoa) {
      setMsg({ tipo: 'error', texto: 'Escolha a pessoa.' })
      return
    }
    if (!operacao) {
      setMsg({ tipo: 'error', texto: 'Escolha a operação (Pegar ou Entregar).' })
      return
    }
    if (!fluxo) {
      setMsg({ tipo: 'error', texto: 'Escolha o fluxo.' })
      return
    }
    setSalvando(true)
    try {
      const res = await fetch(`${API_BASE}/registros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pessoa,
          operacao,
          fluxo,
          nfc: nfcLido || null,
          dataHora: new Date().toISOString()
        })
      })
      if (!res.ok) throw new Error('Falha ao salvar')
      setMsg({ tipo: 'success', texto: 'Registro salvo com sucesso!' })
      setPessoa('')
      setOperacao('')
      setFluxo('')
      setNfcLido('')
      onSalvo?.()
    } catch (err) {
      setMsg({
        tipo: 'error',
        texto: err.message || 'Erro ao salvar. Verifique se o servidor está rodando.'
      })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form className="fluxo-form" onSubmit={handleSubmit}>
      <div className="card">
        <h2>Pessoa</h2>
        <select
          className="select"
          value={pessoa}
          onChange={(e) => setPessoa(e.target.value)}
        >
          <option value="">Selecione a pessoa</option>
          {PESSOAS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        <h2>Operação</h2>
        <div className="options-grid">
          {OPERACOES.map((op) => (
            <button
              key={op.id}
              type="button"
              className={`option-btn ${operacao === op.id ? 'selected' : ''}`}
              onClick={() => setOperacao(op.id)}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Fluxo</h2>
        <select
          className="select"
          value={fluxo}
          onChange={(e) => setFluxo(e.target.value)}
        >
          <option value="">Selecione o fluxo</option>
          {FLUXOS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        <h2>NFC</h2>
        <p className="nfc-hint">
          Toque no botão e aproxime o celular da tag NFC.
        </p>
        <div
          className={`nfc-area ${nfcAtivo ? 'active' : ''} ${nfcLido ? 'read' : ''}`}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleLerNFC}
            disabled={nfcAtivo}
          >
            {nfcAtivo ? 'Aguardando NFC...' : 'Ativar e ler NFC'}
          </button>
          {nfcLido && <div className="nfc-value">{nfcLido}</div>}
        </div>
      </div>

      {msg.texto && (
        <div className={`msg ${msg.tipo}`}>{msg.texto}</div>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={salvando}
      >
        {salvando ? 'Salvando...' : 'Salvar registro'}
      </button>
    </form>
  )
}
