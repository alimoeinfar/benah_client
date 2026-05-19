"use client";

import { createContext, useContext, useState, ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  active: string;
  setActive: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs sub-component must be inside <Tabs>");
  return ctx;
}

interface TabsProps {
  defaultTab: string;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultTab, children, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn("flex gap-1 border-b border-gray-200", className)}
      {...props}
    />
  );
}

interface TabTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  tabId: string;
}

export function TabTrigger({ tabId, className, children, ...props }: TabTriggerProps) {
  const { active, setActive } = useTabs();
  const isActive = active === tabId;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActive(tabId)}
      className={cn(
        "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
        isActive
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  tabId: string;
}

export function TabPanel({ tabId, className, ...props }: TabPanelProps) {
  const { active } = useTabs();
  if (active !== tabId) return null;
  return <div role="tabpanel" className={cn("py-4", className)} {...props} />;
}
