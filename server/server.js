import express from 'express'
import cors from 'cors'
import initSqlJs from 'sql.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, 'nfc_fluxo.db')
const clientDist = join(__dirname, 'public')

const SQL = await initSqlJs()
let db

if (existsSync(dbPath)) {
  const buffer = readFileSync(dbPath)
  db = new SQL.Database(buffer)
} else {
  db = new SQL.Database()
}

db.run(`
  CREATE TABLE IF NOT EXISTS registros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pessoa TEXT NOT NULL,
    operacao TEXT NOT NULL,
    fluxo TEXT NOT NULL,
    nfc TEXT,
    dataHora TEXT NOT NULL,
    criadoEm TEXT DEFAULT (datetime('now'))
  )
`)

function salvarBanco() {
  try {
    const data = db.export()
    const buffer = Buffer.from(data)
    writeFileSync(dbPath, buffer)
  } catch (err) {
    console.error('Erro ao salvar banco em disco:', err.message)
    throw err
  }
}

if (!existsSync(dbPath)) {
  salvarBanco()
}

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/registros', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT id, pessoa, operacao, fluxo, nfc, dataHora
      FROM registros
      ORDER BY id DESC
      LIMIT 200
    `)
    const rows = []
    while (stmt.step()) {
      rows.push(stmt.getAsObject())
    }
    stmt.free()
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

/** 20 registros para injetar no DB (dashboard) */
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

app.post('/api/seed', (req, res) => {
  try {
    const stmt = db.prepare(
      `INSERT INTO registros (pessoa, operacao, fluxo, nfc, dataHora) VALUES (?, ?, ?, ?, ?)`
    )
    REGISTROS_SEED.forEach((r, i) => {
      stmt.run([
        r.pessoa,
        r.operacao,
        r.fluxo,
        r.nfc,
        dataHoraParaRegistro(i, REGISTROS_SEED.length)
      ])
    })
    stmt.free()
    salvarBanco()
    console.log(`${REGISTROS_SEED.length} registros injetados no banco.`)
    res.json({ ok: true, inseridos: REGISTROS_SEED.length })
  } catch (err) {
    console.error('Erro ao injetar seed:', err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/registros', (req, res) => {
  try {
    const { pessoa, operacao, fluxo, nfc, dataHora } = req.body
    if (!pessoa || !operacao || !fluxo) {
      return res.status(400).json({ error: 'pessoa, operacao e fluxo são obrigatórios' })
    }
    const data = dataHora || new Date().toISOString()
    const pessoaStr = String(pessoa).trim()
    const nfcVal = nfc != null && nfc !== '' ? String(nfc) : null

    const stmt = db.prepare(
      `INSERT INTO registros (pessoa, operacao, fluxo, nfc, dataHora) VALUES (?, ?, ?, ?, ?)`
    )
    stmt.run([pessoaStr, String(operacao), String(fluxo), nfcVal, data])
    stmt.free()

    const result = db.exec('SELECT last_insert_rowid() as id')
    const id = result[0] && result[0].values[0] ? result[0].values[0][0] : null
    salvarBanco()
    console.log('Registro salvo no banco:', { id, pessoa: pessoaStr, operacao, fluxo })
    res.status(201).json({
      id,
      pessoa: pessoaStr,
      operacao,
      fluxo,
      nfc: nfcVal,
      dataHora: data
    })
  } catch (err) {
    console.error('Erro ao salvar registro:', err)
    res.status(500).json({ error: err.message })
  }
})

if (existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(join(clientDist, 'index.html'))
  })
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})
