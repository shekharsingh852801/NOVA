import { useEffect, useRef, useState } from "react";
import AnnouncementBar from "./components/AnnouncementBar.jsx";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import PagePreloader from "./components/PagePreloader.jsx";
import FeatureBar from "./components/FeatureBar.jsx";
import NewArrivals from "./components/NewArrivals.jsx";
import CategoryGrid from "./components/CategoryGrid.jsx";
import BrandStory from "./components/BrandStory.jsx";
import Sustainability from "./components/Sustainability.jsx";
import Testimonials from "./components/Testimonials.jsx";
import Lookbook from "./components/Lookbook.jsx";
import Newsletter from "./components/Newsletter.jsx";
import Footer from "./components/Footer.jsx";

import { StoreProvider, useStore } from "./context/StoreContext.jsx";
import { readStoredJson, writeStoredJson } from "./utils/storage.js";
import { createOrder, isApiConfigured, syncCart, fetchCustomerOrders } from "./api/api.js";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import AuthPage from "./components/AuthPage.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import AdminApp from "./components/AdminApp.jsx";
import {
  AccountPage,
  CheckoutPage,
  ContactPage,
  FilmModal,
  OrderDetailPage,
  OrdersPage,
} from "./components/CommerceExtras.jsx";
import {
  CartDrawer,
  CartPage,
  CollectionDetail,
  CollectionsPage,
  EditorialPage,
  JournalPage,
  OrderSuccess,
  PolicyPage,
  ProductPage,
  QuickView,
  SearchOverlay,
  ShopPage,
  ShopTheLook,
  SizeFinder,
  TrackingPage,
  WishlistPage,
  collections,
} from "./components/Commerce.jsx";

function currentRoute() {
  return window.location.hash.startsWith("#/") ? window.location.hash.slice(2) : "";
}

function Storefront() {
  const { products, productsLoading, cart, cartCount, wishlist, addToCart, updateQuantity, saveOrder, orders, replaceOrders, replaceCart, toast } = useStore();
  const [customer, setCustomer] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nova_customer")) || null;
    } catch {
      return null;
    }
  });
  
  const handleLogout = () => {
    localStorage.removeItem("nova_customer_token");
    localStorage.removeItem("nova_customer");
    setCustomer(null);
    replaceOrders([]);
    replaceCart([]);
  };

  const [route, setRoute] = useState(currentRoute);
  const [showPagePreloader] = useState(() => currentRoute() === "");
  const routeRef = useRef(route);
  const routeScrollPositions = useRef(new Map());
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickView, setQuickView] = useState(null);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [sizeTarget, setSizeTarget] = useState(null);
  const [recommendedSizes, setRecommendedSizes] = useState({});
  const [lookOpen, setLookOpen] = useState(false);
  const [filmOpen, setFilmOpen] = useState(false);
  const [latestOrder, setLatestOrder] = useState(null);

  useEffect(() => {
    if (customer) {
      const token = localStorage.getItem("nova_customer_token");
      if (token) {
        syncCart(token, cart).catch(console.error);
      }
    }
  }, [cart, customer]);

  useEffect(() => {
    if (customer) {
      const token = localStorage.getItem("nova_customer_token");
      if (token) {
        fetchCustomerOrders(token)
          .then(orders => {
            if (Array.isArray(orders)) replaceOrders(orders);
          })
          .catch(console.error);
      }
    }
  }, [customer]);

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => { window.history.scrollRestoration = previousRestoration; };
  }, []);

  useEffect(() => {
    const syncRoute = () => {
      const hash = window.location.hash;
      if (hash && !hash.startsWith("#/")) return;
      const nextRoute = currentRoute();
      routeScrollPositions.current.set(routeRef.current.split("?")[0], window.scrollY);
      routeRef.current = nextRoute;
      setRoute(nextRoute);
      setCartOpen(false);
      setSearchOpen(false);
      setQuickView(null);
      setSizeOpen(false);
      setLookOpen(false);
      setFilmOpen(false);
    };
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  useEffect(() => {
    const pathname = route.split("?")[0];
    if (pathname.startsWith("product/")) {
      window.scrollTo({ left: 0, top: 0, behavior: "instant" });
      return;
    }
    if (pathname === "shop" || pathname === "sale" || pathname === "search" || pathname.startsWith("collections/")) {
      const scrollTop = routeScrollPositions.current.get(pathname) || 0;
      const frame = window.requestAnimationFrame(() => window.scrollTo({ left: 0, top: scrollTop, behavior: "instant" }));
      return () => window.cancelAnimationFrame(frame);
    }
  }, [route]);

  useEffect(() => {
    document.body.classList.toggle("store-overlay-open", cartOpen || searchOpen || Boolean(quickView) || sizeOpen || lookOpen || filmOpen);
    return () => document.body.classList.remove("store-overlay-open");
  }, [cartOpen, searchOpen, quickView, sizeOpen, lookOpen, filmOpen]);

  const navigate = (path = "") => {
    window.location.hash = path ? `/${path}` : "/";
    setCartOpen(false);
    setQuickView(null);
    setSearchOpen(false);
    setLookOpen(false);
    setFilmOpen(false);
  };

  const [pathname, queryString = ""] = route.split("?");
  const params = new URLSearchParams(queryString);
  const category = params.get("category") || (pathname === "sale" ? "Sale" : "All");
  const query = params.get("q") || "";
  const sortBy = params.get("sort") || "featured";
  const productSlug = pathname.startsWith("product/") ? pathname.slice("product/".length) : "";
  const product = products.find((item) => item.slug === productSlug);
  const collectionSlug = pathname.startsWith("collections/") ? pathname.slice("collections/".length) : "";
  const collection = collections.find((item) => item.slug === collectionSlug);
  const articleSlug = pathname.startsWith("journal/") ? pathname.slice("journal/".length) : "";
  const articlePage = pathname === "journal" || Boolean(articleSlug);

  useEffect(() => {
    const section = pathname === "" ? params.get("section") : null;
    if (!section) return undefined;
    const frame = window.requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth" }));
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, queryString]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    
    document.querySelectorAll(".reveal-up").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  const openQuickView = (item) => {
    if (item?.look) {
      setLookOpen(true);
      return;
    }
    setQuickView(item);
  };

  const openSizeFinder = (target) => {
    setSizeTarget(target);
    setSizeOpen(true);
  };

  const placeOrder = async ({ form, lines, subtotal, shipping }) => {
    const orderRequest = isApiConfigured() ? await createOrder({
      customer: { name: form.name, email: form.email, phone: form.phone },
      shippingAddress: { address: form.address, city: form.city, state: form.state, postal: form.postal },
      paymentMethod: form.payment === "Cash on delivery" ? "cash_on_delivery" : "pay_on_delivery",
      items: lines.map((line) => ({ slug: line.product.slug, size: line.size, color: line.color, quantity: line.quantity })),
    }) : null;
    const order = {
      id: orderRequest?.order.orderNumber || `NV-${Date.now().toString().slice(-7)}`,
      email: form.email,
      name: form.name,
      total: orderRequest?.order.total ?? subtotal + shipping,
      lines,
      status: orderRequest?.order.status || "Confirmed",
      progress: orderRequest?.order.progress || 2,
      createdAt: orderRequest?.order.createdAt || new Date().toISOString(),
      source: orderRequest ? "server" : "local",
    };
    saveOrder(order);
    lines.forEach((line) => updateQuantity(line.id, line.size, 0, line.color));
    setLatestOrder(order);
    navigate(`success?order=${order.id}`);
  };

  const orderId = params.get("order");
  const successOrder = latestOrder || orders.find((item) => item.id === orderId);

  if (pathname === "admin" || pathname.startsWith("admin/")) {
    return <AdminApp route={route} onNavigate={navigate} />;
  }

  return (
    <>
      {showPagePreloader && <PagePreloader />}
      {pathname !== "auth" && (
        <>
          <AnnouncementBar />
          <Navbar
            customer={customer}
            onLogout={handleLogout}
            route={route}
            transparent={pathname === ""}
            cartCount={cartCount}
            wishlistCount={wishlist.length}
            onNavigate={navigate}
            onSearch={() => setSearchOpen(true)}
            onCart={() => setCartOpen(true)}
            onWishlist={() => navigate("wishlist")}
          />
        </>
      )}
      <ErrorBoundary>
        {pathname === "" ? (
        <main id="top" className="home-page">
          <Hero onWatchVideo={() => setFilmOpen(true)} />
          <FeatureBar />
          <NewArrivals
            products={products.filter((item) => item.newArrival || item.featured).slice(0, 5)}
            loading={productsLoading}
            onQuickView={openQuickView}
            onViewAll={() => navigate("shop?edit=new-arrivals")}
          />
          <CategoryGrid onCategorySelect={(item) => navigate(item === "Sale" ? "sale" : `shop?category=${item}`)} />
          <BrandStory />
          <Sustainability />
          <Testimonials />
          <Lookbook onShopLook={() => setLookOpen(true)} />
          <Newsletter />
        </main>
      ) : pathname === "search" ? (
        <ShopPage category="All" query={query} sortBy={sortBy} routePath={pathname} queryString={queryString} onQuickView={openQuickView} />
      ) : pathname === "shop" || pathname === "sale" ? (
        <ShopPage category={category} query={query} sortBy={sortBy} routePath={pathname} queryString={queryString} onQuickView={openQuickView} />
      ) : pathname === "auth" ? (
        <AuthPage onNavigate={navigate} onLogin={setCustomer} />
      ) : pathname === "reset-password" ? (
        <ResetPassword onNavigate={navigate} />
      ) : pathname === "wishlist" ? (
        <WishlistPage onQuickView={openQuickView} onNavigate={navigate} />
      ) : pathname === "cart" ? (
        <CartPage onNavigate={navigate} />
      ) : pathname === "checkout" ? (
        <CheckoutPage onPlaceOrder={placeOrder} />
      ) : pathname === "tracking" ? (
        <TrackingPage orders={orders} />
      ) : pathname === "success" ? (
        <OrderSuccess order={successOrder} onNavigate={navigate} />
      ) : pathname === "collections" ? (
        <CollectionsPage />
      ) : collection ? (
        <CollectionDetail collection={collection} routePath={pathname} queryString={queryString} onQuickView={openQuickView} />
      ) : articlePage ? (
        <JournalPage articleSlug={articleSlug} />
      ) : pathname === "about" ? (
        <EditorialPage
          title="Wear what stays."
          eyebrow="A little about NOVA"
          image="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=90"
          copy="NOVA is a considered wardrobe for the everyday. We make enduring pieces with thoughtful materials, useful details, and room for your own point of view."
          onNavigate={navigate}
        />
      ) : pathname === "contact" ? (
        <ContactPage />
      ) : pathname === "account" ? (
        <AccountPage orders={orders} onNavigate={navigate} />
      ) : pathname === "account/orders" ? (
        <OrdersPage orders={orders} onNavigate={navigate} />
      ) : pathname.startsWith("account/orders/") ? (
        <OrderDetailPage orderId={pathname.slice("account/orders/".length)} orders={orders} onNavigate={navigate} />
      ) : pathname.startsWith("policy/") ? (
        <PolicyPage slug={pathname.slice("policy/".length)} />
      ) : product ? (
        <ProductPage
          key={product.id}
          product={product}
          onQuickView={openQuickView}
          onFindSize={() => openSizeFinder(product)}
          onBuyNow={() => navigate("checkout")}
          onOpenCart={() => setCartOpen(true)}
          recommendedSize={recommendedSizes[product.id]}
        />
      ) : (
        <EditorialPage
          title="A considered wardrobe."
          eyebrow="NOVA / NOT FOUND"
          image="https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1800&q=90"
          copy="We couldn't find that page. There are still good things to discover."
          onNavigate={navigate}
        />
      )}
      </ErrorBoundary>
      {pathname !== "auth" && <Footer />}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onNavigate={navigate} />
      <SearchOverlay
        open={searchOpen}
        initialQuery={pathname === "search" ? query : ""}
        onClose={() => setSearchOpen(false)}
        onSubmit={(value) => navigate(`search?q=${encodeURIComponent(value)}`)}
      />
      {quickView && <QuickView
        key={quickView.id}
        product={quickView}
        recommendedSize={recommendedSizes[quickView.id]}
        onClose={() => setQuickView(null)}
        onAdd={(item, size, color, quantity) => { addToCart(item, size, quantity, color); setQuickView(null); setCartOpen(true); }}
        onNotify={() => openSizeFinder(quickView)}
      />}
      <SizeFinder
        open={sizeOpen}
        onClose={() => setSizeOpen(false)}
        onSelect={(size) => {
          if (!sizeTarget) return;
          setRecommendedSizes((current) => ({ ...current, [sizeTarget.id]: size }));
          const profile = readStoredJson("nova-profile", {});
          writeStoredJson("nova-profile", { ...profile, size });
        }}
      />
      <ShopTheLook open={lookOpen} onClose={() => setLookOpen(false)} onOpenCart={() => setCartOpen(true)} />
      <FilmModal open={filmOpen} onClose={() => setFilmOpen(false)} />
      <GlobalToast toast={toast} />
    </>
  );
}

function GlobalToast({ toast }) {
  if (!toast) return null;
  return (
    <div className="nova-toast-wrapper">
      <div key={toast.id} className={`nova-toast nova-toast--${toast.type}`}>
        {toast.message}
      </div>
    </div>
  );
}

export default function App() {
  return <StoreProvider><Storefront /></StoreProvider>;
}