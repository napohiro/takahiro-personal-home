import { connectLambda } from '@netlify/blobs'
import { isAuthenticated } from './_shared/session.js'
import { getAuthoritativeVersion } from './_shared/passwordStore.js'
import { fetchCurrentSettings } from './_shared/settings.js'

// OWNER ROOM 用：GitHub 上の最新の siteSettings.json を返す。
// 公開サイトのビルドに埋め込まれた設定は Netlify の再ビルドが終わるまで古いままなので、
// OWNER ROOM の画面は必ずこちらの最新値から始める。
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
      authenticated = false
    }
  }
  if (!authenticated) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'ログインが必要です。再度ログインしてください。' }),
    }
  }

  const githubToken = process.env.GITHUB_TOKEN
  if (!githubToken) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'サーバー側の設定が未完了です。管理者へご確認ください。' }),
    }
  }

  try {
    const { settings } = await fetchCurrentSettings(githubToken)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ ok: true, settings }),
    }
  } catch {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: '最新の設定を読み込めませんでした。' }),
    }
  }
}
