import { ScanEye, Layers, ShieldCheck, BarChart3, Plug, Clock } from "lucide-react";

const FEATURES = [
  {
    icon: ScanEye,
    title: "Multi-pathology Detection",
    description:
      "Simultaneously screens for diabetic retinopathy, age-related macular degeneration, glaucoma, and more than ten additional retinal conditions in a single scan.",
  },
  {
    icon: Layers,
    title: "Image & Video Analysis",
    description:
      "Processes both still fundus images and dynamic video recordings, capturing temporal changes and vascular patterns invisible in single frames.",
  },
  {
    icon: BarChart3,
    title: "Quantitative Grading",
    description:
      "Produces severity scores, lesion counts, and longitudinal tracking measurements so clinicians can monitor disease progression over time.",
  },
  {
    icon: ShieldCheck,
    title: "Clinically Validated",
    description:
      "Models trained and independently validated on diverse, multi-ethnic retinal datasets to ensure consistent performance across patient populations.",
  },
  {
    icon: Plug,
    title: "Seamless Integration",
    description:
      "REST API and DICOM-compatible output make integration with existing PACS, EHR, and clinical management systems straightforward.",
  },
  {
    icon: Clock,
    title: "Results in Under 30 Seconds",
    description:
      "Rapid inference means results arrive before the patient leaves the chair — enabling same-visit clinical decisions.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-widest text-teal-600">
            Capabilities
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900">
            Built for clinical precision
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Every feature in Benah AI is designed around the real constraints and requirements
            of clinical ophthalmology.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-8 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50 transition-all duration-200"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
