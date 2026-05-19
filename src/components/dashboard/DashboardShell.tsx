"use client";

import { Tabs, TabList, TabTrigger, TabPanel } from "@/components/ui/Tabs";
import { OverviewTab } from "./tabs/OverviewTab";
import { PipelineTab } from "./tabs/PipelineTab";
import { PaymentsTab } from "./tabs/PaymentsTab";
import { SettingsTab } from "./tabs/SettingsTab";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "pipeline", label: "Pipeline" },
  { id: "payments", label: "Payments" },
  { id: "settings", label: "Settings" },
] as const;

export function DashboardShell() {
  return (
    <Tabs defaultTab="overview">
      <TabList>
        {TABS.map((t) => (
          <TabTrigger key={t.id} tabId={t.id}>
            {t.label}
          </TabTrigger>
        ))}
      </TabList>

      <TabPanel tabId="overview"><OverviewTab /></TabPanel>
      <TabPanel tabId="pipeline"><PipelineTab /></TabPanel>
      <TabPanel tabId="payments"><PaymentsTab /></TabPanel>
      <TabPanel tabId="settings"><SettingsTab /></TabPanel>
    </Tabs>
  );
}
