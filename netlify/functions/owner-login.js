import crypto from 'node:crypto'
import { createSessionToken, buildSessionCookie } from './_shared/session.js'

function timingSafeStringEqual(a, b) {
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

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const password = process.env.OWNER_ROOM_PASSWORD
  const sessionSecret = process.env.OWNER_ROOM_SESSION_SECRET

  if (!password || !sessionSecret) {
    // サーバー設定不備。詳細は返さない。
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'サーバー側の設定が未完了です。管理者へご確認ください。' }),
    }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'リクエストが不正です。' }),
    }
  }

  const inputPassword = typeof body.password === 'string' ? body.password : ''

  if (!inputPassword || !timingSafeStringEqual(inputPassword, password)) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'パスワードが違います。' }),
    }
  }

  const token = createSessionToken(sessionSecret)

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': buildSessionCookie(token),
    },
    body: JSON.stringify({ ok: true }),
  }
}
