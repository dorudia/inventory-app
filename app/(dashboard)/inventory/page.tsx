"use client";

import React, { useEffect, useState } from "react";
import { Search, Filter, Package, Edit2, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useInventory } from "@/contexts/InventoryContext";
import { useSettings } from "@/contexts/SettingsContext";

interface Product {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  lowStockAt: number;
  createdAt: string;
}

const InventoryPage = () => {
  const router = useRouter();
  const { activeInventory } = useInventory();
  const { settings } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const fetchProducts = () => {
    if (!activeInventory) return;

    setLoading(true);
    const params = new URLSearchParams();
    params.append("inventoryId", activeInventory._id);
    if (search) params.append("search", search);
    if (filter !== "all") params.append("filter", filter);

    fetch(`/api/inventory?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [search, filter, activeInventory]);

  const handleDelete = async (id: string) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/products/${productToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchProducts();
        setShowDeleteModal(false);
        setProductToDelete(null);
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting product");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      alert("Please select products to delete");
      return;
    }

    setShowBulkDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const response = await fetch("/api/products/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedProducts }),
      });

      if (response.ok) {
        setSelectedProducts([]);
        fetchProducts();
        setShowBulkDeleteModal(false);
      } else {
        alert("Failed to delete products");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting products");
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProducts(products.map((p) => p._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (product: Product) => {
    if (product.quantity === 0) {
      return (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
          Out of Stock
        </span>
      );
    } else if (product.quantity <= product.lowStockAt) {
      return (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
          Low Stock
        </span>
      );
    } else {
      return (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
          In Stock
        </span>
      );
    }
  };

  return (
    <main className="p-8 md:ml-64 bg-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Inventory</h1>
        <p className="text-slate-500">
          Manage and track your product inventory
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow border border-slate-200 mb-6 relative z-0">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            <input
              id="product-search"
              name="search"
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            <select
              id="product-filter"
              name="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white cursor-pointer"
            >
              <option value="all">All Products</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          {/* Bulk Delete */}
          {selectedProducts.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedProducts.length})
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-lg text-slate-500">Loading...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-slate-400">
            <Package className="w-16 h-16 mb-4" />
            <p className="text-lg">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Low Stock At
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((product, idx) => (
                  <tr
                    key={product._id}
                    className={`hover:bg-slate-100 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                    }`}
                  >
                    <td className="px-6 py-2">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => handleSelectProduct(product._id)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <p className="text-sm font-medium text-slate-800">
                        {product.name}
                      </p>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <p className="text-sm text-slate-600">
                        {settings.currency === "lei"
                          ? `${product.price.toFixed(2)} ${settings.currency}`
                          : `${settings.currency}${product.price.toFixed(2)}`}
                      </p>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <p className="text-sm font-semibold text-slate-800">
                        {product.quantity}
                      </p>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <p className="text-sm text-slate-600">
                        {product.lowStockAt}
                      </p>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      {getStatusBadge(product)}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <p className="text-sm text-slate-600">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/edit-product/${product._id}`)
                          }
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Count */}
      {!loading && products.length > 0 && (
        <div className="mt-4 text-sm text-slate-500">
          Showing {products.length} product{products.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Product Details Modal */}
      {showDetailsModal && selectedProduct && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 z-40"
            onClick={() => setShowDetailsModal(false)}
          />
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 pointer-events-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800">
                  Product Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Product Name
                  </label>
                  <p className="text-lg font-semibold text-slate-800">
                    {selectedProduct.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Price
                    </label>
                    <p className="text-lg font-semibold text-green-600">
                      {settings.currency === "lei"
                        ? `${selectedProduct.price.toFixed(2)} ${
                            settings.currency
                          }`
                        : `${settings.currency}${selectedProduct.price.toFixed(
                            2
                          )}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Quantity
                    </label>
                    <p className="text-lg font-semibold text-slate-800">
                      {selectedProduct.quantity}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Low Stock Alert
                    </label>
                    <p className="text-lg font-semibold text-slate-800">
                      {selectedProduct.lowStockAt}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Status
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(selectedProduct)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Total Value
                  </label>
                  <p className="text-lg font-semibold text-purple-600">
                    $
                    {(selectedProduct.price * selectedProduct.quantity).toFixed(
                      2
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Added On
                  </label>
                  <p className="text-slate-800">
                    {new Date(selectedProduct.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    router.push(`/edit-product/${selectedProduct._id}`);
                  }}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  Edit Product
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 z-40"
            onClick={() => {
              setShowDeleteModal(false);
              setProductToDelete(null);
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
                    Delete Product
                  </h2>
                  <p className="text-sm text-slate-500">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-slate-600 mb-6">
                Are you sure you want to delete this product? All product data
                will be permanently removed.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProductToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 z-40"
            onClick={() => setShowBulkDeleteModal(false)}
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
                    Delete Multiple Products
                  </h2>
                  <p className="text-sm text-slate-500">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-slate-600 mb-6">
                Are you sure you want to delete{" "}
                <strong>{selectedProducts.length}</strong>{" "}
                {selectedProducts.length === 1 ? "product" : "products"}? All
                data will be permanently removed.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBulkDelete}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default InventoryPage;
