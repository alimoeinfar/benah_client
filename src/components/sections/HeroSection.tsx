import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { RetinalGraphic } from "@/components/ui/RetinalGraphic";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-br from-teal-950 via-teal-900 to-gray-900 text-white"
    >
      {/* Subtle grid overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/40 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-teal-300 mb-6">
              Retinal AI Platform
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              See what the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-teal-500">
                eye reveals
              </span>
            </h1>

            <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-xl">
              Benah AI transforms retinal images and videos into actionable diagnostic insights —
              helping ophthalmologists and clinicians detect and monitor retinal diseases with
              confidence and speed.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-400 transition-colors shadow-lg shadow-teal-900/50"
              >
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <Play className="h-4 w-4" /> See how it works
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex flex-wrap gap-8 text-center">
              {[
                { stat: "95%+", label: "Detection accuracy" },
                { stat: "<30s", label: "Per scan analysis" },
                { stat: "10+", label: "Disease markers" },
              ].map(({ stat, label }) => (
                <div key={label}>
                  <p className="text-3xl font-bold text-teal-300">{stat}</p>
                  <p className="mt-1 text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — retinal illustration */}
          <div className="flex justify-center lg:justify-end">
            <RetinalGraphic />
          </div>
        </div>
      </div>
    </section>
  );
}
