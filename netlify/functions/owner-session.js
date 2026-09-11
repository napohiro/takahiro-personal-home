import { isAuthenticated } from './_shared/session.js'

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const sessionSecret = process.env.OWNER_ROOM_SESSION_SECRET
  const authenticated = Boolean(sessionSecret) && isAuthenticated(event, sessionSecret)

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authenticated }),
  }
}
