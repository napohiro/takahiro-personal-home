import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

// 現状APP SHOPで扱う商品は思い出ガチャのみ。
const PRODUCT_SLUG = 'omoide-gacha'
const PRODUCT_COLUMNS = 'id, slug, name, description, public_price, member_price, currency, launch_url'
const ENTITLEMENT_COLUMNS = 'access_status'

// naporise_app_products（公開中の商品情報）と、ログイン中ユーザーの
// naporise_app_entitlements（利用権）を取得する。
// RLS（productsはactiveのみ公開 / entitlementsは本人のみ）に処理を委ね、
// service_role等の特別な権限は使わない。
export default function useMemberApps(userId) {
  const [state, setState] = useState(() => ({
    status: supabase ? 'loading' : 'error',
    product: null,
    entitlement: null,
    hasAccess: false,
  }))

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    let active = true

    async function load() {
      const { data: product, error: productError } = await supabase
        .from('naporise_app_products')
        .select(PRODUCT_COLUMNS)
        .eq('slug', PRODUCT_SLUG)
        .eq('product_status', 'active')
        .maybeSingle()

      if (!active) return

      if (productError || !product) {
        setState({ status: 'error', product: null, entitlement: null, hasAccess: false })
        return
      }

      if (!userId) {
        setState({ status: 'ready', product, entitlement: null, hasAccess: false })
        return
      }

      const { data: entitlement, error: entitlementError } = await supabase
        .from('naporise_app_entitlements')
        .select(ENTITLEMENT_COLUMNS)
        .eq('user_id', userId)
        .eq('product_id', product.id)
        .eq('access_status', 'active')
        .maybeSingle()

      if (!active) return

      // 利用権の確認に失敗しても商品情報自体は表示できるよう、
      // このケースは未購入(hasAccess=false)として扱う。
      setState({
        status: 'ready',
        product,
        entitlement: entitlementError ? null : entitlement,
        hasAccess: !entitlementError && Boolean(entitlement),
      })
    }

    load().catch(() => {
      if (active) setState({ status: 'error', product: null, entitlement: null, hasAccess: false })
    })

    return () => {
      active = false
    }
  }, [userId])

  return state
}
