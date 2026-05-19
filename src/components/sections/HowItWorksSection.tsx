import { Camera, BrainCircuit, FileText, ArrowRight } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Camera,
    title: "Capture",
    subtitle: "Retinal image & video acquisition",
    description:
      "Compatible with standard fundus cameras and OCT devices. Benah AI accepts still images and video recordings from existing clinical equipment — no hardware replacement required.",
    tags: ["Fundus camera", "OCT", "Ultra-widefield", "Video"],
  },
  {
    number: "02",
    icon: BrainCircuit,
    title: "Analyse",
    subtitle: "AI-powered computer vision",
    description:
      "Our deep learning models detect and grade retinal pathologies across multiple disease categories — from diabetic retinopathy and macular degeneration to glaucomatous changes — in under 30 seconds.",
    tags: ["Lesion detection", "Severity grading", "Multi-disease", "Real-time"],
  },
  {
    number: "03",
    icon: FileText,
    title: "Report",
    subtitle: "Structured outputs for experts",
    description:
      "Clinicians receive annotated images, quantitative measurements, and a structured diagnostic report — all designed to support, not replace, the expert's final judgement.",
    tags: ["Annotated images", "Measurements", "PDF export", "EHR-ready"],
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-widest text-teal-600">
            The process
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900">
            From capture to clinical insight
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Three seamless steps transform raw retinal data into clear, actionable reports
            for your diagnostic workflow.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-16 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-teal-200 via-teal-400 to-teal-200"
          />

          <div className="grid lg:grid-cols-3 gap-10">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative flex flex-col items-center text-center lg:items-start lg:text-left">

                  {/* Icon bubble */}
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-lg shadow-teal-700/30 mb-6">
                    <Icon className="h-6 w-6" />
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-teal-300">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                  <p className="mt-0.5 text-sm font-medium text-teal-600">{step.subtitle}</p>
                  <p className="mt-3 text-sm text-gray-500 leading-relaxed">{step.description}</p>

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-2 justify-center lg:justify-start">
                    {step.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-teal-50 border border-teal-100 px-3 py-1 text-xs font-medium text-teal-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Arrow connector (mobile) */}
                  {i < STEPS.length - 1 && (
                    <div className="lg:hidden mt-8 flex justify-center w-full">
                      <ArrowRight className="h-5 w-5 text-teal-300 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
