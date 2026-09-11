import { isAuthenticated } from './_shared/session.js'
import { getAuthoritativeVersion } from './_shared/passwordStore.js'

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const sessionSecret = process.env.OWNER_ROOM_SESSION_SECRET
  let authenticated = false

  if (sessionSecret) {
    try {
      const currentVersion = await getAuthoritativeVersion()
      authenticated = isAuthenticated(event, sessionSecret, currentVersion)
    } catch {
      // Blobsに一時的に到達できない場合は、安全側に倒して未ログイン扱いにする。
      authenticated = false
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authenticated }),
  }
}
