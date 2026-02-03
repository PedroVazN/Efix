const { createClient } = require('@libsql/client')

let client = null

function getDb() {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    throw new Error('TURSO_DATABASE_URL e TURSO_AUTH_TOKEN devem estar definidas no Vercel.')
  }
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    })
  }
  return client
}

async function ensureTable(db) {
  await db.execute(`
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
}

module.exports = { getDb, ensureTable }
