const { getDb, ensureTable } = require('./db')

const REGISTROS_SEED = [
  { pessoa: 'Ana Costa', operacao: 'pegar', fluxo: 'Produção para Central', nfc: 'TAG-001' },
  { pessoa: 'Carlos Souza', operacao: 'entregar', fluxo: 'Central para Armazém', nfc: 'TAG-002' },
  { pessoa: 'Fernanda Lima', operacao: 'pegar', fluxo: 'Decoração para Central', nfc: null },
  { pessoa: 'João Silva', operacao: 'entregar', fluxo: 'Armazém para Estoque', nfc: 'NFC-A1' },
  { pessoa: 'Maria Santos', operacao: 'pegar', fluxo: 'Produção para Decoração', nfc: null },
  { pessoa: 'Pedro Oliveira', operacao: 'entregar', fluxo: 'Estoque para Armazém', nfc: 'TAG-003' },
  { pessoa: 'Rafaela Mendes', operacao: 'pegar', fluxo: 'Armazém para Central', nfc: 'NFC-B2' },
  { pessoa: 'Ricardo Alves', operacao: 'entregar', fluxo: 'Central para Decoração', nfc: null },
  { pessoa: 'Juliana Pereira', operacao: 'pegar', fluxo: 'Produção para Central', nfc: 'TAG-001' },
  { pessoa: 'Lucas Ferreira', operacao: 'entregar', fluxo: 'Decoração para Central', nfc: null },
  { pessoa: 'Ana Costa', operacao: 'entregar', fluxo: 'Central para Armazém', nfc: 'TAG-002' },
  { pessoa: 'Maria Santos', operacao: 'pegar', fluxo: 'Armazém para Estoque', nfc: null },
  { pessoa: 'Carlos Souza', operacao: 'pegar', fluxo: 'Produção para Decoração', nfc: 'NFC-A1' },
  { pessoa: 'Pedro Oliveira', operacao: 'entregar', fluxo: 'Armazém para Central', nfc: null },
  { pessoa: 'Fernanda Lima', operacao: 'pegar', fluxo: 'Central para Decoração', nfc: 'TAG-003' },
  { pessoa: 'João Silva', operacao: 'entregar', fluxo: 'Estoque para Armazém', nfc: null },
  { pessoa: 'Rafaela Mendes', operacao: 'pegar', fluxo: 'Decoração para Central', nfc: 'NFC-B2' },
  { pessoa: 'Lucas Ferreira', operacao: 'entregar', fluxo: 'Produção para Central', nfc: null },
  { pessoa: 'Ricardo Alves', operacao: 'pegar', fluxo: 'Central para Armazém', nfc: 'TAG-001' },
  { pessoa: 'Juliana Pereira', operacao: 'entregar', fluxo: 'Armazém para Estoque', nfc: null }
]

function dataHoraParaRegistro(index, total) {
  const d = new Date()
  const diasAtras = Math.floor((index / total) * 14)
  d.setDate(d.getDate() - diasAtras)
  d.setHours(7 + (index % 10), (index * 3) % 60, 0, 0)
  return d.toISOString()
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

module.exports = async (req, res) => {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  try {
    const db = getDb()
    await ensureTable(db)

    for (let i = 0; i < REGISTROS_SEED.length; i++) {
      const r = REGISTROS_SEED[i]
      await db.execute(
        `INSERT INTO registros (pessoa, operacao, fluxo, nfc, dataHora) VALUES (?, ?, ?, ?, ?)`,
        [r.pessoa, r.operacao, r.fluxo, r.nfc, dataHoraParaRegistro(i, REGISTROS_SEED.length)]
      )
    }
    return res.status(200).json({ ok: true, inseridos: REGISTROS_SEED.length })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
