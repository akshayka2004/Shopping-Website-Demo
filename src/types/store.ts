export type UserRole = "CUSTOMER" | "ADMIN";

export type OrderStatus =
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface Address {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  addresses: Address[];
  createdAt: string;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  addresses: Address[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  colorHex: string;
  sku: string;
  stock: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  fabricAndCare: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  productSlug: string;
  title: string;
  image: string;
  price: number;
  variantId: string;
  size: string;
  color: string;
  colorHex: string;
  sku: string;
  quantity: number;
  maxStock: number;
}

export interface ShippingAddressSnapshot {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  image: string;
  variantId: string;
  size: string;
  color: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddressSnapshot;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: "RAZORPAY" | "COD";
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  razorpayOrderId?: string;
  fulfilmentStatus: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  orderNumber?: string;
  message: string;
  createdAt: string;
}

export interface StoreDatabase {
  users: User[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  inquiries: ContactInquiry[];
}

