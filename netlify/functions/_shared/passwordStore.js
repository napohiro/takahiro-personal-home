// OWNER ROOMパスワードの正データをNetlify Blobsで管理する。
//
// Store: "owner-room-auth" / Key: "credentials"
// 保存内容: { salt, passwordHash, passwordVersion, updatedAt }
// 平文パスワードは一切保存しない(常にscryptハッシュ化)。
//
// 認証情報は本来speedより整合性を優先したいが、このプロジェクトの
// Functionsはすべて「Lambda互換モード」(classicなhandler(event)形式)であり、
// @netlify/blobsのconnectLambda(event)が渡す環境情報には
// uncachedEdgeURLが含まれない(node_modules/@netlify/blobs/dist/main.js の
// connectLambda実装、および src/client.ts の getFinalRequest を確認済み)。
// そのため consistency: "strong" を指定すると常にBlobsConsistencyErrorになり、
// この構成では技術的に利用できない。よってeventual consistency(既定)を使う。
// 参照: https://docs.netlify.com/build/data-and-storage/netlify-blobs/

import crypto from 'node:crypto'
import { promisify } from 'node:util'
import { getStore } from '@netlify/blobs'

const scryptAsync = promisify(crypto.scrypt)

const STORE_NAME = 'owner-room-auth'
const KEY = 'credentials'
const KEY_LENGTH = 64
const SALT_BYTES = 16

function store() {
  return getStore(STORE_NAME)
}

async function hashPassword(password, saltHex) {
  const salt = Buffer.from(saltHex, 'hex')
  const derived = await scryptAsync(String(password), salt, KEY_LENGTH)
  return derived.toString('hex')
}

function generateSalt() {
  return crypto.randomBytes(SALT_BYTES).toString('hex')
}

function isValidCredentials(data) {
  return (
    data &&
    typeof data.salt === 'string' &&
    typeof data.passwordHash === 'string' &&
    typeof data.passwordVersion === 'number'
  )
}

// 現在の認証情報を読む。Blobsにまだ何も無ければnull。
export async function getCredentials() {
  const data = await store().get(KEY, { type: 'json' })
  return isValidCredentials(data) ? data : null
}

// 楽観的並行性制御(optimistic concurrency)用にetag付きで読む。
export async function getCredentialsWithEtag() {
  const result = await store().getWithMetadata(KEY, { type: 'json' })
  if (!result || !isValidCredentials(result.data)) {
    return { data: null, etag: null }
  }
  return { data: result.data, etag: result.etag }
}

// Blobsにcredentialsが無い場合は0(=環境変数フォールバック世代)を返す。
export async function getAuthoritativeVersion() {
  const credentials = await getCredentials()
  return credentials ? credentials.passwordVersion : 0
}

export async function verifyPassword(password, credentials) {
  if (!isValidCredentials(credentials)) return false
  const candidateHex = await hashPassword(password, credentials.salt)
  const a = Buffer.from(candidateHex, 'hex')
  const b = Buffer.from(credentials.passwordHash, 'hex')
  if (a.length !== b.length) {
    crypto.timingSafeEqual(a, a)
    return false
  }
  return crypto.timingSafeEqual(a, b)
}

// Blobsにまだ何も無い状態から、初めてcredentialsを作る。
// onlyIfNew により、他のリクエストが同時に先着していた場合は
// modified:false が返り、こちらの書き込みは行われない(上書き事故を防止)。
export async function createInitialCredentials(newPassword) {
  const salt = generateSalt()
  const passwordHash = await hashPassword(newPassword, salt)
  const payload = {
    salt,
    passwordHash,
    passwordVersion: 1,
    updatedAt: new Date().toISOString(),
  }
  const result = await store().setJSON(KEY, payload, { onlyIfNew: true })
  return { modified: result.modified, credentials: payload }
}

// 既存credentialsを、直前に取得したetagと一致する場合だけ新しい値に置き換える。
// 一致しなければ(=その間に別の変更が入っていれば) modified:false を返す。
export async function updateCredentials(newPassword, previousVersion, etag) {
  const salt = generateSalt()
  const passwordHash = await hashPassword(newPassword, salt)
  const payload = {
    salt,
    passwordHash,
    passwordVersion: previousVersion + 1,
    updatedAt: new Date().toISOString(),
  }
  const result = await store().setJSON(KEY, payload, { onlyIfMatch: etag })
  return { modified: result.modified, credentials: payload }
}
