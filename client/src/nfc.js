/**
 * Web NFC API - funciona em Chrome para Android (HTTPS ou localhost).
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_NFC_API
 */
export function isNFCSupported() {
  return typeof window !== 'undefined' && 'NDEFReader' in window
}

export function lerNFC() {
  if (!isNFCSupported()) {
    return Promise.reject(new Error('NFC não suportado neste dispositivo/navegador.'))
  }

  return new Promise((resolve, reject) => {
    const reader = new window.NDEFReader()

    reader
      .scan({ signal: AbortSignal.timeout(30000) })
      .then(() => {
        reader.onreadingerror = () => {
          reject(new Error('Falha ao ler a tag NFC.'))
        }
        reader.onreading = ({ message }) => {
          try {
            const record = message.records[0]
            if (!record) {
              resolve('')
              return
            }
            let texto = ''
            if (record.recordType === 'text') {
              const dec = new TextDecoder(record.encoding || 'utf-8')
              texto = dec.decode(record.data)
            } else if (record.recordType === 'url') {
              const dec = new TextDecoder()
              texto = dec.decode(record.data)
            } else if (record.data) {
              const dec = new TextDecoder()
              texto = dec.decode(record.data)
            }
            resolve(texto || '(tag vazia)')
          } catch (e) {
            resolve(String(e.message))
          }
        }
      })
      .catch(reject)
  })
}
