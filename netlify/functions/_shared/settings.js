import { SECTION_KEYS } from '../../../src/data/sections.js'

// リポジトリ情報は秘密ではないため、環境変数ではなくサーバー側定数として固定する。
const GITHUB_OWNER = 'napohiro'
const GITHUB_REPO = 'takahiro-personal-home'
export const GITHUB_BRANCH = 'main'
const SETTINGS_PATH = 'src/data/siteSettings.json'

export const SETTINGS_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${SETTINGS_PATH}`

const NOTICE_TITLE_MAX = 30
const NOTICE_MESSAGE_MAX = 200

export function githubHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'takahiro-personal-home-owner-room',
  }
}

// 保存済みの設定を、既知のキーだけ・決まった型に整える。
// セクションは「明示的に false のときだけ非公開」。キーが無い場合は公開扱いにする。
// 公開設定の対象外（プロフィール等）の古いキーはここで取り除かれる。
export function normalizeSettings(raw) {
  const sections = {}
  for (const key of SECTION_KEYS) {
    sections[key] = raw?.sections?.[key] !== false
  }

  const notice = raw?.notice || {}
  return {
    sections,
    notice: {
      enabled: notice.enabled === true,
      title: typeof notice.title === 'string' ? notice.title.slice(0, NOTICE_TITLE_MAX) : '',
      message: typeof notice.message === 'string' ? notice.message.slice(0, NOTICE_MESSAGE_MAX) : '',
    },
  }
}

// OWNER ROOM から届いた「変更した項目だけ」を検証して取り出す。
// クライアントの値をそのまま信用せず、既知のキー・正しい型のものだけを採用する。
export function sanitizeChanges(input) {
  if (!input || typeof input !== 'object') return null

  const sections = {}
  for (const key of SECTION_KEYS) {
    const value = input.sections?.[key]
    if (typeof value === 'boolean') sections[key] = value
  }

  const notice = {}
  const noticeInput = input.notice || {}
  if (typeof noticeInput.enabled === 'boolean') notice.enabled = noticeInput.enabled
  if (typeof noticeInput.title === 'string') notice.title = noticeInput.title.slice(0, NOTICE_TITLE_MAX)
  if (typeof noticeInput.message === 'string') notice.message = noticeInput.message.slice(0, NOTICE_MESSAGE_MAX)

  if (Object.keys(sections).length === 0 && Object.keys(notice).length === 0) return null
  return { sections, notice }
}

// 最新の保存内容に、変更項目だけを重ねる（他の項目は最新値のまま保つ）。
export function applyChanges(current, changes) {
  return {
    sections: { ...current.sections, ...changes.sections },
    notice: { ...current.notice, ...changes.notice },
  }
}

// GitHub 上の最新の siteSettings.json を読み込む。{ settings, sha } を返す。
export async function fetchCurrentSettings(token) {
  const res = await fetch(`${SETTINGS_API_URL}?ref=${GITHUB_BRANCH}`, { headers: githubHeaders(token) })
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`)

  const file = await res.json()
  const raw = JSON.parse(Buffer.from(file.content || '', 'base64').toString('utf8'))
  return { settings: normalizeSettings(raw), sha: file.sha }
}
