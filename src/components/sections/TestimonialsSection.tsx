import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "Benah AI has transformed how we screen diabetic patients for retinopathy. The speed and accuracy mean we can see far more patients without compromising on quality.",
    name: "Dr. Sarah Mitchell",
    role: "Consultant Ophthalmologist",
    org: "City Eye Hospital",
    initials: "SM",
  },
  {
    quote:
      "The structured reports are exceptional — they give exactly the detail I need to make confident referral decisions, even in a high-volume screening programme.",
    name: "Dr. Karim Al-Hassan",
    role: "Retinal Specialist",
    org: "Regional Medical Centre",
    initials: "KA",
  },
  {
    quote:
      "We integrated Benah AI with our existing EHR in under a week. The API is clean, the documentation is thorough, and the support team is genuinely responsive.",
    name: "Priya Nair",
    role: "Clinical Informatics Lead",
    org: "National Eye Institute",
    initials: "PN",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-teal-950 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-widest text-teal-400">
            Testimonials
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold">
            Trusted by eye care professionals
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ quote, name, role, org, initials }) => (
            <div
              key={name}
              className="flex flex-col rounded-2xl border border-teal-800 bg-teal-900/50 p-8"
            >
              <Quote className="h-6 w-6 text-teal-500 mb-4" />
              <p className="text-sm text-gray-300 leading-relaxed flex-1">&ldquo;{quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-xs text-gray-400">
                    {role} · {org}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
