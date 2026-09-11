import { connectLambda } from '@netlify/blobs'
import { isAuthenticated, timingSafeStringEqual, buildClearCookie } from './_shared/session.js'
import {
  getCredentialsWithEtag,
  getAuthoritativeVersion,
  verifyPassword,
  createInitialCredentials,
  updateCredentials,
} from './_shared/passwordStore.js'

const MIN_LENGTH = 12
const CONFLICT_MESSAGE = '別の場所で設定が更新されました。もう一度ログインしてやり直してください。'

function fail(statusCode, message) {
  return {
    statusCode,
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
  if (!sessionSecret) {
    return fail(500, 'サーバー側の設定が未完了です。管理者へご確認ください。')
  }

  let authenticated = false
  try {
    const currentVersion = await getAuthoritativeVersion()
    authenticated = isAuthenticated(event, sessionSecret, currentVersion)
  } catch {
    return fail(500, 'サーバー側の設定が未完了です。管理者へご確認ください。')
  }
  if (!authenticated) {
    return fail(401, 'ログインが必要です。再度ログインしてください。')
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return fail(400, 'リクエストが不正です。')
  }

  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : ''
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : ''
  const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : ''

  if (!currentPassword || !newPassword || !confirmPassword) {
    return fail(400, '現在のパスワード・新しいパスワード・確認のすべてを入力してください。')
  }
  if (newPassword !== confirmPassword) {
    return fail(400, '新しいパスワードと確認用の入力が一致しません。')
  }
  if (newPassword.length < MIN_LENGTH) {
    return fail(400, `新しいパスワードは${MIN_LENGTH}文字以上にしてください。`)
  }

  try {
    const { data: credentials, etag } = await getCredentialsWithEtag()

    if (credentials) {
      // Netlify Blobsが正データの場合: hash比較で現在パスワードを確認。
      const isCurrentCorrect = await verifyPassword(currentPassword, credentials)
      if (!isCurrentCorrect) {
        return fail(401, '現在のパスワードが違います。')
      }
      const isSameAsCurrent = await verifyPassword(newPassword, credentials)
      if (isSameAsCurrent) {
        return fail(400, '新しいパスワードは現在のパスワードと異なるものにしてください。')
      }

      const { modified } = await updateCredentials(newPassword, credentials.passwordVersion, etag)
      if (!modified) {
        // 直前に取得したetagと食い違った = 別タブ等で同時に変更された。
        return fail(409, CONFLICT_MESSAGE)
      }
    } else {
      // Blobsにまだ何も無い(初回)場合: 環境変数を現在パスワードとして確認し、
      // 初めてBlobsへ安全に登録する。
      const envPassword = process.env.OWNER_ROOM_PASSWORD
      if (!envPassword) {
        return fail(500, 'サーバー側の設定が未完了です。管理者へご確認ください。')
      }
      if (!timingSafeStringEqual(currentPassword, envPassword)) {
        return fail(401, '現在のパスワードが違います。')
      }
      if (timingSafeStringEqual(newPassword, envPassword)) {
        return fail(400, '新しいパスワードは現在のパスワードと異なるものにしてください。')
      }

      const { modified } = await createInitialCredentials(newPassword)
      if (!modified) {
        // onlyIfNewが失敗 = その間に別のリクエストが先に初期登録していた。
        return fail(409, CONFLICT_MESSAGE)
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': buildClearCookie(),
      },
      body: JSON.stringify({
        ok: true,
        message: 'パスワードを変更しました。新しいパスワードで再度ログインしてください。',
      }),
    }
  } catch {
    return fail(502, 'パスワードの変更に失敗しました。時間をおいて再度お試しください。')
  }
}
