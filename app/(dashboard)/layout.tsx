import Sidebar from "@/components/Sidebar";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { SettingsProvider } from "@/contexts/SettingsContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SettingsProvider>
      <InventoryProvider>
        <Sidebar />
        {children}
      </InventoryProvider>
    </SettingsProvider>
  );
}
