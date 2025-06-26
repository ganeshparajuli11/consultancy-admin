export default function PricingPlans() {
  const [plans, setPlans] = useState([
    {
      id: 1,
      name: "Basic",
      originalPrice: 1500,
      discountType: "percentage",
      discountValue: 20,
      billingCycle: "month",
      popular: false,
      features: [
        "5GB Storage",
        "Email Support",
        "Basic Analytics",
        "Mobile App Access"
      ]
    },
    {
      id: 2,
      name: "Pro",
      originalPrice: 3000,
      discountType: "amount",
      discountValue: 500,
      billingCycle: "month",
      popular: true,
      features: [
        "50GB Storage",
        "Priority Support",
        "Advanced Analytics",
        "Mobile + Desktop Apps",
        "API Access",
        "Custom Integrations"
      ]
    },
    {
      id: 3,
      name: "Enterprise",
      price: 5000,
      billingCycle: "month",
      popular: false,
      features: [
        "Unlimited Storage",
        "24/7 Phone Support",
        "Custom Analytics",
        "All Platform Access",
        "Advanced API",
        "White-label Solution",
        "Dedicated Account Manager"
      ]
    }
  ])

  // Simulate dynamic pricing updates
  const updatePricing = () => {
    setPlans(prevPlans => 
      prevPlans.map(plan => ({
        ...plan,
        discountType: Math.random() > 0.5 ? 'percentage' : 'amount',
        discountValue: plan.id === 1 ? Math.floor(Math.random() * 30) + 10 : 
                      plan.id === 2 ? Math.floor(Math.random() * 800) + 200 : 0
      }))
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-extrabold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Flexible pricing options designed to grow with your business
        </p>
        
        {/* Demo Button */}
        <button
          onClick={updatePricing}
          className="mt-6 bg-[#38BDF8] text-white px-6 py-2 rounded-lg hover:bg-[#29a8d0] transition-colors"
        >
          🎲 Simulate Price Update
        </button>
      </div>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <PricingCard plan={plan} key={plan.id} />
        ))}
      </div>

      {/* Pricing Info */}
      <div className="mt-16 text-center">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">How Our Pricing Works</h3>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div>
              <h4 className="font-semibold text-[#38BDF8] mb-2">Percentage Discounts</h4>
              <p className="text-gray-600">Get percentage-based discounts that scale with the original price. Perfect for seasonal sales and promotions.</p>
            </div>
            <div>
              <h4 className="font-semibold text-[#38BDF8] mb-2">Flat Amount Discounts</h4>
              <p className="text-gray-600">Fixed amount discounts like "₹500 off" provide clear savings regardless of the original price.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}