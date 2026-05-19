"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Eye, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface DropdownItem {
  label: string;
  href: string;
  description?: string;
}

interface NavItem {
  label: string;
  href?: string;
  dropdown?: DropdownItem[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "About Us",
    dropdown: [
      { label: "Our Mission", href: "#about", description: "Advancing retinal diagnostics worldwide" },
      { label: "Our Team", href: "#team", description: "Clinicians, engineers and AI researchers" },
    ],
  },
  {
    label: "Product",
    dropdown: [
      { label: "Retinal Imaging", href: "#how-it-works", description: "Multi-modal image and video capture" },
      { label: "AI Analysis", href: "#features", description: "Deep learning lesion detection and grading" },
      { label: "Clinical Reports", href: "#features", description: "Structured outputs ready for diagnosis" },
    ],
  },
  {
    label: "Resources",
    dropdown: [
      { label: "Documentation", href: "#", description: "Integration guides and API reference" },
      { label: "Research", href: "#", description: "Clinical validation studies" },
      { label: "Case Studies", href: "#", description: "Real-world deployment outcomes" },
    ],
  },
  {
    label: "For Clinicians",
    dropdown: [
      { label: "Ophthalmology", href: "#", description: "Retinal disease screening and monitoring" },
      { label: "Diabetes Care", href: "#", description: "Diabetic retinopathy grading" },
      { label: "Research Institutions", href: "#", description: "Population-scale retinal analysis" },
    ],
  },
];

function DropdownMenu({ items }: { items: DropdownItem[] }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5">
      <div className="p-2">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col rounded-lg px-4 py-3 hover:bg-teal-50 transition-colors group"
          >
            <span className="text-sm font-medium text-gray-900 group-hover:text-teal-700">
              {item.label}
            </span>
            {item.description && (
              <span className="mt-0.5 text-xs text-gray-500">{item.description}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

function NavItemComponent({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!item.dropdown) {
    return (
      <Link
        href={item.href ?? "#"}
        className="text-sm font-medium text-gray-700 hover:text-teal-700 transition-colors"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-teal-700 transition-colors"
        aria-expanded={open}
      >
        {item.label}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <DropdownMenu items={item.dropdown} />}
    </div>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const isLoggedIn = !isLoading && !!user;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-teal-600">
              <Eye className="h-4 w-4 text-teal-600" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-gray-900">
              benah <span className="text-teal-600">AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <NavItemComponent key={item.label} item={item} />
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-colors shadow-sm"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-colors shadow-sm"
                >
                  Free Trial
                </Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <div key={item.label}>
              <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {item.label}
              </p>
              {item.dropdown?.map((child) => (
                <Link
                  key={child.label}
                  href={child.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm text-gray-700 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                >
                  {child.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="text-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-center text-sm font-medium text-gray-600 py-2">
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="text-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
