"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { siteConfig } from "@/config/site";
import { CartItem, SafeUser } from "@/types/store";

interface ToastMessage {
  id: number;
  text: string;
  type: "success" | "error" | "info";
}

interface StoreContextValue {
  user: SafeUser | null;
  authLoading: boolean;
  setUser: (user: SafeUser | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateCartQuantity: (variantId: string, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  shippingFee: number;
  cartTotal: number;
  showToast: (text: string, type?: "success" | "error" | "info") => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const CART_STORAGE_KEY = "atelier_vera_cart_v1";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartInitialized, setCartInitialized] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (text: string, type: "success" | "error" | "info" = "success") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, text, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch {
      // ignore storage errors
    } finally {
      setCartInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!cartInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage errors
    }
  }, [cart, cartInitialized]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    showToast("Signed out successfully.", "info");
  }, [showToast]);

  const addToCart = useCallback(
    (newItem: CartItem) => {
      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (i) => i.variantId === newItem.variantId
        );
        if (existingIndex > -1) {
          const updated = [...prev];
          const existing = updated[existingIndex];
          const nextQty = Math.min(
            existing.maxStock,
            existing.quantity + newItem.quantity
          );
          updated[existingIndex] = { ...existing, quantity: nextQty };
          return updated;
        }
        return [
          ...prev,
          {
            ...newItem,
            quantity: Math.min(newItem.maxStock, newItem.quantity),
          },
        ];
      });
      showToast(
        `Added ${newItem.title} (${newItem.size} / ${newItem.color}) to cart.`
      );
    },
    [showToast]
  );

  const updateCartQuantity = useCallback(
    (variantId: string, quantity: number) => {
      setCart((prev) =>
        prev
          .map((item) => {
            if (item.variantId !== variantId) return item;
            const clamped = Math.max(1, Math.min(item.maxStock, quantity));
            return { ...item, quantity: clamped };
          })
          .filter((item) => item.quantity > 0)
      );
    },
    []
  );

  const removeFromCart = useCallback(
    (variantId: string) => {
      setCart((prev) => prev.filter((i) => i.variantId !== variantId));
      showToast("Item removed from cart.", "info");
    },
    [showToast]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart]
  );

  const shippingFee = useMemo(() => {
    if (cart.length === 0) return 0;
    return cartSubtotal >= siteConfig.freeShippingThreshold
      ? 0
      : siteConfig.standardShippingFee;
  }, [cart.length, cartSubtotal]);

  const cartTotal = cartSubtotal + shippingFee;

  return (
    <StoreContext.Provider
      value={{
        user,
        authLoading,
        setUser,
        refreshUser,
        logout,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        shippingFee,
        cartTotal,
        showToast,
      }}
    >
      {children}
      {/* Accessible Toast Notification Stack */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            data-testid="toast-notification"
            className={`pointer-events-auto rounded-lg px-4 py-3 text-sm font-medium shadow-lg border transition-all ${
              t.type === "error"
                ? "bg-red-950 text-white border-red-800"
                : t.type === "info"
                ? "bg-stone-900 text-white border-stone-700"
                : "bg-brand-900 text-white border-brand-800"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return ctx;
}

