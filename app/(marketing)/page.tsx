import Link from 'next/link'

export default function LandingPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <span className="inline-block bg-slate-100 text-slate-700 text-sm px-4 py-1 rounded-full mb-6">
          Pakistan ka #1 Medical Store Software
        </span>
        <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
          Apni Medical Store Ko<br />
          <span className="text-blue-600">Cloud Pe Le Jayen</span>
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
          POS billing, inventory, daily sales reports aur bahut kuch — sab ek jagah.
          Koi installation nahi, koi tension nahi. Browser se chalayein.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700"
          >
            14 Din Free Trial Shuru Karein
          </Link>
          <Link
            href="/pricing"
            className="text-slate-600 px-8 py-3 rounded-lg text-lg border border-slate-200 hover:bg-slate-50"
          >
            Pricing Dekhein
          </Link>
        </div>
        <p className="text-sm text-slate-400 mt-4">Credit card ki zaroorat nahi</p>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-16">
            Sab Kuch Ek Jagah
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <div className="text-3xl mb-4">🧾</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Fast POS Billing</h3>
              <p className="text-slate-500">
                Second mein bill banayein. Receipt print karein ya WhatsApp karein.
                Cash, card, EasyPaisa, JazzCash — sab support karta hai.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <div className="text-3xl mb-4">💊</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Inventory</h3>
              <p className="text-slate-500">
                3000+ medicines ki database. Expiry alerts, low stock warnings.
                DRAP prices automatically update hoti hain.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Sales Reports</h3>
              <p className="text-slate-500">
                Daily, weekly, monthly reports. Apni store ki performance dekhein.
                Kaun si medicine zyada bikti hai — sab pata chalega.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">
          Aaj Hi Shuru Karein — Bilkul Free
        </h2>
        <p className="text-slate-500 mb-8 text-lg">
          14 din ka free trial. Credit card nahi chahiye. Kabhi bhi cancel karein.
        </p>
        <Link
          href="/signup"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700"
        >
          Free Trial Shuru Karein
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400">
        <p>© 2024 MedPOS. Made in Pakistan 🇵🇰</p>
      </footer>
    </main>
  )
}
