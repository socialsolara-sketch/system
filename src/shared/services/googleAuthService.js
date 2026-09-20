// Arquivo: src/shared/services/googleAuthService.js
// Descrição: Serviço de autenticação Google via Firebase Auth e gerenciamento de token em memória para Google Sheets.

import { initializeApp } from 'firebase/app'
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth'
import firebaseConfig from '../../../firebase-applet-config.json'

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

const provider = new GoogleAuthProvider()
// Escopo do Google Sheets autorizado
provider.addScope('https://www.googleapis.com/auth/spreadsheets')

let isSigningIn = false
let cachedAccessToken = null

/**
 * Inicializa ouvinte do estado de autenticação.
 */
export const initAuth = (onAuthSuccess, onAuthFailure) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken)
      } else if (!isSigningIn) {
        // Token em memória expirado ou recarregado
        if (onAuthFailure) onAuthFailure()
      }
    } else {
      cachedAccessToken = null
      if (onAuthFailure) onAuthFailure()
    }
  })
}

/**
 * Realiza login via pop-up do Google com escopo do Google Sheets.
 */
export const googleSignIn = async () => {
  try {
    isSigningIn = true
    const result = await signInWithPopup(auth, provider)
    const credential = GoogleAuthProvider.credentialFromResult(result)
    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o token de acesso do Google.')
    }

    cachedAccessToken = credential.accessToken
    return { user: result.user, accessToken: cachedAccessToken }
  } catch (error) {
    console.error('Erro no login com Google:', error)
    throw error
  } finally {
    isSigningIn = false
  }
}

/**
 * Retorna o token de acesso em memória.
 */
export const getAccessToken = () => {
  return cachedAccessToken
}

/**
 * Obtém o usuário atual autenticado.
 */
export const getCurrentUser = () => {
  return auth.currentUser
}

/**
 * Realiza logout e limpa o token em memória.
 */
export const logout = async () => {
  await signOut(auth)
  cachedAccessToken = null
}
