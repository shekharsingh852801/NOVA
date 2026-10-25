// Mirrors server-side computeDiscount — the server remains authoritative at order time.
export function computeCouponDiscount(coupon, subtotal, shipping) {
  if (!coupon) return 0;
  if (coupon.type === "percent") {
    return Math.round(((subtotal * coupon.value) / 100) * 100) / 100;
  }
  if (coupon.type === "fixed") {
    return Math.min(coupon.value, subtotal);
  }
  return shipping;
}

export function estimateShipping(subtotal) {
  return subtotal >= 75 || subtotal === 0 ? 0 : 8;
}

export function cartTotals(subtotal, coupon) {
  const shipping = estimateShipping(subtotal);
  const discount = computeCouponDiscount(coupon, subtotal, shipping);
  const total = Math.max(0, Math.round((subtotal + shipping - discount) * 100) / 100);
  return { shipping, discount, total };
}
