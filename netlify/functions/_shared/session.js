// OWNER ROOM用の最小セッション実装。
//
// 外部ライブラリ(jsonwebtoken等)は使わず、Node標準のcryptoだけで
// 「有効期限つき・改ざん検知つきトークン」を作る。
//
// トークン形式: base64url(JSON payload) + "." + base64url(HMAC-SHA256署名)
// 署名鍵は環境変数 OWNER_ROOM_SESSION_SECRET のみが知っている前提。
// フロント/localStorageに置いても、鍵を知らない限り有効なトークンは作れない。

import crypto from 'node:crypto'

const COOKIE_NAME = 'owner_room_session'
const SESSION_TTL_SECONDS = 6 * 60 * 60 // 6時間

function base64url(input) {
  return Buffer.from(input).toString('base64url')
}

function sign(payloadBase64, secret) {
  return crypto.createHmac('sha256', secret).update(payloadBase64).digest('base64url')
}

export function createSessionToken(secret) {
  const payload = { exp: Date.now() + SESSION_TTL_SECONDS * 1000 }
  const payloadBase64 = base64url(JSON.stringify(payload))
  const signature = sign(payloadBase64, secret)
  return `${payloadBase64}.${signature}`
}

export function verifySessionToken(token, secret) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false
  const [payloadBase64, signature] = token.split('.')
  if (!payloadBase64 || !signature) return false

  const expectedSignature = sign(payloadBase64, secret)
  const a = Buffer.from(signature)
  const b = Buffer.from(expectedSignature)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'))
    return typeof payload.exp === 'number' && Date.now() < payload.exp
  } catch {
    return false
  }
}

export function parseCookies(cookieHeader) {
  const out = {}
  if (!cookieHeader) return out
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const key = part.slice(0, idx).trim()
    const value = part.slice(idx + 1).trim()
    out[key] = decodeURIComponent(value)
  }
  return out
}

// netlify dev はローカルHTTPで動くため、Secure属性を付けるとブラウザが
// Cookieを送らずログインループになる。本番(Netlify上)は常にHTTPSなので
// NETLIFY_DEV のときだけSecureを外す。
const isLocalDev = process.env.NETLIFY_DEV === 'true'

export function buildSessionCookie(token) {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    ...(isLocalDev ? [] : ['Secure']),
    'SameSite=Strict',
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ]
  return parts.join('; ')
}

export function buildClearCookie() {
  const parts = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    ...(isLocalDev ? [] : ['Secure']),
    'SameSite=Strict',
    'Max-Age=0',
  ]
  return parts.join('; ')
}

export function isAuthenticated(event, secret) {
  const cookies = parseCookies(event.headers?.cookie || event.headers?.Cookie)
  return verifySessionToken(cookies[COOKIE_NAME], secret)
}

export { COOKIE_NAME, SESSION_TTL_SECONDS }
