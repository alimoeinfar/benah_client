"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Building2, ArrowRight } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/constants";

function FieldIcon({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
  );
}

const inputCx =
  "block w-full rounded-xl border border-[var(--border)] bg-[var(--surface-0)] pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] shadow-[var(--shadow-sm)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 transition";

export function RegisterForm() {
  const router = useRouter();
  const { setAuth } = useAuth();

  const [firstName, setFirstName]       = useState("");
  const [lastName, setLastName]         = useState("");
  const [email, setEmail]               = useState("");
  const [organisation, setOrganisation] = useState("");
  const [password, setPassword]         = useState("");
  const [confirmPassword, setConfirm]   = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [isLoading, setIsLoading]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    const name   = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
    const result = await authApi.register({ name, email, password, organisation: organisation.trim() });

    if (!result.ok) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setAuth(result.data);
    router.push(ROUTES.dashboard);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Create your account</h1>
        <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
          Start your free 30-day trial — no credit card required
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>

        {/* Error banner */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="first-name" className="text-xs font-semibold text-[var(--text-secondary)]">
              First name
            </label>
            <div className="relative">
              <FieldIcon icon={User} />
              <input
                id="first-name"
                type="text"
                autoComplete="given-name"
                placeholder="Jane"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputCx}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="last-name" className="text-xs font-semibold text-[var(--text-secondary)]">
              Last name
            </label>
            <div className="relative">
              <FieldIcon icon={User} />
              <input
                id="last-name"
                type="text"
                autoComplete="family-name"
                placeholder="Smith"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputCx}
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-[var(--text-secondary)]">
            Work email
          </label>
          <div className="relative">
            <FieldIcon icon={Mail} />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="jane@clinic.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCx}
            />
          </div>
        </div>

        {/* Organisation */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="organisation" className="text-xs font-semibold text-[var(--text-secondary)]">
            Organisation
          </label>
          <div className="relative">
            <FieldIcon icon={Building2} />
            <input
              id="organisation"
              type="text"
              autoComplete="organization"
              placeholder="City Eye Hospital"
              required
              value={organisation}
              onChange={(e) => setOrganisation(e.target.value)}
              className={inputCx}
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-semibold text-[var(--text-secondary)]">
            Password
          </label>
          <div className="relative">
            <FieldIcon icon={Lock} />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl border border-[var(--border)] bg-[var(--surface-0)] pl-10 pr-11 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] shadow-[var(--shadow-sm)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirm-password" className="text-xs font-semibold text-[var(--text-secondary)]">
            Confirm password
          </label>
          <div className="relative">
            <FieldIcon icon={Lock} />
            <input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirm(e.target.value)}
              className="block w-full rounded-xl border border-[var(--border)] bg-[var(--surface-0)] pl-10 pr-11 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] shadow-[var(--shadow-sm)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 transition"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--border)] accent-[var(--brand)] cursor-pointer"
          />
          <span className="text-xs text-[var(--text-secondary)] leading-relaxed">
            I agree to Benah AI&apos;s{" "}
            <Link href="#" className="font-semibold text-[var(--brand)] hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="#" className="font-semibold text-[var(--brand)] hover:underline">Privacy Policy</Link>
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] py-3 text-sm font-bold text-white shadow-[var(--shadow-brand)] hover:bg-[var(--brand-dark)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating account…" : <> Create account <ArrowRight className="h-4 w-4" /> </>}
        </button>

      </form>

      {/* Footer link */}
      <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)] transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
