/**
 * Design system constants — benah AI
 *
 * These mirror the CSS custom properties in globals.css.
 * Use these when you need token values inside JS/TS logic
 * (chart colours, canvas drawing, dynamic styles).
 * For Tailwind class usage, rely on the CSS variables directly.
 */

export const COLORS = {
  brand:        "#0f766e",
  brandDark:    "#115e59",
  brandMid:     "#14b8a6",
  brandLight:   "#f0fdfa",
  brandSubtle:  "#ccfbf1",

  textPrimary:  "#111827",
  textSecondary:"#4b5563",
  textMuted:    "#9ca3af",

  success:      "#16a34a",
  warning:      "#d97706",
  danger:       "#dc2626",

  surfaceDark:  "#031f1e",
} as const;

export const RADIUS = {
  sm:   "6px",
  md:   "8px",
  lg:   "12px",
  xl:   "16px",
  "2xl":"20px",
} as const;

/**
 * Standard Tailwind class sets — copy these rather than
 * re-inventing button / badge / input styles per component.
 */
export const CX = {
  /** Primary action button */
  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-brand)] hover:bg-[var(--brand-dark)] transition-colors duration-[var(--duration-base)]",

  /** Ghost / outline button */
  btnOutline:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors duration-[var(--duration-base)]",

  /** Standard card */
  card:
    "rounded-xl border border-[var(--border)] bg-[var(--surface-0)] shadow-[var(--shadow-sm)]",

  /** Form input */
  input:
    "block w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-3 py-2.5 text-sm placeholder-[var(--text-muted)] shadow-[var(--shadow-sm)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20",

  /** Section label (small caps above headings) */
  sectionLabel:
    "text-xs font-semibold uppercase tracking-widest text-[var(--brand)]",

  /** Active sidebar nav item */
  navActive:
    "flex items-center gap-3 rounded-lg border-l-2 border-[var(--brand)] bg-[var(--brand-light)] px-3 py-2.5 text-sm font-semibold text-[var(--brand)]",

  /** Inactive sidebar nav item */
  navInactive:
    "flex items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors",
} as const;
