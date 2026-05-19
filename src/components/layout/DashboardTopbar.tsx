"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, CheckCheck, Coins, ChevronDown, CircleCheck, CircleX } from "lucide-react";
import { pipelineApi } from "@/lib/api/pipeline";
import { notificationsApi } from "@/lib/api/notifications";
import type { Notification } from "@/types/notification";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":              "Dashboard",
  "/dashboard/pipeline":     "Pipeline",
  "/dashboard/pipeline/new": "New Analysis",
  "/dashboard/outputs":      "Outputs",
  "/dashboard/profile":      "Profile",
  "/dashboard/organisation": "Organisation",
  "/dashboard/patients":     "Patients",
};

function resolveTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (/^\/dashboard\/pipeline\/\d+$/.test(pathname)) return "Run Outputs";
  if (/^\/dashboard\/patients\/\d+$/.test(pathname))  return "Patient";
  return "Dashboard";
}

function CreditChip({ credits }: { credits: string | null }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--brand-subtle)] bg-[var(--brand-light)] px-4 py-1.5 cursor-pointer hover:bg-[var(--brand-subtle)] transition-colors group">
      <Coins className="h-4 w-4 text-[var(--brand)]" />
      <div className="flex flex-col leading-none">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand)] opacity-70">
          Credits
        </span>
        <span className="text-sm font-bold text-[var(--brand)]">
          {credits === null ? "…" : parseFloat(credits).toLocaleString()}
        </span>
      </div>
      <ChevronDown className="h-3.5 w-3.5 text-[var(--brand)] opacity-60 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationPanel({
  notifications,
  onMarkRead,
}: {
  notifications: Notification[];
  onMarkRead: () => void;
}) {
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-[var(--border)] bg-[var(--surface-0)] shadow-lg z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-[var(--brand)] px-1.5 py-0.5 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </span>
        {unreadCount > 0 && (
          <button
            onClick={onMarkRead}
            className="flex items-center gap-1 text-xs text-[var(--brand)] hover:underline"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-[var(--border)]">
        {notifications.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">
            No notifications yet.
          </p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                n.is_read ? "bg-[var(--surface-0)]" : "bg-[var(--brand-light)]"
              }`}
            >
              {n.type === "run_completed" ? (
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              ) : (
                <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)] leading-snug">{n.message}</p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">{timeAgo(n.created_at)}</p>
              </div>
              {!n.is_read && (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--brand)]" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function DashboardTopbar() {
  const pathname = usePathname();
  const title = resolveTitle(pathname);
  const [credits, setCredits] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    pipelineApi.getDashboardStats().then((res) => {
      if (res.ok) setCredits(res.data.credits);
    });
  }, []);

  // Initial load + poll every 30 s
  useEffect(() => {
    const load = () =>
      notificationsApi.list().then((res) => {
        if (res.ok) setNotifications(res.data);
      });
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    if (!panelOpen) return;
    function handleMouseDown(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [panelOpen]);

  const unread = notifications.filter((n) => !n.is_read).length;

  function handleMarkRead() {
    notificationsApi.markRead().then((res) => {
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    });
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface-0)] px-6">

      {/* Page title */}
      <h1 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h1>

      {/* Right cluster */}
      <div className="flex items-center gap-3">

        {/* Credit chip */}
        <CreditChip credits={credits} />

        {/* Notifications */}
        <div ref={bellRef} className="relative">
          <button
            onClick={() => setPanelOpen((o) => !o)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--brand)]" />
            )}
          </button>

          {panelOpen && (
            <NotificationPanel
              notifications={notifications}
              onMarkRead={handleMarkRead}
            />
          )}
        </div>

      </div>
    </header>
  );
}
