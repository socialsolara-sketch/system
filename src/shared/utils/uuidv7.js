// Arquivo: src/shared/utils/uuidv7.js
// Descrição: Gerador de UUID versão 7 (RFC 9562) ordenado por tempo e criptograficamente seguro.

/**
 * Gera um UUID v7 com base na especificação RFC 9562.
 * Estrutura:
 * - 48 bits: Unix Epoch timestamp em milissegundos
 * - 4 bits: Versão (0111 = 7)
 * - 12 bits: Aleatoriedade / Fração de tempo
 * - 2 bits: Variante (10)
 * - 62 bits: Aleatoriedade
 * 
 * Formato retornado: xxxxxxxx-xxxx-7xxx-yxxx-xxxxxxxxxxxx
 * @returns {string} UUIDv7 único em caixa baixa (ou maiúscula se necessário)
 */
export function generateUUIDv7() {
  const now = Date.now()
  // 48 bits de timestamp em milissegundos convertidos para 12 dígitos hexadecimais
  const timeHex = now.toString(16).padStart(12, '0')
  
  // 10 bytes de aleatoriedade segura do navegador
  const randomBytes = new Uint8Array(10)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes)
  } else {
    for (let i = 0; i < 10; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256)
    }
  }

  // Versão 7: 4 bits '0111' + 12 bits de entropia
  const verAndRandA = (0x7000 | ((randomBytes[0] & 0x0f) << 8) | randomBytes[1]).toString(16).padStart(4, '0')
  
  // Variante 1: 2 bits '10' (0x80) + 14 bits de entropia
  const varAndRandB = (((0x80 | (randomBytes[2] & 0x3f)) << 8) | randomBytes[3]).toString(16).padStart(4, '0')
  
  // 6 bytes restantes (48 bits) de entropia aleatória
  let randC = ''
  for (let i = 4; i < 10; i++) {
    randC += randomBytes[i].toString(16).padStart(2, '0')
  }

  return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-${verAndRandA}-${varAndRandB}-${randC}`.toLowerCase()
}
