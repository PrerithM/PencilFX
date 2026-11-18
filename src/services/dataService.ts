import { Product, PickupSlot, PricingConfig, Order, NotificationItem, AppSettings } from '../types';

// Fallback seed data in case network or static fetch fails
export const FALLBACK_PRODUCTS: Product[] = [
  { id: 'prod-1', name: 'Classmate Long Notebook (Ruled, 160 pgs)', category: 'Notebooks', price: 65, inStock: true, stockCount: 45, unit: '1 pc', description: 'Hard bound single line ruled long book, ideal for lecture notes.' },
  { id: 'prod-2', name: 'Classmate Unruled Notebook (160 pgs)', category: 'Notebooks', price: 65, inStock: true, stockCount: 30, unit: '1 pc', description: 'Blank unruled white page long notebook for diagrams and rough work.' },
  { id: 'prod-3', name: 'A4 Spiral Project Notebook (200 pgs)', category: 'Notebooks', price: 110, inStock: true, stockCount: 22, unit: '1 pc', description: 'Micro-perforated spiral notebook with thick 70 GSM paper.' },
  { id: 'prod-4', name: 'Reynolds 045 Fine Carabine Pen (Blue)', category: 'Pens & Writing', price: 10, inStock: true, stockCount: 120, unit: '1 pen', description: 'Classic blue ballpoint pen with laser tip precision.' },
  { id: 'prod-5', name: 'Pilot V5 Liquid Ink Rollerball (Black)', category: 'Pens & Writing', price: 60, inStock: true, stockCount: 35, unit: '1 pen', description: 'Precision 0.5mm needle point black ink rollerball pen.' },
  { id: 'prod-7', name: 'Practical Record Sheets (Pack of 50)', category: 'Lab & Records', price: 45, inStock: true, stockCount: 60, unit: 'Pack', description: 'One side ruled, one side blank standard college record sheets.' },
  { id: 'prod-8', name: 'Engineering Graph Sheets A4 (Pack of 25)', category: 'Lab & Records', price: 30, inStock: true, stockCount: 50, unit: 'Pack', description: 'Centimeter grid millimeter precision green graph sheets.' },
  { id: 'prod-10', name: 'Omega Engineering Mini Drafter', category: 'Drafting & Tools', price: 380, inStock: true, stockCount: 8, unit: '1 set', description: 'Includes unbreakable scale and heavy-duty steel clamp.' },
  { id: 'prod-11', name: 'Cartridge Paper Sheet A1 (White)', category: 'Drafting & Tools', price: 20, inStock: true, stockCount: 100, unit: '1 sheet', description: '180 GSM smooth cartridge paper for technical drawing.' },
  { id: 'prod-13', name: 'Camlin Geometry Box (Exam Kit)', category: 'Exam Supplies', price: 120, inStock: true, stockCount: 18, unit: '1 box', description: 'Self-centering compass, divider, 15cm ruler, and set squares.' },
  { id: 'prod-14', name: 'Kangaroo Heavy Duty Stapler + Pins', category: 'Office Supplies', price: 85, inStock: false, stockCount: 0, unit: '1 kit', description: 'Currently out of stock.' },
];

export const FALLBACK_SLOTS: PickupSlot[] = [
  { id: 'slot-1', startTime: '09:15', endTime: '09:30', label: '09:15 AM – 09:30 AM (Pre-Class)', capacity: 30, currentBookings: 12, isEnabled: true, description: 'Quick pickup before 1st hour classes begin.' },
  { id: 'slot-2', startTime: '11:15', endTime: '11:35', label: '11:15 AM – 11:35 AM (Morning Tea Break)', capacity: 50, currentBookings: 38, isEnabled: true, description: 'Standard 20-minute interval pickup slot.' },
  { id: 'slot-3', startTime: '13:15', endTime: '14:00', label: '01:15 PM – 02:00 PM (Lunch Break)', capacity: 60, currentBookings: 49, isEnabled: true, description: 'Lunch break collection window.' },
  { id: 'slot-4', startTime: '15:45', endTime: '16:05', label: '03:45 PM – 04:05 PM (Afternoon Lab Break)', capacity: 40, currentBookings: 39, isEnabled: true, description: 'High demand pre-lab printout pickup slot.' },
  { id: 'slot-5', startTime: '17:00', endTime: '17:30', label: '05:00 PM – 05:30 PM (Post-Class / Evening)', capacity: 35, currentBookings: 35, isEnabled: false, description: 'Capacity reached for today.' },
];

export const FALLBACK_PRICING: PricingConfig = {
  currency: 'INR',
  rates: {
    bw_single: { rate: 2.0, label: 'Black & White (Single-sided)' },
    bw_double: { rate: 1.5, label: 'Black & White (Double-sided)' },
    color_single: { rate: 8.0, label: 'Color (Single-sided)' },
    color_double: { rate: 6.0, label: 'Color (Double-sided)' },
  },
  paperSizes: {
    A4: { multiplier: 1.0, label: 'A4 Standard' },
    A3: { multiplier: 2.0, label: 'A3 Large / CAD' },
  },
  finishing: {
    none: { price: 0.0, label: 'No Binding' },
    staple: { price: 0.0, label: 'Corner Staple' },
    spiral: { price: 25.0, label: 'Spiral Binding' },
    strip: { price: 10.0, label: 'Clip File' },
  },
};

export const FALLBACK_SETTINGS: AppSettings = {
  shopName: 'Campus Stationery & Reprographics',
  brandName: 'Pencil FX',
  openingHours: '8:30 AM - 5:30 PM (Mon-Sat)',
  contactEmail: 'stationery@campus.edu',
  contactPhone: '+91 98765 43210',
  counterLocation: 'Ground Floor, Student Activity Center (SAC)',
  defaultPreparationTimeMinutes: 20,
  currency: '₹',
  syncIntervalSeconds: 25,
  adminDemoPin: '1234',
  sessionExpiryMinutes: 30,
};

export const FALLBACK_NOTIFICATIONS: NotificationItem[] = [
  {
    notificationId: 'notif-1',
    orderId: 'PFX-2026-90412',
    message: 'Order PFX-2026-90412 is READY_FOR_PICKUP at the front counter.',
    notificationType: 'ORDER_STATUS',
    createdAt: new Date().toISOString(),
  },
  {
    notificationId: 'notif-3',
    orderId: null,
    message: 'Notice: Practical record sheets restocked. Mini drafters available at front counter.',
    notificationType: 'ANNOUNCEMENT',
    createdAt: new Date().toISOString(),
  },
];

// In-memory cache for static files
const cache: Record<string, { data: unknown; timestamp: number }> = {};
const CACHE_TTL_MS = 10000; // 10 seconds client cache

async function fetchJsonFile<T>(filename: string, fallback: T): Promise<T> {
  const now = Date.now();
  if (cache[filename] && now - cache[filename].timestamp < CACHE_TTL_MS) {
    return cache[filename].data as T;
  }

  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const url = `${cleanBase}data/${filename}?_t=${now}`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    cache[filename] = { data, timestamp: now };
    return data as T;
  } catch (err) {
    console.warn(`[dataService] Error loading ${filename}, using fallback:`, err);
    return fallback;
  }
}

export async function fetchProducts(): Promise<Product[]> {
  return fetchJsonFile<Product[]>('products.json', FALLBACK_PRODUCTS);
}

export async function fetchPickupSlots(): Promise<PickupSlot[]> {
  return fetchJsonFile<PickupSlot[]>('pickup-slots.json', FALLBACK_SLOTS);
}

export async function fetchPricingRates(): Promise<PricingConfig> {
  return fetchJsonFile<PricingConfig>('pricing.json', FALLBACK_PRICING);
}

export async function fetchSettings(): Promise<AppSettings> {
  return fetchJsonFile<AppSettings>('settings.json', FALLBACK_SETTINGS);
}

export async function fetchOrders(): Promise<Order[]> {
  return fetchJsonFile<Order[]>('orders.json', []);
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  return fetchJsonFile<NotificationItem[]>('notifications.json', FALLBACK_NOTIFICATIONS);
}
