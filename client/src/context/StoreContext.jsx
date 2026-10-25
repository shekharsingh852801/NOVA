import { createContext, useContext, useEffect, useState } from "react";
import { readStoredJson, writeStoredJson } from "../utils/storage.js";
import { cartTotals, estimateShipping } from "../utils/coupons.js";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => readStoredJson("nova-cart", []));
  const [coupon, setCoupon] = useState(() => readStoredJson("nova-coupon", null));
  const [wishlist, setWishlist] = useState(() => readStoredJson("nova-wishlist", []));
  const [recentlyViewed, setRecentlyViewed] = useState(() => readStoredJson("nova-recent", []));
  const [orders, setOrders] = useState(() => readStoredJson("nova-orders", []));
  const [addresses, setAddresses] = useState(() => readStoredJson("nova-addresses", []));
  const [customerReviews, setCustomerReviews] = useState(() => readStoredJson("nova-reviews", []));
  const [stockNotifications, setStockNotifications] = useState(() => readStoredJson("nova-stock-notifications", []));
  const [contactRequests, setContactRequests] = useState(() => readStoredJson("nova-contact-requests", []));
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => { writeStoredJson("nova-cart", cart); }, [cart]);
  useEffect(() => { writeStoredJson("nova-coupon", coupon); }, [coupon]);
  useEffect(() => { writeStoredJson("nova-wishlist", wishlist); }, [wishlist]);
  useEffect(() => { writeStoredJson("nova-recent", recentlyViewed); }, [recentlyViewed]);
  useEffect(() => { writeStoredJson("nova-orders", orders); }, [orders]);
  useEffect(() => { writeStoredJson("nova-addresses", addresses); }, [addresses]);
  useEffect(() => { writeStoredJson("nova-reviews", customerReviews); }, [customerReviews]);
  useEffect(() => { writeStoredJson("nova-stock-notifications", stockNotifications); }, [stockNotifications]);
  useEffect(() => { writeStoredJson("nova-contact-requests", contactRequests); }, [contactRequests]);

  useEffect(() => {
    // Dynamically fetch products instead of hardcoding
    import("../api/api.js").then(({ fetchProducts }) => {
      fetchProducts()
        .then((data) => {
          if (Array.isArray(data)) setProducts(data);
          setProductsLoading(false);
        })
        .catch(() => {
          // Fallback to local if backend is dead
          import("../data/products.js").then((mod) => {
            setProducts(mod.shopProducts);
            setProductsLoading(false);
          });
        });
    });
  }, []);

  // Re-validate an applied coupon whenever the cart changes (min-order may break);
  // silently drop it if it no longer applies.
  useEffect(() => {
    if (!coupon || !products.length) return;
    const subtotal = cart.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.id);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    if (!cart.length) {
      setCoupon(null);
      return;
    }
    import("../api/api.js").then(({ validateCoupon }) => {
      validateCoupon(coupon.code, subtotal, cartTotals(subtotal, null).shipping)
        .then((result) => setCoupon((current) => current && current.code === result.code ? result : current))
        .catch(() => setCoupon(null));
    }).catch(() => {});
  }, [cart, products, coupon?.code]);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3000);
  };

  const addToCart = (product, size = product.sizes[0], quantity = 1, color = product.colors[0].name) => {
    showToast("Added to Bag", "success");
    import("../utils/analytics.js").then(({ trackAddToCart }) => trackAddToCart(product, quantity)).catch(() => {});
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

  const replaceCart = (newCart) => setCart(newCart);
  const replaceOrders = (newOrders) => setOrders(newOrders);

  const applyCoupon = async (code, subtotal) => {
    const { validateCoupon } = await import("../api/api.js");
    const result = await validateCoupon(code.trim(), subtotal, estimateShipping(subtotal));
    setCoupon(result);
    showToast(result.type === "free_shipping"
      ? `Code ${result.code} applied — free shipping`
      : `Code ${result.code} applied`, "success");
    return result;
  };
  const clearCoupon = () => setCoupon(null);

  const toggleWishlist = (productId) => {
    setWishlist((current) => {
      const isRemoving = current.includes(productId);
      showToast(isRemoving ? "Removed from Wishlist" : "Saved to Wishlist", "success");
      return isRemoving ? current.filter((id) => id !== productId) : [...current, productId];
    });
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
      products, productsLoading, toast, coupon,
      cartCount, addToCart, updateQuantity, replaceCart, replaceOrders, toggleWishlist, recordView, saveOrder,
      addAddress, removeAddress, saveReview, saveStockNotification, saveContactRequest, showToast,
      applyCoupon, clearCoupon,
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