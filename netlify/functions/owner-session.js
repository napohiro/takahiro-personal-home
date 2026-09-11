import { connectLambda } from '@netlify/blobs'
import { isAuthenticated } from './_shared/session.js'
import { getAuthoritativeVersion } from './_shared/passwordStore.js'

export async function handler(event) {
  // Lambda互換形式ではNetlify Blobsの環境情報を明示的に渡す必要がある。
  connectLambda(event)

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
