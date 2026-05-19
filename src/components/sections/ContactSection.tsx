import { Mail, MapPin, Phone } from "lucide-react";

export function ContactSection() {
  return (
    <section id="contact" className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">

          {/* Left — contact info */}
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-teal-600">
              Get in touch
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900">
              Let&apos;s talk about your clinic
            </h2>
            <p className="mt-4 text-gray-500 leading-relaxed">
              Whether you&apos;re exploring Benah AI for a single practice or a large
              screening programme, our team is happy to help you find the right fit.
            </p>

            <div className="mt-8 space-y-5">
              {[
                { icon: Mail, label: "Email", value: "hello@benahAI.com" },
                { icon: Phone, label: "Phone", value: "+1 (800) 000-0000" },
                { icon: MapPin, label: "Headquarters", value: "San Francisco, CA, USA" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                    <p className="text-sm text-gray-700">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <form className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">First name</label>
                <input
                  type="text"
                  placeholder="Jane"
                  className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">Last name</label>
                <input
                  type="text"
                  placeholder="Smith"
                  className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Work email</label>
              <input
                type="email"
                placeholder="jane@clinic.com"
                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Organisation</label>
              <input
                type="text"
                placeholder="City Eye Hospital"
                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Message</label>
              <textarea
                rows={4}
                placeholder="Tell us about your use case..."
                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-teal-700 py-3 text-sm font-semibold text-white hover:bg-teal-800 transition-colors"
            >
              Send message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
