/**
 * Shared product data and utilities.
 * Extracted from Products.jsx so that Products.jsx can be a pure
 * component-only file — required for Vite Fast Refresh to work
 * correctly and avoid "Invalid hook call" during HMR.
 */
import pyriteImage from "../../../assets/images/products/pyritr.webp";
import chakraImage from "../../../assets/images/products/7bracelate.webp";
import nazarImage from "../../../assets/images/products/Nazarbatu.webp";
import jadeImage from "../../../assets/images/products/green.webp";
import rudrakshaImage from "../../../assets/images/products/rudraksh.webp";
import roseQuartzImage from "../../../assets/images/products/Rose Quartz Bracelet.webp";

export const fallbackProducts = [
  {
    theme: "gold",
    title: "Pyrite Bracelet",
    desc: "Attract wealth, confidence, and positive energy with this premium Pyrite crystal bracelet.",
    price: "₹999",
    oldPrice: "₹1499",
    image: pyriteImage,
  },
  {
    theme: "purple",
    title: "7 Chakra Bracelet",
    desc: "Balance your chakras and improve spiritual harmony with natural healing stones.",
    price: "₹799",
    oldPrice: "₹1199",
    image: chakraImage,
  },
  {
    theme: "cyan",
    title: "Nazar Suraksha Bracelet",
    desc: "Designed to protect against negative energy and the evil eye with spiritual power.",
    price: "₹699",
    oldPrice: "₹999",
    image: nazarImage,
  },
  {
    theme: "green",
    title: "Green Jade Ring",
    desc: "An elegant jade ring crafted for prosperity, peace, and emotional balance.",
    price: "₹1299",
    oldPrice: "₹1799",
    image: jadeImage,
  },
  {
    theme: "orange",
    title: "Rudraksha Mala",
    desc: "Authentic spiritual Rudraksha mala for meditation, peace, and divine connection.",
    price: "₹1499",
    oldPrice: "₹2199",
    image: rudrakshaImage,
  },
  {
    theme: "pink",
    title: "Rose Quartz Bracelet",
    desc: "Enhance love, self-confidence, and emotional healing with Rose Quartz crystals.",
    price: "₹899",
    oldPrice: "₹1399",
    image: roseQuartzImage,
  },
];

export const numericPrice = (value) =>
  parseFloat(String(value ?? "").replace(/[^\d.]/g, ""));

export const formatPrice = (value) => {
  const amount = numericPrice(value);
  if (!Number.isFinite(amount)) return value || "";
  return `₹${amount.toLocaleString("en-IN")}`;
};

export const getDiscount = (price, oldPrice) => {
  const current = numericPrice(price);
  const original = numericPrice(oldPrice);
  if (!current || !original || original <= current) return null;
  return Math.round(((original - current) / original) * 100);
};
