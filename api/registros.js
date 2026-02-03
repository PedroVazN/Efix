const { getDb, ensureTable } = require('./db')

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

module.exports = async (req, res) => {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const db = getDb()
    await ensureTable(db)

    if (req.method === 'GET') {
      const result = await db.execute(
        `SELECT id, pessoa, operacao, fluxo, nfc, dataHora
         FROM registros ORDER BY id DESC LIMIT 200`
      )
      const rows = (result.rows || []).map((r) => ({
        id: r.id ?? r[0],
        pessoa: r.pessoa ?? r[1],
        operacao: r.operacao ?? r[2],
        fluxo: r.fluxo ?? r[3],
        nfc: r.nfc ?? r[4],
        dataHora: r.dataHora ?? r[5]
      }))
      return res.status(200).json(rows)
    }

    if (req.method === 'POST') {
      const { pessoa, operacao, fluxo, nfc, dataHora } = req.body || {}
      if (!pessoa || !operacao || !fluxo) {
        return res.status(400).json({ error: 'pessoa, operacao e fluxo são obrigatórios' })
      }
      const data = dataHora || new Date().toISOString()
      const pessoaStr = String(pessoa).trim()
      const nfcVal = nfc != null && nfc !== '' ? String(nfc) : null

      await db.execute(
        `INSERT INTO registros (pessoa, operacao, fluxo, nfc, dataHora)
         VALUES (?, ?, ?, ?, ?)`,
        [pessoaStr, String(operacao), String(fluxo), nfcVal, data]
      )
      const id = undefined
      return res.status(201).json({
        id,
        pessoa: pessoaStr,
        operacao,
        fluxo,
        nfc: nfcVal,
        dataHora: data
      })
    }

    return res.status(405).json({ error: 'Método não permitido' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
