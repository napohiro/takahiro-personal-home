import { createSupabaseServerClient, verifyUserToken } from './_shared/supabaseServer.js'

// 現状APP SHOPで扱う商品は思い出ガチャのみ。
const PRODUCT_COLUMNS = 'id, slug, name, public_price, member_price, currency'

// 作成途中(provider_checkout_url未確定)のpendingを「処理中」とみなす猶予時間。
// これを超えて古ければ、途中で失敗したものとみなしcancelledへ進める。
const PENDING_CREATION_GRACE_MS = 30 * 1000

// NAPORISE側の購入開始有効期限。Square Payment Link側に明確な有効期限を
// 設定しづらいため、離脱ユーザーが再購入を試せるまでの猶予として30分とする。
const PURCHASE_TTL_MS = 30 * 60 * 1000

const SQUARE_SANDBOX_BASE_URL = 'https://connect.squareupsandbox.com'
const SQUARE_API_VERSION = '2026-09-16'

function respond(statusCode, payload) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }
}

function fail(statusCode, message) {
  return respond(statusCode, { ok: false, error: message })
}

const GENERIC_UNAVAILABLE_MESSAGE = '現在購入処理を開始できません。時間をおいて再度お試しください。'

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  // --- 設定・安全確認 -----------------------------------------------------
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN
  const squareLocationId = process.env.SQUARE_LOCATION_ID
  const squareEnvironment = process.env.SQUARE_ENVIRONMENT
  const appBaseUrl = process.env.APP_BASE_URL

  if (
    !supabaseUrl ||
    !supabaseServiceRoleKey ||
    !squareAccessToken ||
    !squareLocationId ||
    !squareEnvironment ||
    !appBaseUrl
  ) {
    return fail(500, 'サーバー側の設定が未完了です。管理者へご確認ください。')
  }

  // 本番Square決済への誤接続を防ぐ安全策。sandbox以外は一律拒否する。
  if (squareEnvironment !== 'sandbox') {
    return fail(500, 'サーバー側の設定が未完了です。管理者へご確認ください。')
  }

  const supabaseAdmin = createSupabaseServerClient()
  if (!supabaseAdmin) {
    return fail(500, 'サーバー側の設定が未完了です。管理者へご確認ください。')
  }

  // --- 認証 -----------------------------------------------------------
  const authorizationHeader = event.headers?.authorization || event.headers?.Authorization
  const user = await verifyUserToken(supabaseAdmin, authorizationHeader)
  if (!user) {
    return fail(401, 'ログインが必要です。')
  }

  // --- リクエスト本体 ---------------------------------------------------
  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return fail(400, 'リクエストが不正です。')
  }

  const productSlug = typeof body.product_slug === 'string' ? body.product_slug.trim() : ''
  if (!productSlug) {
    return fail(400, '商品が指定されていません。')
  }

  try {
    // --- 商品取得 ---------------------------------------------------
    const { data: product, error: productError } = await supabaseAdmin
      .from('naporise_app_products')
      .select(PRODUCT_COLUMNS)
      .eq('slug', productSlug)
      .eq('product_status', 'active')
      .maybeSingle()

    if (productError || !product) {
      return fail(404, '商品が見つかりません。')
    }

    // --- 既存利用権の確認 ---------------------------------------------
    const { data: entitlement, error: entitlementError } = await supabaseAdmin
      .from('naporise_app_entitlements')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .eq('access_status', 'active')
      .maybeSingle()

    if (entitlementError) {
      return fail(502, GENERIC_UNAVAILABLE_MESSAGE)
    }
    if (entitlement) {
      return respond(200, { status: 'already_owned' })
    }

    // --- 契約者価格判定(サーバー側で決定。ブラウザの金額は一切信用しない) ---------
    const { data: activeMembers, error: memberError } = await supabaseAdmin
      .from('naporise_members')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('member_status', 'active')
      .limit(1)

    let isEligibleForMemberPrice = false
    if (!memberError && Array.isArray(activeMembers) && activeMembers.length > 0) {
      const { data: eligibleContracts, error: contractError } = await supabaseAdmin
        .from('naporise_contracts')
        .select('id')
        .eq('user_id', user.id)
        .eq('contract_status', 'active')
        .eq('app_shop_member_enabled', true)
        .limit(1)

      isEligibleForMemberPrice = !contractError && Array.isArray(eligibleContracts) && eligibleContracts.length > 0
    }

    const priceType = isEligibleForMemberPrice ? 'member' : 'public'
    const amount = isEligibleForMemberPrice ? product.member_price : product.public_price

    if (typeof amount !== 'number' || amount <= 0) {
      return fail(500, 'サーバー側の設定が未完了です。管理者へご確認ください。')
    }

    // --- 既存pending購入の確認・再利用・整理 -----------------------------
    const { data: pending, error: pendingError } = await supabaseAdmin
      .from('naporise_app_purchases')
      .select('id, expires_at, provider_checkout_url, created_at')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .eq('payment_status', 'pending')
      .maybeSingle()

    if (pendingError) {
      return fail(502, GENERIC_UNAVAILABLE_MESSAGE)
    }

    if (pending) {
      const expiresAtMs = pending.expires_at ? new Date(pending.expires_at).getTime() : 0
      const isExpired = !expiresAtMs || expiresAtMs <= Date.now()

      if (!isExpired && pending.provider_checkout_url) {
        return respond(200, { status: 'checkout_ready', checkout_url: pending.provider_checkout_url })
      }

      if (!isExpired && !pending.provider_checkout_url) {
        const createdAtMs = pending.created_at ? new Date(pending.created_at).getTime() : 0
        if (Date.now() - createdAtMs < PENDING_CREATION_GRACE_MS) {
          // 直近作成の作成途中状態。二重作成せず「処理中」を返す。
          return respond(200, { status: 'checkout_pending' })
        }
      }

      // 期限切れ、または作成途中のまま猶予を超えて古い場合はキャンセルして進める。
      await supabaseAdmin
        .from('naporise_app_purchases')
        .update({ payment_status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', pending.id)
        .eq('payment_status', 'pending')
    }

    // --- 新規pending購入の作成 -------------------------------------------
    const expiresAtIso = new Date(Date.now() + PURCHASE_TTL_MS).toISOString()

    const { data: newPurchase, error: insertError } = await supabaseAdmin
      .from('naporise_app_purchases')
      .insert({
        user_id: user.id,
        product_id: product.id,
        price_type: priceType,
        amount,
        currency: product.currency,
        payment_provider: 'square',
        payment_status: 'pending',
        expires_at: expiresAtIso,
      })
      .select('id')
      .single()

    if (insertError) {
      if (insertError.code === '23505') {
        // 同時リクエストで別の呼び出しが先にpendingを作成した(DB側の部分一意インデックスによる)。
        // エラーにせず、既存pendingを安全に取得して返す。
        const { data: existing } = await supabaseAdmin
          .from('naporise_app_purchases')
          .select('provider_checkout_url')
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .eq('payment_status', 'pending')
          .maybeSingle()

        if (existing?.provider_checkout_url) {
          return respond(200, { status: 'checkout_ready', checkout_url: existing.provider_checkout_url })
        }
        return respond(200, { status: 'checkout_pending' })
      }

      return fail(502, GENERIC_UNAVAILABLE_MESSAGE)
    }

    const purchaseId = newPurchase.id

    // --- Square Sandbox Payment Linkの作成 --------------------------------
    // JPYは補助単位を持たない通貨のため、Square Money.amountへそのまま円の値を渡す
    // (USD等のように100倍(セント換算)する必要はない)。
    const redirectUrl = `${appBaseUrl.replace(/\/+$/, '')}/member?payment=return`
    const idempotencyKey = `app-shop-${purchaseId}`

    let squareResponse
    try {
      squareResponse = await fetch(`${SQUARE_SANDBOX_BASE_URL}/v2/online-checkout/payment-links`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${squareAccessToken}`,
          'Content-Type': 'application/json',
          'Square-Version': SQUARE_API_VERSION,
        },
        body: JSON.stringify({
          idempotency_key: idempotencyKey,
          quick_pay: {
            name: product.name,
            price_money: { amount, currency: product.currency },
            location_id: squareLocationId,
          },
          checkout_options: {
            redirect_url: redirectUrl,
          },
        }),
      })
    } catch {
      squareResponse = null
    }

    let squareData = null
    if (squareResponse) {
      try {
        squareData = await squareResponse.json()
      } catch {
        squareData = null
      }
    }

    const checkoutId = squareData?.payment_link?.id
    const checkoutUrl = squareData?.payment_link?.url
    const checkoutOrderId = squareData?.payment_link?.order_id

    if (!squareResponse || !squareResponse.ok || !checkoutId || !checkoutUrl || !checkoutOrderId) {
      // Square側のエラー詳細はconsoleにも出さない(認証情報を含む可能性があるため)。
      await supabaseAdmin
        .from('naporise_app_purchases')
        .update({ payment_status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', purchaseId)
        .eq('payment_status', 'pending')

      return fail(502, GENERIC_UNAVAILABLE_MESSAGE)
    }

    // provider_payment_idはWebhook(app-shop-square-webhook.mjs)で決済完了後に
    // 確定するPayment ID専用のため、ここでは触れない。
    const { error: updateError } = await supabaseAdmin
      .from('naporise_app_purchases')
      .update({
        provider_checkout_id: checkoutId,
        provider_checkout_url: checkoutUrl,
        provider_order_id: checkoutOrderId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', purchaseId)
      .eq('payment_status', 'pending')

    if (updateError) {
      // Square側の作成自体は成功しているため、利用者へはURLを返しつつ記録だけ残す。
      console.error('app-shop-create-checkout: failed to persist checkout id/url for purchase', purchaseId)
    }

    return respond(200, { status: 'checkout_ready', checkout_url: checkoutUrl })
  } catch {
    return fail(502, GENERIC_UNAVAILABLE_MESSAGE)
  }
}
