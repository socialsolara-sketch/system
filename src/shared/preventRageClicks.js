// Arquivo: src/shared/preventRageClicks.js
// Descrição: Guardião de cliques de dupla camada. Bloqueia apenas duplo clique acidental no MESMO elemento
// (cooldown curto de 320ms) e, opcionalmente, um cooldown global curto — desligado por padrão para não
// bloquear cliques em elementos diferentes, o que fazia a interface parecer travada.
// Garante idempotência em HMR/StrictMode e suporte a automações (isTrusted).

const KEY = '__globalClickGuardDispose'
const ACTION_SELECTOR =
  'a, button, [role="button"], [role="tab"], [role="link"], [role="menuitem"], input[type="submit"], input[type="button"], input[type="reset"], input[type="image"]'

export function enableGlobalClickGuard(globalCooldownMs = 0, elementCooldownMs = 320) {
  if (typeof window === 'undefined') return () => {}
  
  // Garante idempotência perfeita mesmo sob HMR (Hot Module Replacement)
  if (window[KEY]) return window[KEY]

  let lastGlobalAccepted = -Infinity
  const lastByElement = new WeakMap()

  const handler = (event) => {
    // Permite que cliques programáticos (testes, Cypress, Playwright, bibliotecas de terceiros) passem livremente
    if (!event.isTrusted) return

    // Permite bypass imediato para janelas de suporte/chat, ferramentas do desenvolvedor e controles repetíveis
    if (event.target?.closest?.('.bypass-guard')) return
    if (event.target?.closest?.('[data-no-guard]')) return

    // Resolve o elemento interativo mais próximo (lida nativamente com <span> ou <svg> dentro de botões/links)
    const el = event.target?.closest?.(ACTION_SELECTOR)
    if (!el) return

    const now = performance.now()

    // 1. Cooldown Global Curto (opcional e desligado por padrão).
    // Só é aplicado se explicitamente configurado com valor > 0, pois bloquear cliques em
    // elementos DIFERENTES era uma das causas da interface parecer travada.
    if (globalCooldownMs > 0 && now - lastGlobalAccepted < globalCooldownMs) {
      event.stopImmediatePropagation()
      event.preventDefault()
      return
    }

    // 2. Cooldown curto apenas no MESMO elemento (evita duplo clique acidental / rage click)
    const lastElementTime = lastByElement.get(el) ?? -Infinity
    if (now - lastElementTime < elementCooldownMs) {
      event.stopImmediatePropagation()
      event.preventDefault()
      return
    }

    // Registra os timestamps aceitos se passar nas validações
    lastGlobalAccepted = now
    lastByElement.set(el, now)
  }

  window.addEventListener('click', handler, true) // Fase de CAPTURA
  
  // Impede arrasto global de elementos interativos para travar o sistema
  const dragHandler = (event) => {
    if (event.target?.closest?.(ACTION_SELECTOR)) {
      event.preventDefault()
    }
  }
  window.addEventListener('dragstart', dragHandler, true)

  window[KEY] = () => {
    window.removeEventListener('click', handler, true)
    window.removeEventListener('dragstart', dragHandler, true)
    delete window[KEY]
  }
  
  return window[KEY]
}
