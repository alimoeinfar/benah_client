import { Eye, Target, Users } from "lucide-react";

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — text */}
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-teal-600">
              About Benah AI
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              Making retinal expertise{" "}
              <span className="text-teal-700">universally accessible</span>
            </h2>
            <p className="mt-5 text-gray-500 leading-relaxed">
              Hundreds of millions of people worldwide are at risk of vision-threatening retinal
              diseases, yet access to specialist ophthalmologists remains severely limited in many
              regions. Benah AI bridges this gap.
            </p>
            <p className="mt-4 text-gray-500 leading-relaxed">
              Our platform brings together advances in computer vision, clinical imaging, and
              medical AI to give every eye care professional — regardless of their location or
              resources — access to specialist-level retinal analysis.
            </p>

            <div className="mt-10 grid sm:grid-cols-3 gap-6">
              {[
                { icon: Eye, label: "Vision", text: "A world where no retinal disease goes undetected" },
                { icon: Target, label: "Mission", text: "Precision AI tools that augment clinical expertise" },
                { icon: Users, label: "For", text: "Ophthalmologists, optometrists & clinicians globally" },
              ].map(({ icon: Icon, label, text }) => (
                <div key={label} className="flex flex-col">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700 mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                  <p className="mt-1 text-sm text-gray-600">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — stat cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "285M", label: "People living with vision impairment worldwide", color: "bg-teal-700" },
              { value: "80%", label: "Of blindness cases are preventable or treatable", color: "bg-gray-900" },
              { value: "10+", label: "Retinal conditions detectable with Benah AI", color: "bg-gray-900" },
              { value: "95%+", label: "Sensitivity in clinical validation studies", color: "bg-teal-700" },
            ].map(({ value, label, color }) => (
              <div
                key={value}
                className={`${color} rounded-2xl p-6 text-white`}
              >
                <p className="text-4xl font-extrabold">{value}</p>
                <p className="mt-2 text-sm opacity-75 leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
