import { isAuthenticated } from './_shared/session.js'

// リポジトリ情報は秘密ではないため、環境変数ではなくサーバー側定数として固定する。
const GITHUB_OWNER = 'napohiro'
const GITHUB_REPO = 'takahiro-personal-home'
const GITHUB_BRANCH = 'main'
const SETTINGS_PATH = 'src/data/siteSettings.json'

const SECTION_KEYS = [
  'profile',
  'myWorld',
  'now',
  'works',
  'favorites',
  'timeline',
  'gacha',
  'family',
  'socialLinks',
]

const NOTICE_TITLE_MAX = 30
const NOTICE_MESSAGE_MAX = 200

function badRequest(message) {
  return {
    statusCode: 400,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: false, error: message }),
  }
}

// クライアントから届いた値をそのまま信用せず、既知のキーだけを
// 決まった型で組み直す（未知キーの混入・型崩れを防ぐ）。
function sanitizeSettings(input) {
  if (!input || typeof input !== 'object') return null

  const sections = {}
  for (const key of SECTION_KEYS) {
    sections[key] = Boolean(input.sections?.[key])
  }

  const noticeInput = input.notice || {}
  const title = typeof noticeInput.title === 'string' ? noticeInput.title.slice(0, NOTICE_TITLE_MAX) : ''
  const message = typeof noticeInput.message === 'string' ? noticeInput.message.slice(0, NOTICE_MESSAGE_MAX) : ''

  const notice = {
    enabled: Boolean(noticeInput.enabled),
    title,
    message,
  }

  return { sections, notice }
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const sessionSecret = process.env.OWNER_ROOM_SESSION_SECRET
  if (!sessionSecret || !isAuthenticated(event, sessionSecret)) {
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

  const settings = sanitizeSettings(body.settings)
  if (!settings) {
    return badRequest('設定データが不正です。')
  }

  const apiBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${SETTINGS_PATH}`
  const githubHeaders = {
    Authorization: `Bearer ${githubToken}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'takahiro-personal-home-owner-room',
  }

  try {
    const currentRes = await fetch(`${apiBase}?ref=${GITHUB_BRANCH}`, { headers: githubHeaders })
    if (!currentRes.ok) {
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: false, error: '公開できませんでした。時間をおいて再度お試しください。' }),
      }
    }
    const currentFile = await currentRes.json()

    const newContent = JSON.stringify(settings, null, 2) + '\n'
    const contentBase64 = Buffer.from(newContent, 'utf8').toString('base64')

    const updateRes = await fetch(apiBase, {
      method: 'PUT',
      headers: { ...githubHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'chore: OWNER ROOMからサイト設定を更新',
        content: contentBase64,
        sha: currentFile.sha,
        branch: GITHUB_BRANCH,
      }),
    })

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
      body: JSON.stringify({ ok: true }),
    }
  } catch {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'ネットワークエラーが発生しました。通信状態をご確認のうえ再度お試しください。' }),
    }
  }
}
