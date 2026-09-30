import { useEffect, useState } from "react";
import AnnouncementBar from "./components/AnnouncementBar.jsx";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import FeatureBar from "./components/FeatureBar.jsx";
import NewArrivals from "./components/NewArrivals.jsx";
import CategoryGrid from "./components/CategoryGrid.jsx";
import BrandStory from "./components/BrandStory.jsx";
import Sustainability from "./components/Sustainability.jsx";
import Testimonials from "./components/Testimonials.jsx";
import Lookbook from "./components/Lookbook.jsx";
import Newsletter from "./components/Newsletter.jsx";
import Footer from "./components/Footer.jsx";
import { shopProducts } from "./data/products.js";
import { StoreProvider, useStore } from "./context/StoreContext.jsx";
import { createOrder, isApiConfigured } from "./api/api.js";
import { AccountPage, CheckoutPage, ContactPage, FilmModal } from "./components/CommerceExtras.jsx";
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
  const { cartCount, addToCart, updateQuantity, saveOrder, orders } = useStore();
  const [route, setRoute] = useState(currentRoute);
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
    const syncRoute = () => {
      setRoute(currentRoute());
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
  const product = shopProducts.find((item) => item.slug === productSlug);
  const collectionSlug = pathname.startsWith("collections/") ? pathname.slice("collections/".length) : "";
  const collection = collections.find((item) => item.slug === collectionSlug);
  const articleSlug = pathname.startsWith("journal/") ? pathname.slice("journal/".length) : "";
  const articlePage = pathname === "journal" || Boolean(articleSlug);

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

  return (
    <>
      <AnnouncementBar />
      <Navbar
        transparent={pathname === ""}
        cartCount={cartCount}
        onNavigate={navigate}
        onSearch={() => setSearchOpen(true)}
        onCart={() => setCartOpen(true)}
        onWishlist={() => navigate("wishlist")}
        onAccount={() => navigate("account")}
      />
      {pathname === "" ? (
        <main id="top" className="home-page">
          <Hero onWatchVideo={() => setFilmOpen(true)} />
          <FeatureBar />
          <NewArrivals
            products={shopProducts.filter((item) => item.newArrival || item.featured).slice(0, 5)}
            onProductSelect={(item) => navigate(`product/${item.slug}`)}
            onQuickView={openQuickView}
            onViewAll={() => navigate("shop?sort=newest")}
          />
          <CategoryGrid onCategorySelect={(item) => navigate(item === "Sale" ? "sale" : `shop?category=${item}`)} />
          <BrandStory />
          <Sustainability />
          <Testimonials />
          <Lookbook onShopLook={() => setLookOpen(true)} />
          <Newsletter />
        </main>
      ) : pathname === "shop" || pathname === "sale" ? (
        <ShopPage category={category} query={query} sortBy={sortBy} onQuickView={openQuickView} />
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
        <CollectionDetail collection={collection} onQuickView={openQuickView} />
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
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onNavigate={navigate} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
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
          try {
            const profile = JSON.parse(localStorage.getItem("nova-profile") || "{}");
            localStorage.setItem("nova-profile", JSON.stringify({ ...profile, size }));
          } catch { /* Browser storage can be unavailable. */ }
        }}
      />
      <ShopTheLook open={lookOpen} onClose={() => setLookOpen(false)} onOpenCart={() => setCartOpen(true)} />
      <FilmModal open={filmOpen} onClose={() => setFilmOpen(false)} />
    </>
  );
}

export default function App() {
  return <StoreProvider><Storefront /></StoreProvider>;
}