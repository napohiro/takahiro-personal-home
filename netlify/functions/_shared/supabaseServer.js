import { createClient } from '@supabase/supabase-js'

// APP SHOP購入処理など、Netlify Functions側だけで使うサーバー専用のSupabaseクライアント。
// service_role keyはこのファイル(Functions実行環境)でのみ使用し、
// ブラウザ・Viteビルドには絶対に含めない(VITE_接頭辞の環境変数にはしない)。
export function createSupabaseServerClient() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) return null

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// AuthorizationヘッダのBearerトークンを検証し、本人のuser情報を返す。
// service_role clientでの呼び出しだが、ここでの責務は「渡されたuser tokenが
// Supabase Auth的に正当か」の検証のみ。以降のDB操作で本人確認の代わりにせず、
// 必ずここで得たuser.idで明示的に絞り込むこと。
export async function verifyUserToken(supabaseAdmin, authorizationHeader) {
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) return null
  const token = authorizationHeader.slice('Bearer '.length).trim()
  if (!token) return null

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data?.user) return null
  return data.user
}
