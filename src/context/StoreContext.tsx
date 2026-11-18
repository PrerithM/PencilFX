import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Product,
  CartItem,
  PrintJob,
  PickupSlot,
  Order,
  NotificationItem,
  AppSettings,
  PricingConfig,
  StudentSession,
} from '../types';
import {
  fetchProducts,
  fetchPickupSlots,
  fetchPricingRates,
  fetchSettings,
  fetchOrders,
  fetchNotifications,
  FALLBACK_SETTINGS,
  FALLBACK_PRICING,
} from '../services/dataService';
import {
  getOrCreateStudentSession,
  updateStudentSession,
  recordOrderInSession,
  clearStudentSession,
} from '../services/sessionService';

interface StoreContextType {
  products: Product[];
  pickupSlots: PickupSlot[];
  pricingConfig: PricingConfig;
  settings: AppSettings;
  orders: Order[];
  notifications: NotificationItem[];
  studentSession: StudentSession;
  updateSession: (updates: Partial<StudentSession>) => void;
  resetSession: () => void;
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCartStationery: (product: Product, quantity?: number) => void;
  addToCartPrintJob: (printJob: PrintJob) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;
  refreshData: () => Promise<void>;
  isLoading: boolean;
  lastSyncedAt: Date | null;
  addLocalOrder: (order: Order) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'pencilfx_cart';
const LOCAL_PENDING_ORDERS_KEY = 'pencilfx_pending_orders';

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pickupSlots, setPickupSlots] = useState<PickupSlot[]>([]);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(FALLBACK_PRICING);
  const [settings, setSettings] = useState<AppSettings>(FALLBACK_SETTINGS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [studentSession, setStudentSession] = useState<StudentSession>(() => getOrCreateStudentSession());
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const loadAllData = useCallback(async () => {
    try {
      const [prods, slots, pricing, sett, ords, notifs] = await Promise.all([
        fetchProducts(),
        fetchPickupSlots(),
        fetchPricingRates(),
        fetchSettings(),
        fetchOrders(),
        fetchNotifications(),
      ]);

      setProducts(prods);
      setPickupSlots(slots);
      setPricingConfig(pricing);
      setSettings(sett);
      setNotifications(notifs);

      // Merge remote orders with local uncommitted orders
      let localPending: Order[] = [];
      try {
        const raw = localStorage.getItem(LOCAL_PENDING_ORDERS_KEY);
        if (raw) localPending = JSON.parse(raw);
      } catch (e) {
        console.warn('Failed to parse local pending orders', e);
      }

      const mergedMap = new Map<string, Order>();
      // Remote orders take precedence
      ords.forEach(o => mergedMap.set(o.orderId, o));
      // Local pending added if not yet in remote
      localPending.forEach(o => {
        if (!mergedMap.has(o.orderId)) {
          mergedMap.set(o.orderId, o);
        }
      });

      setOrders(Array.from(mergedMap.values()));
      setLastSyncedAt(new Date());
    } catch (err) {
      console.error('Error synchronizing data from repository:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Periodic eventual synchronization (25-second polling)
  useEffect(() => {
    const intervalSeconds = settings.syncIntervalSeconds || 25;
    const timer = setInterval(() => {
      loadAllData();
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [loadAllData, settings.syncIntervalSeconds]);

  const updateSession = (updates: Partial<StudentSession>) => {
    const updated = updateStudentSession(updates);
    setStudentSession(updated);
  };

  const resetSession = () => {
    const fresh = clearStudentSession();
    setStudentSession(fresh);
  };

  const addToCartStationery = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.type === 'stationery' && item.product?.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      const newItem: CartItem = {
        id: `cart-stat-${product.id}-${Date.now()}`,
        type: 'stationery',
        product,
        quantity,
      };
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const addToCartPrintJob = (printJob: PrintJob) => {
    const newItem: CartItem = {
      id: `cart-print-${Date.now()}`,
      type: 'print',
      printJob,
      quantity: 1,
    };
    setCart(prev => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const addLocalOrder = (newOrder: Order) => {
    // Record into student session
    recordOrderInSession(newOrder.orderId);
    setStudentSession(getOrCreateStudentSession());

    // Update state
    setOrders(prev => [newOrder, ...prev.filter(o => o.orderId !== newOrder.orderId)]);

    // Store in localStorage pending list
    try {
      const raw = localStorage.getItem(LOCAL_PENDING_ORDERS_KEY);
      const existing: Order[] = raw ? JSON.parse(raw) : [];
      const updated = [newOrder, ...existing.filter(o => o.orderId !== newOrder.orderId)];
      localStorage.setItem(LOCAL_PENDING_ORDERS_KEY, JSON.stringify(updated.slice(0, 20)));
    } catch (e) {
      console.warn('Could not store pending order locally:', e);
    }
  };

  const cartTotal = cart.reduce((sum, item) => {
    if (item.type === 'stationery' && item.product) {
      return sum + item.product.price * item.quantity;
    }
    if (item.type === 'print' && item.printJob) {
      return sum + item.printJob.cost;
    }
    return sum;
  }, 0);

  const cartItemCount = cart.reduce((sum, item) => sum + (item.type === 'stationery' ? item.quantity : 1), 0);

  return (
    <StoreContext.Provider
      value={{
        products,
        pickupSlots,
        pricingConfig,
        settings,
        orders,
        notifications,
        studentSession,
        updateSession,
        resetSession,
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCartStationery,
        addToCartPrintJob,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartItemCount,
        refreshData: loadAllData,
        isLoading,
        lastSyncedAt,
        addLocalOrder,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
