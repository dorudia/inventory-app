"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Settings {
  currency: string;
  dateFormat: string;
  chartType: "bar" | "area";
}

interface SettingsContextType {
  settings: Settings;
  refreshSettings: () => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    currency: "$",
    dateFormat: "MM/DD/YYYY",
    chartType: "bar",
  });
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      setSettings({
        currency: data.currency || "$",
        dateFormat: data.dateFormat || "MM/DD/YYYY",
        chartType: data.chartType || "bar",
      });
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        refreshSettings,
        loading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
