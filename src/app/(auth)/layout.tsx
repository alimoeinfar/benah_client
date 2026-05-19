import Link from "next/link";
import { Eye, ArrowLeft, ScanEye, FileText, ShieldCheck } from "lucide-react";

const FEATURES = [
  { icon: ScanEye,    text: "Multi-disease retinal screening in under 30 seconds" },
  { icon: ShieldCheck,text: "Clinically validated across diverse patient populations" },
  { icon: FileText,   text: "Structured diagnostic reports ready for expert review" },
];

function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between w-[45%] shrink-0 bg-gradient-to-br from-teal-950 via-teal-900 to-gray-900 px-12 py-10 relative overflow-hidden">

      {/* Decorative background rings */}
      <div aria-hidden="true" className="absolute -top-32 -right-32 h-96 w-96 rounded-full border border-teal-700/30" />
      <div aria-hidden="true" className="absolute -top-16 -right-16 h-64 w-64 rounded-full border border-teal-600/20" />
      <div aria-hidden="true" className="absolute bottom-0 -left-24 h-72 w-72 rounded-full border border-teal-800/40" />

      {/* Logo */}
      <Link href="/" className="relative flex items-center gap-2.5 w-fit">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-teal-400">
          <Eye className="h-4.5 w-4.5 text-teal-400" strokeWidth={2.5} />
        </div>
        <span className="text-lg font-bold text-white">
          benah <span className="text-teal-400">AI</span>
        </span>
      </Link>

      {/* Centre content */}
      <div className="relative">
        {/* Retinal eye illustration */}
        <div className="mb-10 flex justify-center">
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 rounded-full bg-teal-500/10 blur-2xl" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-orange-950 via-red-950 to-rose-900 border border-teal-500/20 shadow-2xl">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 120" fill="none">
                <path d="M54 42 C44 54 30 60 18 78" stroke="#f97316" strokeWidth="1.2" strokeOpacity="0.5" />
                <path d="M54 42 C60 51 66 60 72 84" stroke="#f97316" strokeWidth="1" strokeOpacity="0.45" />
                <path d="M54 42 C48 36 36 30 24 36" stroke="#f97316" strokeWidth="0.8" strokeOpacity="0.4" />
                <path d="M54 42 C57 36 66 33 78 30" stroke="#f97316" strokeWidth="0.8" strokeOpacity="0.4" />
                <path d="M54 42 C66 48 78 54 90 48" stroke="#f97316" strokeWidth="1" strokeOpacity="0.4" />
              </svg>
              <div className="absolute top-[28%] left-[38%] h-8 w-8 rounded-full bg-gradient-to-br from-yellow-300/70 to-orange-300/50 blur-sm" />
              <div className="absolute inset-3 rounded-full border border-teal-400/25 animate-ping" style={{ animationDuration: "3s" }} />
              <div className="absolute inset-3 rounded-full border border-teal-400/15" />
              <div className="absolute top-[20%] left-[58%] h-3.5 w-3.5 rounded-full border-2 border-teal-400 bg-teal-400/10" />
              <div className="absolute top-[53%] left-[22%] h-3 w-3 rounded-full border-2 border-yellow-400 bg-yellow-400/10" />
            </div>
            <div className="absolute -bottom-1 -right-3 flex items-center gap-1.5 rounded-lg border border-teal-500/30 bg-teal-950/80 px-3 py-1.5 backdrop-blur text-[10px] text-teal-300 shadow-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              AI ready
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-white leading-snug">
          See what the{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-teal-500">
            eye reveals
          </span>
        </h2>
        <p className="mt-3 text-sm text-gray-400 leading-relaxed">
          Join thousands of clinicians using Benah AI to detect retinal disease
          faster and with greater confidence.
        </p>

        <ul className="mt-8 space-y-4">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-700/50 mt-0.5">
                <Icon className="h-3.5 w-3.5 text-teal-300" />
              </div>
              <p className="text-sm text-gray-300">{text}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom quote */}
      <div className="relative rounded-xl border border-teal-800/60 bg-teal-900/40 px-5 py-4">
        <p className="text-xs text-gray-300 italic leading-relaxed">
          &ldquo;Benah AI has transformed how we screen diabetic patients.
          The speed and accuracy are remarkable.&rdquo;
        </p>
        <p className="mt-2 text-xs font-semibold text-teal-400">
          Dr. Sarah Mitchell · Consultant Ophthalmologist
        </p>
      </div>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <BrandPanel />

      {/* Form panel */}
      <div className="flex flex-1 flex-col bg-[var(--surface-1)]">
        {/* Back to site link */}
        <div className="px-8 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
        </div>

        {/* Centred form */}
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>

        {/* Footer */}
        <p className="px-8 pb-6 text-center text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} Benah AI · All rights reserved
        </p>
      </div>
    </div>
  );
}
