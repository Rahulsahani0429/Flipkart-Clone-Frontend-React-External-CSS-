/**
 * ─── STATUS CONFIG ─── Single Source of Truth ───────────────────────────────
 *
 * All order status enums, colors, and human-readable labels live here.
 * Import from this file — never hardcode status strings, colors, or labels
 * anywhere in the app.
 */

// ── 1. Canonical Enum Values ─────────────────────────────────────────────────
export const ORDER_STATUS = {
    ORDER_PLACED: "ORDER_PLACED",
    ORDER_CONFIRMED: "ORDER_CONFIRMED",
    PROCESSING: "PROCESSING",
    SHIPPED: "SHIPPED",
    OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED",
    RETURN_REQUESTED: "RETURN_REQUESTED",
    RETURNED: "RETURNED",
    REFUNDED: "REFUNDED",
};

// ── 2. Unique Color Per Status ───────────────────────────────────────────────
// Each color is visually distinct — no two statuses share the same hex.
export const STATUS_COLORS = {
    ORDER_PLACED: "#3B82F6",  // blue-500
    ORDER_CONFIRMED: "#6366F1",  // indigo-500
    PROCESSING: "#F59E0B",  // amber-500
    SHIPPED: "#06B6D4",  // cyan-500
    OUT_FOR_DELIVERY: "#0EA5E9",  // sky-500
    DELIVERED: "#10B981",  // emerald-500
    CANCELLED: "#EF4444",  // red-500
    RETURN_REQUESTED: "#F97316",  // orange-500
    RETURNED: "#8B5CF6",  // violet-500
    REFUNDED: "#EC4899",  // pink-500
};

// ── 3. Human-Readable Labels ─────────────────────────────────────────────────
export const STATUS_LABELS = {
    ORDER_PLACED: "Order Placed",
    ORDER_CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    RETURN_REQUESTED: "Return Requested",
    RETURNED: "Returned",
    REFUNDED: "Refunded",
};

// ── 4. Progress Stepper Steps (ordered) ──────────────────────────────────────
export const STATUS_STEPS = [
    ORDER_STATUS.ORDER_PLACED,
    ORDER_STATUS.ORDER_CONFIRMED,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.DELIVERED,
];

// ── 5. Badge CSS class hints ──────────────────────────────────────────────────
export const STATUS_BADGE_CLASS = {
    ORDER_PLACED: "badge-blue",
    ORDER_CONFIRMED: "badge-indigo",
    PROCESSING: "badge-yellow",
    SHIPPED: "badge-cyan",
    OUT_FOR_DELIVERY: "badge-sky",
    DELIVERED: "badge-green",
    CANCELLED: "badge-red",
    RETURN_REQUESTED: "badge-orange",
    RETURNED: "badge-violet",
    REFUNDED: "badge-pink",
};

// ── 6. Normalize any raw status string → canonical ENUM key ──────────────────
// Handles legacy values like "Delivered", "delivered", "Shipped", etc.
const ALIAS_MAP = {
    // Legacy / mixed-case aliases
    "order placed": ORDER_STATUS.ORDER_PLACED,
    "placed": ORDER_STATUS.ORDER_PLACED,
    "order_placed": ORDER_STATUS.ORDER_PLACED,
    "confirmed": ORDER_STATUS.ORDER_CONFIRMED,
    "order confirmed": ORDER_STATUS.ORDER_CONFIRMED,
    "order_confirmed": ORDER_STATUS.ORDER_CONFIRMED,
    "processing": ORDER_STATUS.PROCESSING,
    "shipped": ORDER_STATUS.SHIPPED,
    "out for delivery": ORDER_STATUS.OUT_FOR_DELIVERY,
    "out_for_delivery": ORDER_STATUS.OUT_FOR_DELIVERY,
    "outfordelivery": ORDER_STATUS.OUT_FOR_DELIVERY,
    "delivered": ORDER_STATUS.DELIVERED,
    "cancelled": ORDER_STATUS.CANCELLED,
    "canceled": ORDER_STATUS.CANCELLED,
    "return requested": ORDER_STATUS.RETURN_REQUESTED,
    "return_requested": ORDER_STATUS.RETURN_REQUESTED,
    "returned": ORDER_STATUS.RETURNED,
    "refunded": ORDER_STATUS.REFUNDED,
};

/**
 * normalizeStatus(raw) → canonical enum string
 * e.g. "Delivered" → "DELIVERED", "shipped" → "SHIPPED"
 */
export function normalizeStatus(raw) {
    if (!raw) return ORDER_STATUS.ORDER_PLACED;
    const upper = raw.toUpperCase().trim();
    // If it's already a valid enum value, return it directly
    if (ORDER_STATUS[upper]) return upper;
    // Try alias lookup (lowercase)
    const lower = raw.toLowerCase().trim();
    return ALIAS_MAP[lower] || upper; // fallback to uppercased version
}

/**
 * getStatusColor(status) → hex color string
 */
export function getStatusColor(status) {
    const key = normalizeStatus(status);
    return STATUS_COLORS[key] || "#94A3B8"; // gray fallback
}

/**
 * getStatusLabel(status) → human-readable string
 */
export function getStatusLabel(status) {
    const key = normalizeStatus(status);
    return STATUS_LABELS[key] || key; // fallback to the key itself
}
