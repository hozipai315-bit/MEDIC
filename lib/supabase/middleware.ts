import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const exemptRoutes = ['/login', '/signup', '/forgot-password', '/suspended', '/billing', '/', '/pricing']
  const isExempt = exemptRoutes.includes(path) || path.startsWith('/api/')

  if (isExempt) {
    return supabaseResponse
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('status')
    .eq('id', profile?.tenant_id)
    .single()

  if (tenant?.status === 'suspended') {
    return NextResponse.redirect(new URL('/suspended', request.url))
  }

  if (tenant?.status === 'expired') {
    return NextResponse.redirect(new URL('/billing', request.url))
  }

  return supabaseResponse
}
