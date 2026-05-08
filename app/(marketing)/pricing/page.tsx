import Link from 'next/link'

const plans = [
  {
    name: 'Starter',
    price: 'Rs. 1,499',
    period: '/month',
    description: 'Choti pharmacy ke liye perfect',
    features: [
      '1 User (Owner only)',
      'POS Billing',
      'Inventory + Expiry Tracking',
      'Basic Reports (daily/monthly)',
      'Customer Management (100 customers)',
      'Private Medicine Addition (10/month)',
      'Basic PDF Invoices',
      'Email Support',
      '14 Days Free Trial',
      'Annual: 2 months free',
    ],
    cta: 'Starter Shuru Karein',
    plan: 'starter',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: 'Rs. 2,999',
    period: '/month',
    description: 'Growing pharmacy ke liye best choice',
    features: [
      'Up to 5 Users',
      'POS Billing + Barcode',
      'Full Inventory Management',
      'Unlimited Customers',
      'Supplier Management',
      'Purchase Orders',
      'Full Reports + CSV Export',
      'Unlimited Private Medicines',
      'Submit to Global DB',
      'Multi-user Roles',
      'Audit Log',
      'PDF Invoices + Custom Branding',
      'Chat + Email Support',
      '14 Days Free Trial',
      'Annual: 2 months free',
    ],
    cta: 'Professional Shuru Karein',
    plan: 'professional',
    highlighted: true,
  },
  {
    name: 'Business',
    price: 'Rs. 5,499',
    period: '/month',
    description: 'Bari pharmacy ya chain ke liye',
    features: [
      'Up to 15 Users',
      'All Professional Features',
      'Shift Management',
      'Bulk Price Update',
      'Custom Logo on Invoices',
      'Priority + WhatsApp Support',
      '14 Days Free Trial',
      'Annual: 2 months free',
    ],
    cta: 'Business Shuru Karein',
    plan: 'business',
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-slate-500">
          14 din free trial — credit card ki zaroorat nahi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl border p-8 flex flex-col ${
              plan.highlighted
                ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                : 'border-slate-200 bg-white'
            }`}
          >
            {plan.highlighted && (
              <span className="text-xs font-medium bg-blue-600 text-white px-3 py-1 rounded-full self-start mb-4">
                Most Popular
              </span>
            )}
            <h2 className="text-2xl font-bold text-slate-900">{plan.name}</h2>
            <p className="text-slate-500 text-sm mt-1 mb-4">{plan.description}</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
              <span className="text-slate-500">{plan.period}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-green-500">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className={`text-center py-3 px-6 rounded-lg font-medium text-sm ${
                plan.highlighted
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-900 text-white hover:bg-slate-700'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="text-center mt-16 text-slate-500 text-sm">
        <p>Sawal hai? WhatsApp karein ya{' '}
          <Link href="/login" className="underline text-slate-700">login</Link> karein.
        </p>
      </div>
    </main>
  )
}
