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

// passwordVersion(pv): 現在Netlify Blobsに保存されているパスワードの世代番号。
// Blobs未移行(環境変数フォールバック)時は 0 を使う。
// ログイン時点のpvをトークンへ焼き込み、各認証チェックで「今の正しいpv」と
// 突き合わせることで、パスワード変更後に旧セッションを一括で無効化できる。
export function createSessionToken(secret, passwordVersion = 0) {
  const payload = { exp: Date.now() + SESSION_TTL_SECONDS * 1000, pv: passwordVersion }
  const payloadBase64 = base64url(JSON.stringify(payload))
  const signature = sign(payloadBase64, secret)
  return `${payloadBase64}.${signature}`
}

// 署名・有効期限が正しければpayload({exp, pv})を返し、そうでなければnull。
// (以前はboolean を返していたが、呼び出し側でpvを見られるようにpayload自体を返す)
export function verifySessionToken(token, secret) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null
  const [payloadBase64, signature] = token.split('.')
  if (!payloadBase64 || !signature) return null

  const expectedSignature = sign(payloadBase64, secret)
  const a = Buffer.from(signature)
  const b = Buffer.from(expectedSignature)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'))
    if (typeof payload.exp !== 'number' || Date.now() >= payload.exp) return null
    return payload
  } catch {
    return null
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

// currentPasswordVersion: 呼び出し側が事前に(必要ならBlobsから)取得した
// 「今まさに正しいpasswordVersion」。トークン内のpvと一致しなければ、
// 署名や有効期限が正しくてもログイン済みとは扱わない
// (=パスワード変更で発行済みの全セッションを一括失効させる仕組み)。
export function isAuthenticated(event, secret, currentPasswordVersion) {
  const cookies = parseCookies(event.headers?.cookie || event.headers?.Cookie)
  const payload = verifySessionToken(cookies[COOKIE_NAME], secret)
  if (!payload) return false
  return payload.pv === currentPasswordVersion
}

// 文字列の長さを含めてタイミング攻撃に強い比較。
// パスワード等の秘密値をユーザー入力と比較するときは常にこれを使う。
export function timingSafeStringEqual(a, b) {
  const bufA = Buffer.from(String(a))
  const bufB = Buffer.from(String(b))
  if (bufA.length !== bufB.length) {
    // 長さが違うと timingSafeEqual が例外を投げるため、
    // 長さの違い自体で早期returnせず、ダミー比較で時間差を減らす。
    crypto.timingSafeEqual(bufA, bufA)
    return false
  }
  return crypto.timingSafeEqual(bufA, bufB)
}

export { COOKIE_NAME, SESSION_TTL_SECONDS }
