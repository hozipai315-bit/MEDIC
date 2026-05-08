import Link from 'next/link'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-slate-200 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="text-xl font-bold text-slate-900">
          MedPOS
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-slate-600 hover:text-slate-900">
            Pricing
          </Link>
          <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
          >
            Start Free Trial
          </Link>
        </div>
      </nav>
      {children}
    </div>
  )
}
