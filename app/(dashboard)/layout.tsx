import Sidebar from "@/components/Sidebar";
import { InventoryProvider } from "@/contexts/InventoryContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InventoryProvider>
      <Sidebar />
      {children}
    </InventoryProvider>
  );
}
