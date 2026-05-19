import Link from "next/link";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "30-day trial",
    description: "Perfect for evaluating Benah AI in your practice.",
    features: [
      "Up to 50 scans",
      "3 disease categories",
      "PDF report export",
      "Email support",
    ],
    cta: "Start free trial",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Clinical",
    price: "$299",
    period: "per month",
    description: "For practices with regular screening volumes.",
    features: [
      "Unlimited scans",
      "All 10+ disease categories",
      "Video analysis",
      "EHR/DICOM integration",
      "Priority support",
      "Longitudinal tracking",
    ],
    cta: "Get started",
    href: "/register",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "volume pricing",
    description: "For hospitals, screening programmes, and research institutions.",
    features: [
      "Everything in Clinical",
      "Dedicated infrastructure",
      "White-label reports",
      "Custom model fine-tuning",
      "SLA guarantee",
      "Dedicated account manager",
    ],
    cta: "Contact sales",
    href: "#contact",
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-widest text-teal-600">
            Pricing
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            Start with a free trial. Scale as your volume grows.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-teal-600 bg-teal-700 text-white shadow-2xl shadow-teal-700/30 scale-[1.02]"
                  : "border-gray-200 bg-white text-gray-900"
              }`}
            >
              <p className={`text-xs font-bold uppercase tracking-widest ${plan.highlighted ? "text-teal-200" : "text-teal-600"}`}>
                {plan.name}
              </p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className={`text-sm ${plan.highlighted ? "text-teal-200" : "text-gray-400"}`}>
                  / {plan.period}
                </span>
              </div>
              <p className={`mt-2 text-sm ${plan.highlighted ? "text-teal-100" : "text-gray-500"}`}>
                {plan.description}
              </p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <Check className={`h-4 w-4 shrink-0 ${plan.highlighted ? "text-teal-300" : "text-teal-600"}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-8 block text-center rounded-xl py-3 text-sm font-semibold transition-colors ${
                  plan.highlighted
                    ? "bg-white text-teal-800 hover:bg-teal-50"
                    : "bg-teal-700 text-white hover:bg-teal-800"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
