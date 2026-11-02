export const siteConfig = {
  name: process.env.NEXT_PUBLIC_STORE_NAME || "ATELIER VÉRA",
  tagline:
    process.env.NEXT_PUBLIC_STORE_TAGLINE ||
    "Contemporary Everyday Clothing & Wardrobe Essentials",
  description:
    "Discover thoughtfully crafted contemporary clothing. Designed with breathable natural fabrics, tailored silhouettes, and enduring quality for everyday living.",
  currency: process.env.NEXT_PUBLIC_CURRENCY || "INR",
  currencySymbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹",
  freeShippingThreshold: 2999,
  standardShippingFee: 149,
  contact: {
    email: "care@ateliervera.store",
    phone: "+91 22 4890 1200",
    hours: "Monday – Saturday, 10:00 AM – 7:00 PM IST",
    address: "Studio 14, Kala Ghoda Design District, Fort, Mumbai 400001, India",
  },
  razorpayKeyId:
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_AtelierVeraDemoKey",
};

export function formatPrice(amount: number): string {
  return `${siteConfig.currencySymbol}${amount.toLocaleString("en-IN")}`;
}

