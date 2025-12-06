"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    lowStockAt: "",
  });

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          setFormData({
            name: data.product.name,
            price: data.product.price.toString(),
            quantity: data.product.quantity.toString(),
            lowStockAt: data.product.lowStockAt.toString(),
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        alert("Failed to load product");
        router.push("/inventory");
      });
  }, [productId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity),
          lowStockAt: parseInt(formData.lowStockAt),
        }),
      });

      if (response.ok) {
        router.push("/inventory");
      } else {
        alert("Failed to update product");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating product");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <main className="p-8 md:ml-64 bg-slate-100 min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-slate-500">Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 md:ml-64 bg-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Edit Product</h1>
        <p className="text-slate-500">Update product information</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <div className="bg-white p-8 rounded-lg shadow border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Laptop Dell XPS 15"
              />
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0.00"
              />
            </div>

            {/* Quantity */}
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>

            {/* Low Stock Alert */}
            <div>
              <label
                htmlFor="lowStockAt"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Low Stock Alert Threshold{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="lowStockAt"
                name="lowStockAt"
                value={formData.lowStockAt}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="10"
              />
              <p className="mt-1 text-xs text-slate-500">
                You'll be notified when stock falls below this number
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/inventory")}
                className="px-6 py-3 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default EditProductPage;
