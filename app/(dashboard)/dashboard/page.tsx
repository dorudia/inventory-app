"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  DollarSign,
  AlertTriangle,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { useInventory } from "@/contexts/InventoryContext";
import { useSettings } from "@/contexts/SettingsContext";

interface DashboardData {
  metrics: {
    totalProducts: number;
    totalValue: number;
    lowStock: number;
    outOfStock: number;
    inStock: number;
  };
  weeklyData: { week: string; products: number }[];
  recentProducts: {
    name: string;
    quantity: number;
    lowStockAt: number;
    status: number;
  }[];
  efficiency: {
    inStockPercent: number;
    lowStockPercent: number;
    outOfStockPercent: number;
  };
}

const DashboardPage = () => {
  const { activeInventory } = useInventory();
  const { settings } = useSettings();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [localChartType, setLocalChartType] = useState<"bar" | "area">("bar");

  useEffect(() => {
    // Load dashboard data
    if (activeInventory) {
      fetch(`/api/dashboard?inventoryId=${activeInventory._id}`)
        .then((res) => res.json())
        .then((data) => {
          setData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [activeInventory]);

  // Sync local chart type with settings on mount
  useEffect(() => {
    if (settings.chartType) {
      setLocalChartType(settings.chartType);
    }
  }, [settings.chartType]);

  if (loading) {
    return (
      <main className="p-8 ml-64 bg-slate-100 min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-slate-500">Loading...</div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="p-8 ml-64 bg-slate-100 min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-red-500">
            Failed to load dashboard data
          </div>
        </div>
      </main>
    );
  }
  return (
    <main className="p-8 ml-64 bg-slate-100 min-h-screen">
      {/* Header */}
      <div className="p-6-80">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 text-center">
            Dashboard
          </h1>
          <p className="text-center text-slate-500">
            Welcome back! Here is an overview of your inventory.
          </p>
        </div>

        <div className="mt-6">{/* Dashboard content goes here */}</div>
      </div>

      <div className="grid  grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Key Metrics */}
        <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-600 mb-4">
            Key Metrics
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Package className="w-7 h-7 text-purple-600" />
              <p className="text-sm text-slate-600 flex-1">Total Products</p>
              <p className="text-xl font-bold text-slate-800">
                {data.metrics.totalProducts}
              </p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-7 h-7 text-green-600" />
              <p className="text-sm text-slate-600 flex-1">Total Value</p>
              <p className="text-xl font-bold text-slate-800">
                {settings.currency === "lei"
                  ? `${data.metrics.totalValue.toLocaleString()} ${settings.currency}`
                  : `${settings.currency}${data.metrics.totalValue.toLocaleString()}`
                }
              </p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
              <AlertTriangle className="w-7 h-7 text-amber-600" />
              <p className="text-sm text-slate-600 flex-1">Low Stock Items</p>
              <p className="text-xl font-bold text-slate-800">
                {data.metrics.lowStock}
              </p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <Package className="w-7 h-7 text-red-600" />
              <p className="text-sm text-slate-600 flex-1">Out of Stock</p>
              <p className="text-xl font-bold text-slate-800">
                {data.metrics.outOfStock}
              </p>
            </div>
          </div>
        </div>

        {/* Inventory over time/month */}
        <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-600">
              New products per week
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setLocalChartType("bar")}
                className={`p-2 rounded-lg transition-all ${
                  localChartType === "bar"
                    ? "bg-purple-100 text-purple-600"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                }`}
                title="Bar Chart"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setLocalChartType("area")}
                className={`p-2 rounded-lg transition-all ${
                  localChartType === "area"
                    ? "bg-purple-100 text-purple-600"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                }`}
                title="Area Chart"
              >
                <TrendingUp className="w-5 h-5" />
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            {localChartType === "bar" ? (
              <BarChart data={data.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" style={{ fontSize: "12px" }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="products" fill="#7c3aed" />
              </BarChart>
            ) : (
              <AreaChart data={data.weeklyData}>
                <defs>
                  <linearGradient
                    id="colorProducts"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" style={{ fontSize: "12px" }} />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="products"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProducts)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Stock Levels */}
        <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-600 mb-4">
            Stock Levels
          </h2>
          <div className="space-y-2">
            {data.recentProducts.map((product, idx) => {
              const statusColor =
                product.status === 0
                  ? "bg-red-500"
                  : product.status === 1
                  ? "bg-amber-500"
                  : "bg-green-500";
              const statusText =
                product.status === 0
                  ? "Out of Stock"
                  : product.status === 1
                  ? "Low Stock"
                  : "In Stock";

              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${statusColor}`}></div>
                  <p className="text-sm font-medium text-slate-800 flex-1">
                    {product.name}
                  </p>
                  <p className="text-xs text-slate-500 min-w-20">{statusText}</p>
                  <p className="text-sm font-semibold text-slate-700 min-w-10 text-right">
                    {product.quantity}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Efficiency */}
        <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-600 mb-4">
            Efficiency
          </h2>
          <div className="flex items-center justify-center">
            <div className="relative w-36 h-36" style={{ transform: 'scale(1.5)' }}>
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="#10b981"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${
                    (data.efficiency.inStockPercent / 100) * 376.8
                  } 376.8`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800">
                    {data.efficiency.inStockPercent}%
                  </p>
                  <p className="text-xs text-slate-500">In Stock</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-slate-600">Out of Stock</span>
              </div>
              <span className="font-semibold text-slate-800">
                {data.efficiency.outOfStockPercent}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <span className="text-slate-600">Low Stock</span>
              </div>
              <span className="font-semibold text-slate-800">
                {data.efficiency.lowStockPercent}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <span className="text-slate-600">In Stock</span>
              </div>
              <span className="font-semibold text-slate-800">
                {data.efficiency.inStockPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
