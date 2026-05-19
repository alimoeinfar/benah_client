import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section id="cta" className="py-24 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl bg-gradient-to-br from-teal-700 to-teal-900 px-8 py-16 sm:px-16 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Ready to see what Benah AI can do?
          </h2>
          <p className="mt-4 text-lg text-teal-200 max-w-xl mx-auto">
            Start your free trial today and experience AI-powered retinal analysis
            integrated into your clinical workflow.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-teal-800 hover:bg-teal-50 transition-colors shadow-lg"
            >
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Talk to Sales
            </Link>
          </div>
          <p className="mt-6 text-xs text-teal-300">
            No credit card required · 30-day free trial · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
