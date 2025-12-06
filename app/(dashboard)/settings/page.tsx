"use client";

import React, { useState, useEffect } from "react";
import { UserProfile } from "@clerk/nextjs";
import {
  Download,
  DollarSign,
  Settings as SettingsIcon,
  BarChart3,
  TrendingUp,
  Warehouse,
  Plus,
  Edit2,
  Trash2,
  Mail,
  UserPlus,
  X,
} from "lucide-react";
import { useInventory } from "@/contexts/InventoryContext";
import { useSettings } from "@/contexts/SettingsContext";

const SettingsPage = () => {
  const { activeInventory, inventories, refreshInventories } = useInventory();
  const { refreshSettings } = useSettings();
  const [currency, setCurrency] = useState("$");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [chartType, setChartType] = useState<"bar" | "area">("bar");
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewInventoryForm, setShowNewInventoryForm] = useState(false);
  const [newInventoryName, setNewInventoryName] = useState("");
  const [newInventoryDescription, setNewInventoryDescription] = useState("");
  const [selectedInventoryForSharing, setSelectedInventoryForSharing] =
    useState<string | null>(null);
  const [newEmailToShare, setNewEmailToShare] = useState("");
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(
    null
  );
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showDeleteInventoryModal, setShowDeleteInventoryModal] =
    useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Load settings from database
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setCurrency(data.currency || "$");
        setDateFormat(data.dateFormat || "MM/DD/YYYY");
        setChartType(data.chartType || "bar");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        setLoading(false);
      });
  }, []);

  const handleExportCSV = async () => {
    if (!activeInventory) {
      alert("Please select an inventory first");
      return;
    }

    setExporting(true);
    try {
      const response = await fetch(
        `/api/export?inventoryId=${activeInventory._id}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventory-${activeInventory.name}-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleCreateInventory = async () => {
    if (!newInventoryName.trim()) {
      alert("Please enter an inventory name");
      return;
    }

    try {
      const response = await fetch("/api/inventories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newInventoryName,
          description: newInventoryDescription,
        }),
      });

      if (response.ok) {
        setNewInventoryName("");
        setNewInventoryDescription("");
        setShowNewInventoryForm(false);
        await refreshInventories();
      } else {
        alert("Failed to create inventory");
      }
    } catch (error) {
      console.error("Create failed:", error);
      alert("Failed to create inventory");
    }
  };

  const handleDeleteInventory = async (id: string, name: string) => {
    setInventoryToDelete({ id, name });
    setShowDeleteInventoryModal(true);
  };

  const confirmDeleteInventory = async () => {
    if (!inventoryToDelete) return;

    try {
      const response = await fetch(`/api/inventories/${inventoryToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await refreshInventories();
        setShowDeleteInventoryModal(false);
        setInventoryToDelete(null);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete inventory");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete inventory");
    }
  };

  const handleAddEmail = async (inventoryId: string) => {
    if (!newEmailToShare.trim()) {
      alert("Please enter an email address");
      return;
    }

    const inventory = inventories.find((inv) => inv._id === inventoryId);
    if (!inventory) return;

    const allowedEmails = inventory.allowedEmails || [];
    if (allowedEmails.includes(newEmailToShare)) {
      alert("This email already has access");
      return;
    }

    try {
      const response = await fetch(`/api/inventories/${inventoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allowedEmails: [...allowedEmails, newEmailToShare],
        }),
      });

      if (response.ok) {
        setNewEmailToShare("");
        await refreshInventories();
      } else {
        alert("Failed to add email");
      }
    } catch (error) {
      console.error("Add email failed:", error);
      alert("Failed to add email");
    }
  };

  const handleRemoveEmail = async (
    inventoryId: string,
    emailToRemove: string
  ) => {
    const inventory = inventories.find((inv) => inv._id === inventoryId);
    if (!inventory) return;

    const allowedEmails = (inventory.allowedEmails || []).filter(
      (e) => e !== emailToRemove
    );

    try {
      const response = await fetch(`/api/inventories/${inventoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allowedEmails,
        }),
      });

      if (response.ok) {
        await refreshInventories();
      } else {
        alert("Failed to remove email");
      }
    } catch (error) {
      console.error("Remove email failed:", error);
      alert("Failed to remove email");
    }
  };

  const handleUpdateInventory = async (inventoryId: string) => {
    if (!editName.trim()) {
      alert("Please enter an inventory name");
      return;
    }

    try {
      const response = await fetch(`/api/inventories/${inventoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
        }),
      });

      if (response.ok) {
        setEditingInventoryId(null);
        setEditName("");
        setEditDescription("");
        await refreshInventories();
      } else {
        alert("Failed to update inventory");
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update inventory");
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency, dateFormat, chartType }),
      });

      if (response.ok) {
        await refreshSettings(); // Refresh settings context
        setToastMessage("Preferences saved successfully!");
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      } else {
        setToastMessage("Failed to save preferences");
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
      }
    } catch (error) {
      console.error("Save failed:", error);
      setToastMessage("Failed to save preferences");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="px-4 py-8 md:px-8 md:ml-64 bg-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
        <p className="text-slate-500">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">Profile</h2>
              <p className="text-sm text-slate-500">
                Manage your account information
              </p>
            </div>
            <div className="p-6">
              <UserProfile
                routing="hash"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none",
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Preferences & Data */}
        <div className="space-y-6">
          {/* Display Preferences */}
          <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <SettingsIcon className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-slate-800">
                Display Preferences
              </h2>
            </div>
            {loading ? (
              <div className="text-center py-4 text-slate-500">Loading...</div>
            ) : (
              <div className="space-y-4">
                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Currency Symbol
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="$">$ (USD)</option>
                    <option value="€">€ (EUR)</option>
                    <option value="£">£ (GBP)</option>
                    <option value="¥">¥ (JPY)</option>
                    <option value="lei">lei (RON)</option>
                  </select>
                </div>

                {/* Date Format */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date Format
                  </label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                {/* Chart Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Default Chart Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setChartType("bar")}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
                        chartType === "bar"
                          ? "border-purple-600 bg-purple-50 text-purple-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span className="font-medium">Bar</span>
                    </button>
                    <button
                      onClick={() => setChartType("area")}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
                        chartType === "area"
                          ? "border-purple-600 bg-purple-50 text-purple-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-medium">Area</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSavePreferences}
                  disabled={saving}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            )}
          </div>

          {/* Data Management */}
          <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Download className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-slate-800">
                Data Export
              </h2>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Download your complete inventory data as a CSV file
            </p>
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {exporting ? "Exporting..." : "Export to CSV"}
            </button>
          </div>

          {/* Inventory Management */}
          <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-slate-800">
                  Inventories
                </h2>
              </div>
              <button
                onClick={() => setShowNewInventoryForm(!showNewInventoryForm)}
                className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors cursor-pointer"
                title="Add Inventory"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showNewInventoryForm && (
              <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <input
                  type="text"
                  placeholder="Inventory name"
                  value={newInventoryName}
                  onChange={(e) => setNewInventoryName(e.target.value)}
                  className="w-full px-3 py-2 mb-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newInventoryDescription}
                  onChange={(e) => setNewInventoryDescription(e.target.value)}
                  className="w-full px-3 py-2 mb-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateInventory}
                    className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowNewInventoryForm(false);
                      setNewInventoryName("");
                      setNewInventoryDescription("");
                    }}
                    className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {inventories.map((inv) => (
                <div key={inv._id} className="p-3 bg-slate-50 rounded-lg">
                  {editingInventoryId === inv._id ? (
                    <div className="mb-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Inventory name"
                        className="w-full px-3 py-2 mb-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full px-3 py-2 mb-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateInventory(inv._id)}
                          className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingInventoryId(null);
                            setEditName("");
                            setEditDescription("");
                          }}
                          className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">
                          {inv.name}
                          {inv.isDefault && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </p>
                        {inv.description && (
                          <p className="text-xs text-slate-500">
                            {inv.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingInventoryId(inv._id);
                            setEditName(inv.name);
                            setEditDescription(inv.description || "");
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Inventory"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setSelectedInventoryForSharing(
                              selectedInventoryForSharing === inv._id
                                ? null
                                : inv._id
                            )
                          }
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          title="Share Inventory"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                        {inventories.length > 1 && (
                          <button
                            onClick={() =>
                              handleDeleteInventory(inv._id, inv.name)
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Inventory"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Email sharing section */}
                  {selectedInventoryForSharing === inv._id && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs font-medium text-slate-700 mb-2">
                        Share with:
                      </p>

                      {/* List of shared emails - show first */}
                      {inv.allowedEmails && inv.allowedEmails.length > 0 && (
                        <div className="space-y-1 mb-3">
                          {inv.allowedEmails.map((email) => (
                            <div
                              key={email}
                              className="flex items-center justify-between px-2 py-1.5 bg-white rounded border border-slate-200"
                            >
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-700">
                                  {email}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  handleRemoveEmail(inv._id, email)
                                }
                                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                title="Remove access"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add email input */}
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="email@example.com"
                          value={newEmailToShare}
                          onChange={(e) => setNewEmailToShare(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          onClick={() => handleAddEmail(inv._id)}
                          className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Inventory Confirmation Modal */}
      {showDeleteInventoryModal && inventoryToDelete && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 z-40"
            onClick={() => {
              setShowDeleteInventoryModal(false);
              setInventoryToDelete(null);
            }}
          />
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 pointer-events-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Delete Inventory
                  </h2>
                  <p className="text-sm text-slate-500">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-slate-600 mb-6">
                Are you sure you want to delete inventory{" "}
                <strong>"{inventoryToDelete.name}"</strong>? All products in
                this inventory will also be permanently deleted.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteInventoryModal(false);
                    setInventoryToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteInventory}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-fade-in">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <span className="text-green-600 font-bold">✓</span>
          </div>
          <p className="font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Error Toast */}
      {showErrorToast && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-fade-in">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <span className="text-red-600 font-bold">✕</span>
          </div>
          <p className="font-medium">{toastMessage}</p>
        </div>
      )}
    </main>
  );
};

export default SettingsPage;
