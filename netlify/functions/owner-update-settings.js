import { connectLambda } from '@netlify/blobs'
import { isAuthenticated } from './_shared/session.js'
import { getAuthoritativeVersion } from './_shared/passwordStore.js'
import {
  GITHUB_BRANCH,
  SETTINGS_API_URL,
  applyChanges,
  fetchCurrentSettings,
  githubHeaders,
  sanitizeChanges,
} from './_shared/settings.js'

function badRequest(message) {
  return {
    statusCode: 400,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: false, error: message }),
  }
}

export async function handler(event) {
  // Lambda互換形式ではNetlify Blobsの環境情報を明示的に渡す必要がある。
  connectLambda(event)

  if (event.httpMethod !== 'POST') {
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

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return badRequest('リクエストが不正です。')
  }

  // 設定全体ではなく「変更した項目だけ」を受け取る。
  // 公開反映前の古い画面から保存しても、他の項目を古い値で上書きしないため。
  const changes = sanitizeChanges(body.changes)
  if (!changes) {
    return badRequest('変更内容が不正です。ページを再読み込みしてからお試しください。')
  }

  let current
  try {
    current = await fetchCurrentSettings(githubToken)
  } catch {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: '公開できませんでした。時間をおいて再度お試しください。' }),
    }
  }

  try {
    const settings = applyChanges(current.settings, changes)
    const newContent = JSON.stringify(settings, null, 2) + '\n'
    const contentBase64 = Buffer.from(newContent, 'utf8').toString('base64')

    const updateRes = await fetch(SETTINGS_API_URL, {
      method: 'PUT',
      headers: { ...githubHeaders(githubToken), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'chore: OWNER ROOMからサイト設定を更新',
        content: contentBase64,
        sha: current.sha,
        branch: GITHUB_BRANCH,
      }),
    })

    // 読み込み後に別の保存が先に入った場合（sha不一致）は上書きせず、やり直してもらう。
    if (updateRes.status === 409) {
      return {
        statusCode: 409,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: false, error: '別の保存と重なりました。もう一度「変更を公開」を押してください。' }),
      }
    }

    if (!updateRes.ok) {
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: false, error: '公開できませんでした。時間をおいて再度お試しください。' }),
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, settings }),
    }
  } catch {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'ネットワークエラーが発生しました。通信状態をご確認のうえ再度お試しください。' }),
    }
  }
}
