import { createSessionToken, buildSessionCookie, timingSafeStringEqual } from './_shared/session.js'
import { getCredentials, verifyPassword } from './_shared/passwordStore.js'

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const sessionSecret = process.env.OWNER_ROOM_SESSION_SECRET
  if (!sessionSecret) {
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
  if (!inputPassword) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'パスワードが違います。' }),
    }
  }

  // Netlify Blobsに正データがあればそちらを正とし、無ければ
  // 環境変数OWNER_ROOM_PASSWORDを初期移行用のフォールバックとして使う。
  // (Blobs自体への接続が失敗した場合は、古いenv password等でのなし崩し的な
  //  ログインを許してしまわないよう、ここで安全にエラーとして扱う)
  let credentials
  try {
    credentials = await getCredentials()
  } catch {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'サーバー側の設定が未完了です。管理者へご確認ください。' }),
    }
  }

  let authenticated = false
  let passwordVersion = 0

  if (credentials) {
    authenticated = await verifyPassword(inputPassword, credentials)
    passwordVersion = credentials.passwordVersion
  } else {
    const envPassword = process.env.OWNER_ROOM_PASSWORD
    if (!envPassword) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: false, error: 'サーバー側の設定が未完了です。管理者へご確認ください。' }),
      }
    }
    authenticated = timingSafeStringEqual(inputPassword, envPassword)
    passwordVersion = 0
  }

  if (!authenticated) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'パスワードが違います。' }),
    }
  }

  const token = createSessionToken(sessionSecret, passwordVersion)

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': buildSessionCookie(token),
    },
    body: JSON.stringify({ ok: true }),
  }
}
