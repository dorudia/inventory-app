"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Inventory {
  _id: string;
  userId: string;
  name: string;
  description: string;
  isDefault: boolean;
  allowedEmails?: string[];
  createdAt: string;
  updatedAt: string;
}

interface InventoryContextType {
  inventories: Inventory[];
  activeInventory: Inventory | null;
  setActiveInventory: (inventory: Inventory) => void;
  refreshInventories: () => Promise<void>;
  loading: boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [activeInventory, setActiveInventoryState] = useState<Inventory | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const refreshInventories = async () => {
    try {
      const response = await fetch("/api/inventories");
      const data = await response.json();
      setInventories(data);

      // Set active inventory from localStorage or first one
      const savedInventoryId = localStorage.getItem("activeInventoryId");
      if (savedInventoryId) {
        const saved = data.find(
          (inv: Inventory) => inv._id === savedInventoryId
        );
        if (saved) {
          setActiveInventoryState(saved);
        } else if (data.length > 0) {
          setActiveInventoryState(data[0]);
        }
      } else if (data.length > 0) {
        setActiveInventoryState(data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch inventories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshInventories();
  }, []);

  const setActiveInventory = (inventory: Inventory) => {
    setActiveInventoryState(inventory);
    localStorage.setItem("activeInventoryId", inventory._id);
  };

  return (
    <InventoryContext.Provider
      value={{
        inventories,
        activeInventory,
        setActiveInventory,
        refreshInventories,
        loading,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
