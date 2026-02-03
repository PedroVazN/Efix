import initSqlJs from 'sql.js'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, 'nfc_fluxo.db')

/** 20 registros variados para o dashboard: pessoas, operações, fluxos e NFC diferentes */
const REGISTROS = [
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

async function seed() {
  if (!existsSync(dbPath)) {
    console.log('Banco não encontrado. Rode o servidor primeiro uma vez para criar o banco.')
    process.exit(1)
  }
  const SQL = await initSqlJs()
  const buffer = readFileSync(dbPath)
  const db = new SQL.Database(buffer)

  const stmt = db.prepare(`
    INSERT INTO registros (pessoa, operacao, fluxo, nfc, dataHora) VALUES (?, ?, ?, ?, ?)
  `)
  REGISTROS.forEach((r, i) => {
    stmt.run(
      r.pessoa,
      r.operacao,
      r.fluxo,
      r.nfc,
      dataHoraParaRegistro(i, REGISTROS.length)
    )
  })
  stmt.free()

  const data = db.export()
  writeFileSync(dbPath, Buffer.from(data))
  console.log(`${REGISTROS.length} registros de teste inseridos com sucesso.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
