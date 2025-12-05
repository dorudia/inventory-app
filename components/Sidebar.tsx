"use client";

import { SignOutButton } from "@clerk/nextjs";
import {
  BarChart3,
  LogOut,
  Package,
  Plus,
  Settings,
  AlertCircle,
  ChevronDown,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useInventory } from "@/contexts/InventoryContext";

interface Stats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

const Sidebar = () => {
  const pathname = usePathname();
  const [stats, setStats] = useState<Stats | null>(null);
  const { inventories, activeInventory, setActiveInventory, loading } =
    useInventory();
  const [showInventoryDropdown, setShowInventoryDropdown] = useState(false);

  useEffect(() => {
    if (activeInventory) {
      fetch(`/api/stats?inventoryId=${activeInventory._id}`)
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch((err) => console.error(err));
    }
  }, [activeInventory]);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Add Product", href: "/add-product", icon: Plus },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="fixed left-0 top-0 z-10 p-4  bg-gray-900 text-slate-100 w-64 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <p className="text-lg font-semibold">Inventory App</p>
          <BarChart3 className="ml-2 h-6 w-6" />
        </div>

        {/* Inventory Selector */}
        {!loading && activeInventory && (
          <div className="mb-6 relative">
            <button
              onClick={() => setShowInventoryDropdown(!showInventoryDropdown)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 flex items-center justify-between hover:bg-gray-750 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium truncate">
                  {activeInventory.name}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showInventoryDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {inventories.map((inv) => (
                  <button
                    key={inv._id}
                    onClick={() => {
                      setActiveInventory(inv);
                      setShowInventoryDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-700 transition-colors cursor-pointer ${
                      inv._id === activeInventory._id
                        ? "bg-gray-700 text-white"
                        : "text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Warehouse className="w-3 h-3" />
                      <span className="truncate">{inv.name}</span>
                    </div>
                    {inv.description && (
                      <p className="text-xs text-slate-500 ml-5 truncate">
                        {inv.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <nav className="space-y-1 border border-gray-600 p-4 mb-6">
          <div className="text-sm font-semibold text-slate-400 uppercase">
            Inventory
          </div>
          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 hover:text-white transition-colors cursor-pointer ${
                  isActive ? "bg-gray-800 text-white" : "text-slate-400"
                }`}
              >
                <div className="flex items-center">
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? "text-white" : "text-slate-400"
                    }`}
                  />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats */}
        {stats && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <div className="text-xs font-semibold text-slate-400 uppercase mb-3">
              Quick Stats
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Products</span>
                <span className="font-semibold text-white">
                  {stats.totalProducts}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Total Value</span>
                <span className="font-semibold text-green-400">
                  ${stats.totalValue.toLocaleString()}
                </span>
              </div>
              {stats.lowStockCount > 0 && (
                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-700">
                  <span className="text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Low Stock
                  </span>
                  <span className="font-semibold text-amber-400">
                    {stats.lowStockCount}
                  </span>
                </div>
              )}
              {stats.outOfStockCount > 0 && (
                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-700">
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Out of Stock
                  </span>
                  <span className="font-semibold text-red-400">
                    {stats.outOfStockCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="absolute bottom-10 left-0 right-0 p-4 border-t border-gray-700">
          <SignOutButton>
            <button className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer">
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
