"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Eye,
  LayoutDashboard,
  FlaskConical,
  Users,
  UserCircle,
  Building2,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard",              label: "Dashboard",    icon: LayoutDashboard, adminOnly: false },
  { href: "/dashboard/pipeline",     label: "Pipeline",     icon: FlaskConical,    adminOnly: false },
  { href: "/dashboard/patients",     label: "Patients",     icon: Users,           adminOnly: false },
  { href: "/dashboard/profile",      label: "Profile",      icon: UserCircle,      adminOnly: false },
  { href: "/dashboard/organisation", label: "Organisation", icon: Building2,       adminOnly: true  },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();
  const { clearAuth, user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === 'admin';

  function handleSignOut() {
    clearAuth();
    router.push("/login");
  }

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface-0)]">

      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--brand)]">
            <Eye className="h-4 w-4 text-[var(--brand)]" strokeWidth={2.5} />
          </div>
          <span className="text-base font-bold text-[var(--text-primary)]">
            benah <span className="text-[var(--brand)]">AI</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Menu
        </p>

        {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-[var(--brand)] bg-[var(--brand-light)] text-[var(--brand)] font-semibold"
                  : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-[var(--brand)]" : "text-[var(--text-muted)]"
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-[var(--border)]">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-600 transition-colors group"
        >
          <LogOut className="h-4 w-4 shrink-0 text-[var(--text-muted)] group-hover:text-red-500" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
