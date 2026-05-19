"use client";

import { useState } from "react";

export type DashboardTab = "overview" | "pipeline" | "payments" | "settings";

export function useDashboardTabs(initial: DashboardTab = "overview") {
  const [activeTab, setActiveTab] = useState<DashboardTab>(initial);
  return { activeTab, setActiveTab };
}
