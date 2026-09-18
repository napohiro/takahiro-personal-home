import { createClient } from '@supabase/supabase-js'

// 契約者マイページ（/member）用のSupabase Authクライアント。
// anon keyのみを使用し、service_role keyは絶対に使わない。
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// 環境変数が未設定でもアプリ全体をクラッシュさせないよう、
// 未設定時はクライアントを作らずnullを返す。呼び出し側は
// isSupabaseConfigured を見て未設定時の表示に分岐すること。
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null
