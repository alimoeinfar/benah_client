import Link from "next/link";
import { Eye } from "lucide-react";

const LINKS = {
  Product: [
    { label: "Retinal Imaging", href: "#how-it-works" },
    { label: "AI Analysis", href: "#features" },
    { label: "Clinical Reports", href: "#features" },
    { label: "Pricing", href: "#pricing" },
  ],
  Company: [
    { label: "About Us", href: "#about" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#contact" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "Research", href: "#" },
    { label: "Case Studies", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">

        {/* Top */}
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-teal-500">
                <Eye className="h-4 w-4 text-teal-500" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-white">
                benah <span className="text-teal-400">AI</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed">
              AI-powered retinal imaging analysis for precision clinical diagnosis.
            </p>
          </div>

          {/* Nav columns */}
          {Object.entries(LINKS).map(([category, items]) => (
            <div key={category}>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
                {category}
              </p>
              <ul className="space-y-3">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm hover:text-teal-400 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} Benah AI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-teal-400 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-teal-400 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-teal-400 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
