import { createContext, useContext, useEffect, useState } from "react";

const StoreContext = createContext(null);

function readStorage(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : fallback;
    return Array.isArray(fallback) && !Array.isArray(parsed) ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage may be unavailable. */ }
}

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => readStorage("nova-cart", []));
  const [wishlist, setWishlist] = useState(() => readStorage("nova-wishlist", []));
  const [recentlyViewed, setRecentlyViewed] = useState(() => readStorage("nova-recent", []));
  const [orders, setOrders] = useState(() => readStorage("nova-orders", []));
  const [addresses, setAddresses] = useState(() => readStorage("nova-addresses", []));
  const [customerReviews, setCustomerReviews] = useState(() => readStorage("nova-reviews", []));
  const [stockNotifications, setStockNotifications] = useState(() => readStorage("nova-stock-notifications", []));
  const [contactRequests, setContactRequests] = useState(() => readStorage("nova-contact-requests", []));

  useEffect(() => writeStorage("nova-cart", cart), [cart]);
  useEffect(() => writeStorage("nova-wishlist", wishlist), [wishlist]);
  useEffect(() => writeStorage("nova-recent", recentlyViewed), [recentlyViewed]);
  useEffect(() => writeStorage("nova-orders", orders), [orders]);
  useEffect(() => writeStorage("nova-addresses", addresses), [addresses]);
  useEffect(() => writeStorage("nova-reviews", customerReviews), [customerReviews]);
  useEffect(() => writeStorage("nova-stock-notifications", stockNotifications), [stockNotifications]);
  useEffect(() => writeStorage("nova-contact-requests", contactRequests), [contactRequests]);

  const addToCart = (product, size = product.sizes[0], quantity = 1, color = product.colors[0].name) => {
    setCart((current) => {
      const found = current.find((item) => item.id === product.id && item.size === size && item.color === color);
      if (found) {
        return current.map((item) =>
          item.id === product.id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...current, { id: product.id, size, color, quantity }];
    });
  };

  const updateQuantity = (id, size, quantity, color) => {
    setCart((current) => quantity <= 0
      ? current.filter((item) => item.id !== id || item.size !== size || (color && item.color !== color))
      : current.map((item) => item.id === id && item.size === size && (!color || item.color === color) ? { ...item, quantity } : item));
  };

  const toggleWishlist = (productId) => {
    setWishlist((current) => current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId]);
  };

  const recordView = (productId) => {
    setRecentlyViewed((current) => [productId, ...current.filter((id) => id !== productId)].slice(0, 8));
  };

  const saveOrder = (order) => setOrders((current) => [order, ...current]);
  const addAddress = (address) => setAddresses((current) => [{ ...address, id: `address-${Date.now()}` }, ...current]);
  const removeAddress = (addressId) => setAddresses((current) => current.filter((address) => address.id !== addressId));
  const saveReview = (review) => setCustomerReviews((current) => [{ ...review, id: `review-${Date.now()}`, createdAt: new Date().toISOString(), verified: false }, ...current]);
  const saveStockNotification = (notification) => setStockNotifications((current) => {
    const exists = current.some((item) => item.productId === notification.productId && item.email.toLowerCase() === notification.email.toLowerCase());
    return exists ? current : [{ ...notification, id: `stock-${Date.now()}`, createdAt: new Date().toISOString() }, ...current];
  });
  const saveContactRequest = (request) => setContactRequests((current) => [{ ...request, id: `contact-${Date.now()}`, createdAt: new Date().toISOString() }, ...current]);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <StoreContext.Provider value={{
      cart, wishlist, recentlyViewed, orders, addresses, customerReviews, stockNotifications, contactRequests,
      cartCount, addToCart, updateQuantity, toggleWishlist, recordView, saveOrder,
      addAddress, removeAddress, saveReview, saveStockNotification, saveContactRequest,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used within StoreProvider");
  return store;
}