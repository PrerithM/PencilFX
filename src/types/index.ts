export type ColorMode = 'bw' | 'color';
export type SideMode = 'single' | 'double';
export type PaperSize = 'A4' | 'A3';
export type FinishingType = 'none' | 'staple' | 'spiral' | 'strip';

export type OrderType = 'STATIONERY' | 'PRINT_ONLY' | 'MIXED';

export type OrderStatus =
  | 'NEW'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'PRINTING'
  | 'READY_FOR_PICKUP'
  | 'COLLECTED'
  | 'REJECTED'
  | 'CANCELLED';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  stockCount: number;
  unit: string;
  description: string;
  image?: string;
}

export interface PrintJob {
  id?: string;
  driveUrls: string[];
  pageRange: string;
  copies: number;
  colorMode: ColorMode;
  sides: SideMode;
  paperSize: PaperSize;
  finishing: FinishingType;
  estimatedPages: number;
  cost: number;
  notes?: string;
}

export interface OrderItem {
  type: 'stationery';
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderPricing {
  stationerySubtotal: number;
  printSubtotal: number;
  totalAmount: number;
  currency: string;
}

export interface Order {
  orderId: string;
  trackingToken: string;
  studentId: string;
  studentName: string;
  usn?: string;
  phone?: string;
  orderType: OrderType;
  items: OrderItem[];
  printJobs: PrintJob[];
  driveLinks: string[];
  customNotes?: string;
  pricing: OrderPricing;
  pickupSlot: string;
  orderStatus: OrderStatus;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  githubIssueNumber?: number;
}

export interface PickupSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
  capacity: number;
  currentBookings: number;
  isEnabled: boolean;
  description?: string;
}

export interface PricingConfig {
  currency: string;
  rates: {
    bw_single: { rate: number; label: string };
    bw_double: { rate: number; label: string };
    color_single: { rate: number; label: string };
    color_double: { rate: number; label: string };
  };
  paperSizes: {
    A4: { multiplier: number; label: string };
    A3: { multiplier: number; label: string };
  };
  finishing: {
    none: { price: number; label: string };
    staple: { price: number; label: string };
    spiral: { price: number; label: string };
    strip: { price: number; label: string };
  };
}

export interface AppSettings {
  shopName: string;
  brandName: string;
  openingHours: string;
  contactEmail: string;
  contactPhone: string;
  counterLocation: string;
  defaultPreparationTimeMinutes: number;
  currency: string;
  syncIntervalSeconds: number;
  adminDemoPin: string;
  sessionExpiryMinutes: number;
}

export interface NotificationItem {
  notificationId: string;
  orderId?: string | null;
  message: string;
  notificationType: 'ORDER_STATUS' | 'ANNOUNCEMENT' | 'SYSTEM';
  createdAt: string;
  read?: boolean;
}

export interface StudentSession {
  studentId: string;
  displayName: string;
  usn?: string;
  phone?: string;
  createdAt: string;
  lastActiveAt: string;
  sessionOrderIds: string[]; // List of orderIds created in this browser session
}

export interface CartItem {
  id: string;
  type: 'stationery' | 'print';
  product?: Product;
  printJob?: PrintJob;
  quantity: number;
}
