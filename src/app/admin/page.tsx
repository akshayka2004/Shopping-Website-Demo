"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Package,
  ShoppingBag,
  Layers,
  Users,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Eye,
  ShieldAlert,
} from "lucide-react";
import { formatPrice } from "@/config/site";
import { useStore } from "@/context/StoreContext";
import {
  Category,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  ProductVariant,
} from "@/types/store";

type AdminTab = "overview" | "products" | "categories" | "orders" | "customers";

interface AdminSummaryData {
  metrics: {
    totalRevenue: number;
    paidRevenue: number;
    totalOrders: number;
    totalProducts: number;
    activeProducts: number;
    totalCategories: number;
    totalStockUnits: number;
    totalCustomers: number;
    lowStockCount: number;
  };
  statusCounts: Record<OrderStatus, number>;
  lowStockVariants: Array<{
    productId: string;
    productTitle: string;
    variantId: string;
    size: string;
    color: string;
    sku: string;
    stock: number;
  }>;
  recentOrders: Order[];
  customers: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt: string;
    orderCount: number;
    totalSpent: number;
  }>;
}

const PRESET_PRODUCT_IMAGES = [
  "/images/products/heavyweight-tee.jpg",
  "/images/products/linen-shirt.jpg",
  "/images/products/tailored-trousers.jpg",
  "/images/products/denim-jacket.jpg",
  "/images/products/merino-sweater.jpg",
  "/images/products/midi-dress.jpg",
  "/images/products/trench-coat.jpg",
  "/images/products/chino-shorts.jpg",
];

export default function AdminDashboardPage() {
  const { user, authLoading, showToast } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [summary, setSummary] = useState<AdminSummaryData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Order filters
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);

  // Product Form Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodTitle, setProdTitle] = useState("");
  const [prodPrice, setProdPrice] = useState("2499");
  const [prodComparePrice, setProdComparePrice] = useState("2999");
  const [prodCategoryId, setProdCategoryId] = useState("");
  const [prodImage, setProdImage] = useState(PRESET_PRODUCT_IMAGES[0]);
  const [prodDescription, setProdDescription] = useState("");
  const [prodFabric, setProdFabric] = useState(
    "100% Organic Cotton. Machine wash cold."
  );
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodActive, setProdActive] = useState(true);
  const [prodVariants, setProdVariants] = useState<
    Array<Partial<ProductVariant>>
  >([
    { size: "S", color: "Charcoal", colorHex: "#36393F", stock: 12 },
    { size: "M", color: "Charcoal", colorHex: "#36393F", stock: 18 },
    { size: "L", color: "Charcoal", colorHex: "#36393F", stock: 14 },
  ]);

  // Category Form
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatImage, setNewCatImage] = useState(
    "/images/banners/collection-menswear.jpg"
  );

  const loadAllAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, prodRes, catRes, ordRes] = await Promise.all([
        fetch("/api/admin/summary", { cache: "no-store" }),
        fetch("/api/products?includeInactive=true", { cache: "no-store" }),
        fetch("/api/categories?includeInactive=true", { cache: "no-store" }),
        fetch("/api/orders?scope=admin", { cache: "no-store" }),
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (prodRes.ok) {
        const pd = await prodRes.json();
        setProducts(pd.products || []);
      }
      if (catRes.ok) {
        const cd = await catRes.json();
        setCategories(cd.categories || []);
        if (cd.categories?.length > 0) {
          setProdCategoryId((prev) => prev || cd.categories[0].id);
        }
      }
      if (ordRes.ok) {
        const od = await ordRes.json();
        setOrders(od.orders || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      loadAllAdminData();
    }
  }, [user, loadAllAdminData]);

  const openCreateProductModal = () => {
    setEditingProduct(null);
    setProdTitle("");
    setProdPrice("2499");
    setProdComparePrice("2999");
    setProdCategoryId(categories[0]?.id || "cat_essentials");
    setProdImage(PRESET_PRODUCT_IMAGES[0]);
    setProdDescription("");
    setProdFabric("100% Organic Cotton. Machine wash cold.");
    setProdFeatured(true);
    setProdActive(true);
    setProdVariants([
      { size: "S", color: "Charcoal", colorHex: "#36393F", stock: 10 },
      { size: "M", color: "Charcoal", colorHex: "#36393F", stock: 15 },
      { size: "L", color: "Charcoal", colorHex: "#36393F", stock: 12 },
    ]);
    setShowProductModal(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProdTitle(product.title);
    setProdPrice(String(product.price));
    setProdComparePrice(
      product.compareAtPrice ? String(product.compareAtPrice) : ""
    );
    setProdCategoryId(product.categoryId);
    setProdImage(product.images[0] || PRESET_PRODUCT_IMAGES[0]);
    setProdDescription(product.description);
    setProdFabric(product.fabricAndCare);
    setProdFeatured(product.isFeatured);
    setProdActive(product.isActive);
    setProdVariants(product.variants.map((v) => ({ ...v })));
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle.trim() || Number(prodPrice) <= 0) {
      showToast("Please provide a valid product title and price.", "error");
      return;
    }

    const payload = {
      title: prodTitle.trim(),
      price: Number(prodPrice),
      compareAtPrice: prodComparePrice ? Number(prodComparePrice) : undefined,
      categoryId: prodCategoryId || categories[0]?.id || "cat_essentials",
      images: [prodImage],
      description: prodDescription.trim(),
      fabricAndCare: prodFabric.trim(),
      isFeatured: prodFeatured,
      isActive: prodActive,
      variants: prodVariants,
    };

    const url = editingProduct
      ? `/api/products/${editingProduct.id}`
      : "/api/products";
    const method = editingProduct ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      showToast(
        editingProduct
          ? "Product updated successfully."
          : "New product created and published."
      );
      setShowProductModal(false);
      await loadAllAdminData();
    } else {
      showToast(data.error || "Could not save product.", "error");
    }
  };

  const handleToggleProductStatus = async (product: Product) => {
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !product.isActive }),
    });
    if (res.ok) {
      showToast(
        `Product "${product.title}" is now ${
          !product.isActive ? "Active" : "Deactivated"
        }.`
      );
      await loadAllAdminData();
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newCatName.trim(),
        description: newCatDesc.trim(),
        image: newCatImage,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`Category "${newCatName}" created.`);
      setNewCatName("");
      setNewCatDesc("");
      await loadAllAdminData();
    } else {
      showToast(data.error || "Could not create category.", "error");
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    fulfilmentStatus?: OrderStatus,
    paymentStatus?: PaymentStatus
  ) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fulfilmentStatus, paymentStatus }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message || "Order status updated.");
      if (inspectedOrder?.id === orderId) {
        setInspectedOrder(data.order);
      }
      await loadAllAdminData();
    } else {
      showToast(data.error || "Failed to update order.", "error");
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-stone-500">
        Verifying administrator credentials...
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div
        data-testid="admin-access-denied"
        className="max-w-lg mx-auto px-4 py-16 sm:py-20 text-center space-y-4 sm:space-y-5"
      >
        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center mx-auto">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-serif text-stone-900">
          Administrator Access Required
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          This store management portal is restricted to authorised
          administrators. Please sign in with an administrator account to
          manage products, stock, and orders.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/login"
            data-testid="admin-login-redirect-btn"
            className="px-6 py-3 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 min-h-[44px]"
          >
            Sign In as Administrator
          </Link>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((ord) => {
    if (
      orderStatusFilter !== "ALL" &&
      ord.fulfilmentStatus !== orderStatusFilter
    ) {
      return false;
    }
    if (orderSearch.trim()) {
      const q = orderSearch.trim().toLowerCase();
      return (
        ord.orderNumber.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.customerEmail.toLowerCase().includes(q) ||
        (ord.paymentReference || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-stone-200 pb-4 sm:pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-amber-800">
            Store Administration Portal
          </span>
          <h1
            data-testid="admin-dashboard-heading"
            className="text-2xl sm:text-3xl font-serif text-stone-900 mt-0.5 sm:mt-1"
          >
            Operations & Inventory Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            data-testid="admin-new-product-btn"
            onClick={openCreateProductModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
            Add New Product
          </button>
        </div>
      </div>

      {/* Navigation Tabs - Horizontally scrollable on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-stone-200">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          {
            id: "products",
            label: `Products (${products.length})`,
            icon: ShoppingBag,
          },
          {
            id: "categories",
            label: `Categories (${categories.length})`,
            icon: Layers,
          },
          {
            id: "orders",
            label: `Orders (${orders.length})`,
            icon: Package,
          },
          {
            id: "customers",
            label: `Customers (${summary?.customers.length || 0})`,
            icon: Users,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-testid={`admin-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors min-h-[40px] ${
                active
                  ? "bg-stone-900 text-white"
                  : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && summary && (
        <div className="space-y-6 sm:space-y-8">
          {/* 2x2 on mobile, 4-col on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 space-y-1">
              <p className="text-[10px] sm:text-xs font-medium text-stone-500 uppercase tracking-wider">
                Total Revenue
              </p>
              <p
                data-testid="metric-total-revenue"
                className="text-lg sm:text-2xl font-bold text-stone-900"
              >
                {formatPrice(summary.metrics.totalRevenue)}
              </p>
              <p className="text-[10px] sm:text-xs text-emerald-700">
                {formatPrice(summary.metrics.paidRevenue)} paid
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 space-y-1">
              <p className="text-[10px] sm:text-xs font-medium text-stone-500 uppercase tracking-wider">
                Total Orders
              </p>
              <p
                data-testid="metric-total-orders"
                className="text-lg sm:text-2xl font-bold text-stone-900"
              >
                {summary.metrics.totalOrders}
              </p>
              <p className="text-[10px] sm:text-xs text-stone-500">
                {summary.statusCounts.CONFIRMED +
                  summary.statusCounts.PROCESSING}{" "}
                in dispatch
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 space-y-1">
              <p className="text-[10px] sm:text-xs font-medium text-stone-500 uppercase tracking-wider">
                Products
              </p>
              <p
                data-testid="metric-active-products"
                className="text-lg sm:text-2xl font-bold text-stone-900"
              >
                {summary.metrics.activeProducts} /{" "}
                {summary.metrics.totalProducts}
              </p>
              <p className="text-[10px] sm:text-xs text-stone-500">
                {summary.metrics.totalCategories} collections
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 space-y-1">
              <p className="text-[10px] sm:text-xs font-medium text-stone-500 uppercase tracking-wider">
                Total Inventory
              </p>
              <p
                data-testid="metric-total-stock"
                className="text-lg sm:text-2xl font-bold text-stone-900"
              >
                {summary.metrics.totalStockUnits} units
              </p>
              <p className="text-[10px] sm:text-xs text-amber-700">
                {summary.metrics.lowStockCount} low variants
              </p>
            </div>
          </div>

          {/* Order Status Breakdown & Low Stock Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 space-y-4">
              <h2 className="text-base font-serif text-stone-900 border-b border-stone-100 pb-3">
                Order Fulfilment Summary
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {(
                  [
                    "CONFIRMED",
                    "PROCESSING",
                    "SHIPPED",
                    "DELIVERED",
                    "CANCELLED",
                  ] as OrderStatus[]
                ).map((st) => (
                  <div
                    key={st}
                    className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-stone-50"
                  >
                    <span className="font-semibold text-stone-700">{st}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-900 text-white font-bold">
                      {summary.statusCounts[st] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h2 className="text-base font-serif text-stone-900 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Low-Stock Alerts (≤ 7 units)
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab("products")}
                  className="text-xs font-semibold text-brand-700 hover:underline"
                >
                  Manage Stock →
                </button>
              </div>
              {summary.lowStockVariants.length === 0 ? (
                <p className="text-xs text-stone-500">
                  All product variants are well stocked.
                </p>
              ) : (
                <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto">
                  {summary.lowStockVariants.map((v) => (
                    <div
                      key={v.variantId}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-medium text-stone-900">
                          {v.productTitle}
                        </p>
                        <p className="text-stone-500">
                          {v.size} / {v.color} • SKU: {v.sku}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-semibold">
                        {v.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS & INVENTORY */}
      {activeTab === "products" && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
            <h2 className="text-base font-serif text-stone-900">
              Product Catalogue & Variant Inventory
            </h2>
            <button
              type="button"
              onClick={openCreateProductModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold min-h-[36px]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Product
            </button>
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 text-stone-500 uppercase border-b border-stone-200">
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Variants & Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {products.map((prod) => {
                  const totalStock = prod.variants.reduce(
                    (s, v) => s + v.stock,
                    0
                  );
                  return (
                    <tr
                      key={prod.id}
                      data-testid={`admin-product-row-${prod.slug}`}
                      className="hover:bg-stone-50/70"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images[0]}
                            alt={prod.title}
                            className="w-11 h-14 rounded object-cover border border-stone-200"
                          />
                          <div>
                            <p className="font-semibold text-stone-900 text-sm">
                              {prod.title}
                            </p>
                            <p className="text-stone-400 font-mono text-[11px]">
                              /{prod.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-stone-700">
                        {prod.categoryName}
                      </td>
                      <td className="p-4 font-semibold text-stone-900">
                        {formatPrice(prod.price)}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {prod.variants.map((v) => (
                            <span
                              key={v.id}
                              className={`px-2 py-0.5 rounded border text-[11px] ${
                                v.stock <= 5
                                  ? "bg-amber-50 border-amber-300 text-amber-900"
                                  : "bg-stone-50 border-stone-200 text-stone-700"
                              }`}
                            >
                              {v.size}/{v.color}: <strong>{v.stock}</strong>
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1">
                          Total: {totalStock} units
                        </p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            prod.isActive
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-stone-200 text-stone-600"
                          }`}
                        >
                          {prod.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          type="button"
                          data-testid={`admin-edit-product-${prod.slug}`}
                          onClick={() => openEditProductModal(prod)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-stone-300 bg-white text-stone-800 hover:border-stone-900 font-medium"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          data-testid={`admin-toggle-product-${prod.slug}`}
                          onClick={() => handleToggleProductStatus(prod)}
                          className="px-2.5 py-1.5 rounded border border-stone-200 text-stone-600 hover:text-stone-950"
                        >
                          {prod.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout (< md) */}
          <div className="md:hidden divide-y divide-stone-200">
            {products.map((prod) => {
              const totalStock = prod.variants.reduce(
                (s, v) => s + v.stock,
                0
              );
              return (
                <div
                  key={prod.id}
                  data-testid={`admin-product-card-${prod.slug}`}
                  className="p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={prod.images[0]}
                      alt={prod.title}
                      className="w-14 h-18 rounded-lg object-cover border border-stone-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] uppercase font-semibold text-stone-500">
                          {prod.categoryName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            prod.isActive
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-stone-200 text-stone-600"
                          }`}
                        >
                          {prod.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="font-semibold text-stone-900 text-sm truncate">
                        {prod.title}
                      </p>
                      <p className="font-semibold text-stone-900 text-sm mt-0.5">
                        {formatPrice(prod.price)}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Total Stock: <strong>{totalStock}</strong> units
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {prod.variants.map((v) => (
                      <span
                        key={v.id}
                        className={`px-1.5 py-0.5 rounded border ${
                          v.stock <= 5
                            ? "bg-amber-50 border-amber-300 text-amber-900"
                            : "bg-stone-50 border-stone-200 text-stone-700"
                        }`}
                      >
                        {v.size}/{v.color}: {v.stock}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openEditProductModal(prod)}
                      className="flex-1 py-2 px-3 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs font-semibold text-center min-h-[40px] flex items-center justify-center gap-1"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit Details
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleProductStatus(prod)}
                      className="py-2 px-3 rounded-lg border border-stone-200 text-stone-600 text-xs font-medium min-h-[40px]"
                    >
                      {prod.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 space-y-4 h-fit">
            <h2 className="text-base font-serif text-stone-900 border-b border-stone-100 pb-3">
              Create New Category / Collection
            </h2>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  data-testid="admin-new-cat-name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Resort Wear"
                  required
                  className="w-full px-3 py-2.5 text-base sm:text-sm border border-stone-300 rounded-lg min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  data-testid="admin-new-cat-desc"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  rows={3}
                  placeholder="Relaxed warm-weather silhouettes..."
                  className="w-full px-3 py-2 text-base sm:text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Cover Image
                </label>
                <select
                  value={newCatImage}
                  onChange={(e) => setNewCatImage(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-lg bg-white min-h-[44px]"
                >
                  <option value="/images/banners/collection-menswear.jpg">
                    Menswear Editorial Banner
                  </option>
                  <option value="/images/banners/collection-womenswear.jpg">
                    Womenswear Editorial Banner
                  </option>
                  <option value="/images/banners/collection-outerwear.jpg">
                    Outerwear Rack Banner
                  </option>
                  <option value="/images/products/linen-shirt.jpg">
                    Linen Shirt Studio Shot
                  </option>
                </select>
              </div>
              <button
                type="submit"
                data-testid="admin-save-cat-btn"
                className="w-full py-3 px-4 rounded-lg bg-stone-900 text-white text-xs sm:text-sm font-semibold hover:bg-stone-800 min-h-[44px]"
              >
                Create Category
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                data-testid={`admin-category-card-${cat.slug}`}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col shadow-sm"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-32 sm:h-36 w-full object-cover"
                />
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-medium text-base text-stone-900">
                        {cat.name}
                      </h3>
                      <span className="text-[11px] font-mono text-stone-400">
                        /{cat.slug}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      {cat.description}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-emerald-800 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Active in Storefront
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS & FULFILMENT */}
      {activeTab === "orders" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-sm">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                data-testid="admin-order-search"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search orders (ORD-2026-..., customer, email)..."
                className="w-full pl-10 pr-4 py-2.5 text-base sm:text-xs border border-stone-300 rounded-lg min-h-[44px]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(
                [
                  "ALL",
                  "CONFIRMED",
                  "PROCESSING",
                  "SHIPPED",
                  "DELIVERED",
                  "CANCELLED",
                ] as const
              ).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setOrderStatusFilter(st)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold min-h-[36px] ${
                    orderStatusFilter === st
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 uppercase border-b border-stone-200">
                    <th className="p-4">Order Ref</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Items</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Fulfilment Status</th>
                    <th className="p-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {filteredOrders.map((ord) => (
                    <tr
                      key={ord.id}
                      data-testid={`admin-order-row-${ord.orderNumber}`}
                      className="hover:bg-stone-50"
                    >
                      <td className="p-4 font-mono font-semibold text-stone-900">
                        {ord.orderNumber}
                        <div className="text-[10px] font-sans text-stone-400">
                          {new Date(ord.createdAt).toLocaleDateString("en-IN")}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-stone-900">
                          {ord.customerName}
                        </p>
                        <p className="text-stone-500">{ord.customerEmail}</p>
                      </td>
                      <td className="p-4 text-stone-700">
                        {ord.items.reduce((s, i) => s + i.quantity, 0)} units
                      </td>
                      <td className="p-4 font-semibold text-stone-900">
                        {formatPrice(ord.totalAmount)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            ord.paymentStatus === "PAID"
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                        <div className="text-[10px] font-mono text-stone-400 mt-0.5">
                          {ord.paymentReference}
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          aria-label={`Fulfilment status for ${ord.orderNumber}`}
                          data-testid={`admin-order-status-select-${ord.orderNumber}`}
                          value={ord.fulfilmentStatus}
                          onChange={(e) =>
                            handleUpdateOrderStatus(
                              ord.id,
                              e.target.value as OrderStatus
                            )
                          }
                          className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-900 min-h-[36px]"
                        >
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => setInspectedOrder(ord)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-stone-300 bg-white text-stone-700 hover:border-stone-900 min-h-[36px]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Order Cards (< md) */}
            <div className="md:hidden divide-y divide-stone-200">
              {filteredOrders.map((ord) => (
                <div
                  key={ord.id}
                  data-testid={`admin-order-card-${ord.orderNumber}`}
                  className="p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono font-semibold text-sm text-stone-900">
                        {ord.orderNumber}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        {new Date(ord.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        ord.paymentStatus === "PAID"
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {ord.paymentStatus}
                    </span>
                  </div>

                  <div className="text-xs text-stone-600">
                    <p className="font-medium text-stone-900">{ord.customerName}</p>
                    <p>{ord.customerEmail}</p>
                    <p className="font-semibold text-stone-900 text-sm mt-1">
                      {formatPrice(ord.totalAmount)} •{" "}
                      {ord.items.reduce((s, i) => s + i.quantity, 0)} garments
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1">
                      <select
                        aria-label={`Fulfilment status for ${ord.orderNumber}`}
                        data-testid={`admin-order-status-mobile-select-${ord.orderNumber}`}
                        value={ord.fulfilmentStatus}
                        onChange={(e) =>
                          handleUpdateOrderStatus(
                            ord.id,
                            e.target.value as OrderStatus
                          )
                        }
                        className="w-full px-2.5 py-2 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-900 min-h-[40px]"
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInspectedOrder(ord)}
                      className="px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-700 text-xs font-medium min-h-[40px]"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {inspectedOrder && (
            <div className="bg-white rounded-2xl border-2 border-stone-900 p-5 sm:p-6 space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div>
                  <h3 className="text-base font-serif text-stone-900">
                    Order Inspection — {inspectedOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Customer: {inspectedOrder.customerName} (
                    {inspectedOrder.customerPhone})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectedOrder(null)}
                  className="text-xs font-semibold text-stone-500 hover:text-stone-900 p-2 min-h-[44px] min-w-[44px]"
                >
                  Close ✕
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                <div className="p-3.5 rounded-xl bg-stone-50 space-y-1">
                  <p className="font-semibold text-stone-900">
                    Delivery Destination
                  </p>
                  <p>{inspectedOrder.shippingAddress.addressLine1}</p>
                  <p>
                    {inspectedOrder.shippingAddress.city},{" "}
                    {inspectedOrder.shippingAddress.state}{" "}
                    {inspectedOrder.shippingAddress.postalCode}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-50 space-y-1">
                  <p className="font-semibold text-stone-900">Line Items</p>
                  {inspectedOrder.items.map((item) => (
                    <p key={item.id}>
                      • {item.productName} ({item.size}/{item.color}) ×{" "}
                      {item.quantity} — {formatPrice(item.lineTotal)}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CUSTOMERS */}
      {activeTab === "customers" && summary && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-stone-200">
            <h2 className="text-base font-serif text-stone-900">
              Registered Customer Directory
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 text-stone-500 uppercase border-b border-stone-200">
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Orders</th>
                  <th className="p-4">Total Spend</th>
                  <th className="p-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {summary.customers.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50">
                    <td className="p-4 font-semibold text-stone-900">
                      {c.name}
                    </td>
                    <td className="p-4 text-stone-600">{c.email}</td>
                    <td className="p-4 text-stone-600">{c.phone || "—"}</td>
                    <td className="p-4 font-medium">{c.orderCount}</td>
                    <td className="p-4 font-semibold text-stone-900">
                      {formatPrice(c.totalSpent)}
                    </td>
                    <td className="p-4 text-stone-400">
                      {new Date(c.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div
          data-testid="admin-product-modal"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-8 space-y-4 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 className="text-lg sm:text-xl font-serif text-stone-900">
                {editingProduct
                  ? `Edit: ${editingProduct.title}`
                  : "Create New Product"}
              </h2>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="p-2 text-stone-500 hover:text-stone-900 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-stone-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    data-testid="modal-product-title"
                    value={prodTitle}
                    onChange={(e) => setProdTitle(e.target.value)}
                    placeholder="e.g. Tailored Linen Overshirt"
                    required
                    className="w-full px-3 py-2.5 text-base sm:text-sm border border-stone-300 rounded-lg min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Selling Price (INR) *
                  </label>
                  <input
                    type="number"
                    data-testid="modal-product-price"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 text-base sm:text-sm border border-stone-300 rounded-lg min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    data-testid="modal-product-category"
                    value={prodCategoryId}
                    onChange={(e) => setProdCategoryId(e.target.value)}
                    className="w-full px-3 py-2.5 text-base sm:text-sm border border-stone-300 rounded-lg bg-white min-h-[44px]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-stone-700 mb-1">
                    Product Image
                  </label>
                  <select
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-lg bg-white min-h-[44px]"
                  >
                    {PRESET_PRODUCT_IMAGES.map((img) => (
                      <option key={img} value={img}>
                        {img}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-stone-700 mb-1">
                    Description
                  </label>
                  <textarea
                    data-testid="modal-product-description"
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-base sm:text-sm border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Variants Editor */}
              <div className="space-y-2 border-t border-stone-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-900">
                    Variants & Stock
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setProdVariants([
                        ...prodVariants,
                        {
                          size: "XL",
                          color: "Ivory",
                          colorHex: "#EFECE4",
                          stock: 10,
                        },
                      ])
                    }
                    className="text-brand-700 font-semibold hover:underline p-1"
                  >
                    + Add Variant Row
                  </button>
                </div>

                {prodVariants.map((v, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-4 gap-2 items-center bg-stone-50 p-2 rounded-lg"
                  >
                    <input
                      type="text"
                      value={v.size || ""}
                      onChange={(e) => {
                        const copy = [...prodVariants];
                        copy[idx] = { ...copy[idx], size: e.target.value };
                        setProdVariants(copy);
                      }}
                      placeholder="Size"
                      className="px-2 py-1.5 border border-stone-300 rounded bg-white text-xs"
                    />
                    <input
                      type="text"
                      value={v.color || ""}
                      onChange={(e) => {
                        const copy = [...prodVariants];
                        copy[idx] = { ...copy[idx], color: e.target.value };
                        setProdVariants(copy);
                      }}
                      placeholder="Colour"
                      className="px-2 py-1.5 border border-stone-300 rounded bg-white text-xs"
                    />
                    <input
                      type="number"
                      data-testid={`modal-variant-stock-${idx}`}
                      value={v.stock ?? 0}
                      onChange={(e) => {
                        const copy = [...prodVariants];
                        copy[idx] = {
                          ...copy[idx],
                          stock: Number(e.target.value),
                        };
                        setProdVariants(copy);
                      }}
                      placeholder="Stock"
                      className="px-2 py-1.5 border border-stone-300 rounded bg-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setProdVariants(
                          prodVariants.filter((_, i) => i !== idx)
                        )
                      }
                      disabled={prodVariants.length <= 1}
                      className="text-red-600 hover:underline disabled:opacity-30 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodFeatured}
                    onChange={(e) => setProdFeatured(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span>Feature on Home Page</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodActive}
                    onChange={(e) => setProdActive(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span>Active in Catalogue</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-stone-300 text-stone-700 font-medium min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="modal-save-product-btn"
                  className="px-6 py-2.5 rounded-lg bg-stone-900 text-white font-semibold hover:bg-stone-800 min-h-[44px]"
                >
                  {editingProduct ? "Save Changes" : "Publish Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
