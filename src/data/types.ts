export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  imagePublicId?: string;
  active: boolean;
  sortOrder: number;
};

export type ProductColor = { name: string; hex: string };

export type Product = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  categorySlug: string;
  images: string[];
  imagePublicIds?: string[];
  regularPrice: number;
  salePrice: number | null;
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  sku: string;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  active: boolean;
  sortOrder: number;
  createdAt: string;
};

export type Review = {
  id: string;
  productSlug: string;
  author: string;
  rating: number;
  body: string;
  date: string;
  approved: boolean;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  imagePublicId?: string;
  mobileImage?: string;
  mobileImagePublicId?: string;
  active: boolean;
  sortOrder: number;
};

export type StoreSettings = {
  storeName: string;
  logoUrl: string;
  logoPublicId: string;
  announcement: string;
  supportPhone: string;
  whatsapp: string;
  supportEmail: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  deliveryInsideDhaka: number;
  deliveryOutsideDhaka: number;
  deliveryTimeInside: string;
  deliveryTimeOutside: string;
  exchangeWindowDays: number;
  codEnabled: boolean;
};

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  size: string;
  color: string;
  quantity: number;
  maxQuantity: number;
};

export type OrderCustomer = {
  fullName: string;
  mobile: string;
  district: string;
  area: string;
  address: string;
  note?: string;
};

export type PlacedOrder = {
  orderNumber: string;
  placedAt: string;
  customer: OrderCustomer;
  lines: CartLine[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: "cod";
};

export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderItem = {
  id: string;
  productId: string | null;
  productSlug: string;
  name: string;
  image: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  fullName: string;
  mobile: string;
  district: string;
  area: string;
  address: string;
  note: string;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
};
