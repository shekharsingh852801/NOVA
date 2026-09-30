import { useEffect, useMemo, useRef, useState } from "react";
import { shopProducts } from "../data/products.js";
import { useStore } from "../context/StoreContext.jsx";
import { BackInStockForm, ProductReviewPanel } from "./CommerceExtras.jsx";
import { isApiConfigured, trackOrder } from "../api/api.js";
import { ArrowIcon, BagIcon, CloseIcon, HeartIcon, PlusIcon, StarIcon } from "./Icons.jsx";

const money = (value) => `$${Number(value || 0).toFixed(2)}`;
function readPreferredSize() {
  try {
    const size = JSON.parse(localStorage.getItem("nova-profile") || "{}").size;
    return ["XS", "S", "M", "L", "XL"].includes(size) ? size : "M";
  } catch {
    return "M";
  }
}

function useEscape(open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);
}

const articles = [
  { slug: "uniform-for-the-in-between", category: "Style", title: "A uniform for the in-between", image: "photo-1515886657613-9f3515b0c78f", summary: "On building a wardrobe that moves at your pace." },
  { slug: "the-long-life-of-good-cotton", category: "Sustainability", title: "The long life of good cotton", image: "photo-1521572163474-6864f9cf17ab", summary: "A closer look at the fibres behind our everyday essentials." },
  { slug: "objects-in-use", category: "Culture", title: "Objects in use", image: "photo-1548126032-079a0fb0099d", summary: "The small things we keep, and why they matter." },
];
const collections = [
  { slug: "winter-26", title: "Winter '26", image: "photo-1629131678696-0b56fe341b74", story: "Quiet layers for the colder months. Textures to live in, shapes to keep." },
  { slug: "everyday-uniform", title: "The Everyday Uniform", image: "photo-1551028719-00167b16eac5", story: "A study in useful forms, made to move through the week." },
  { slug: "soft-structure", title: "Soft Structure", image: "photo-1598554747436-c9293d6a588f", story: "Light layers and considered proportions for a change in season." },
];

function ProductCard({ product, onQuickView }) {
  const { wishlist, toggleWishlist } = useStore();
  const wished = wishlist.includes(product.id);
  return (
    <article className="store-product-card">
      <div className="store-product-card__media">
        <a href={`#/product/${product.slug}`} aria-label={`View ${product.name}`}>
          <img className="store-product-card__image" src={product.images[0]} alt={product.name} loading="lazy" />
          <img className="store-product-card__image store-product-card__image--alt" src={product.images[1] || product.images[0]} alt="" loading="lazy" />
        </a>
        {product.tags?.[0] && <span className="store-product-card__tag">{product.tags[0]}</span>}
        <button className={`store-product-card__heart ${wished ? "is-active" : ""}`} onClick={() => toggleWishlist(product.id)} aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name}`} aria-pressed={wished}>
          <HeartIcon />
        </button>
        <button className="store-product-card__quick" onClick={() => onQuickView(product)}>
          {product.stock > 0 ? "Quick view" : "Notify me"}
        </button>
      </div>
      <div className="store-product-card__details">
        <div className="store-product-card__line">
          <a className="store-product-card__name" href={`#/product/${product.slug}`}>{product.name}</a>
          <span className="store-product-card__price">{money(product.price)}</span>
        </div>
        <div className="store-product-card__meta">
          <span>{product.colors.length} {product.colors.length === 1 ? "colour" : "colours"}</span>
          {product.compareAtPrice && <span className="store-product-card__compare">{money(product.compareAtPrice)}</span>}
        </div>
        <div className="store-product-card__swatches" aria-label="Available colours">
          {product.colors.map((color) => <span key={color.name} title={color.name} style={{ background: color.value }} />)}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, onQuickView }) {
  return <div className="store-product-grid">{products.map((product) => <ProductCard key={product.id} product={product} onQuickView={onQuickView} />)}</div>;
}

function ShopFilters({ filters, setFilters, productList }) {
  const categoriesList = ["All", "Men", "Women", "Accessories", "Sale"];
  const materials = [...new Set(productList.map((product) => product.material))];
  const fits = [...new Set(productList.map((product) => product.fit))];
  return (
    <div className="shop-filters__controls">
      <label>Category<select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>{categoriesList.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Size<select value={filters.size} onChange={(event) => setFilters({ ...filters, size: event.target.value })}><option value="All">All sizes</option>{[...new Set(productList.flatMap((product) => product.sizes))].map((size) => <option key={size}>{size}</option>)}</select></label>
      <label>Colour<select value={filters.color} onChange={(event) => setFilters({ ...filters, color: event.target.value })}><option value="All">All colours</option>{[...new Set(productList.flatMap((product) => product.colors.map((color) => color.name)))].map((color) => <option key={color}>{color}</option>)}</select></label>
      <label>Price<select value={filters.price} onChange={(event) => setFilters({ ...filters, price: event.target.value })}><option value="All">Any price</option><option value="under60">Under $60</option><option value="60to100">$60–$100</option><option value="over100">Over $100</option></select></label>
      <label>Fit<select value={filters.fit} onChange={(event) => setFilters({ ...filters, fit: event.target.value })}><option value="All">Any fit</option>{fits.map((fit) => <option key={fit}>{fit}</option>)}</select></label>
      <label>Material<select value={filters.material} onChange={(event) => setFilters({ ...filters, material: event.target.value })}><option value="All">Any material</option>{materials.map((material) => <option key={material}>{material}</option>)}</select></label>
      <label className="shop-filters__check"><input type="checkbox" checked={filters.available} onChange={(event) => setFilters({ ...filters, available: event.target.checked })} /> In stock</label>
    </div>
  );
}

export function ShopPage({ category = "All", query = "", sortBy = "featured", onQuickView }) {
  const [filters, setFilters] = useState({ category, size: "All", color: "All", price: "All", fit: "All", material: "All", available: false });
  const [sort, setSort] = useState(sortBy);
  const [filterSheet, setFilterSheet] = useState(false);
  useEscape(filterSheet, () => setFilterSheet(false));
  useEffect(() => setFilters((current) => ({ ...current, category })), [category]);
  useEffect(() => setSort(sortBy), [sortBy]);
  const products = useMemo(() => {
    let result = shopProducts.filter((product) => {
      if (query && !`${product.name} ${product.category} ${product.tags.join(" ")} ${product.material}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (filters.category !== "All" && product.category !== filters.category) return false;
      if (filters.size !== "All" && !product.sizes.includes(filters.size)) return false;
      if (filters.color !== "All" && !product.colors.some((item) => item.name === filters.color)) return false;
      if (filters.fit !== "All" && product.fit !== filters.fit) return false;
      if (filters.material !== "All" && product.material !== filters.material) return false;
      if (filters.available && product.stock < 1) return false;
      if (filters.price === "under60" && product.price >= 60) return false;
      if (filters.price === "60to100" && (product.price < 60 || product.price > 100)) return false;
      if (filters.price === "over100" && product.price <= 100) return false;
      if (filters.category === "Sale" && !product.compareAtPrice) return false;
      return true;
    });
    if (sort === "price-low") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-high") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "newest") result = [...result].sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
    if (sort === "popular") result = [...result].sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller));
    return result;
  }, [filters, query, sort]);
  const title = query ? `Search results for “${query}”` : filters.category === "All" ? "The collection" : filters.category === "Sale" ? "Considered finds" : `${filters.category}, in NOVA`;
  return (
    <main className="commerce-page shop-page">
      <div className="shop-page__intro">
        <p className="eyebrow eyebrow--dark">Designed to stay in rotation</p>
        <h1>{title}</h1>
        <p>Thoughtful layers, useful details, and pieces that earn their place in your everyday.</p>
      </div>
      <div className="shop-toolbar">
        <span>{products.length} pieces</span>
        <div className="shop-toolbar__actions">
          <button className="text-action shop-mobile-filter" onClick={() => setFilterSheet(true)}>Filter & sort</button>
          <label className="shop-sort">Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="newest">New arrivals</option><option value="popular">Best sellers</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
        </div>
      </div>
      <div className="shop-filters shop-desktop-filter"><ShopFilters filters={filters} setFilters={setFilters} productList={shopProducts} /></div>
      {products.length ? <ProductGrid products={products} onQuickView={onQuickView} /> : <EmptyState title="No pieces found" copy="Try adjusting your filters to find a better fit." action="Clear filters" onClick={() => setFilters({ category: "All", size: "All", color: "All", price: "All", fit: "All", material: "All", available: false })} />}
      {filterSheet && <div className="sheet-backdrop" onClick={() => setFilterSheet(false)}><section className="filter-sheet" role="dialog" aria-modal="true" aria-label="Filter products" onClick={(event) => event.stopPropagation()}><div className="overlay-heading"><div><p className="eyebrow eyebrow--dark">Refine</p><h2>Filters</h2></div><button className="icon-close" onClick={() => setFilterSheet(false)} aria-label="Close filters"><CloseIcon /></button></div><ShopFilters filters={filters} setFilters={setFilters} productList={shopProducts} /><button className="btn btn--dark filter-sheet__apply" onClick={() => setFilterSheet(false)}>Show {products.length} pieces</button></section></div>}
    </main>
  );
}

export function ProductPage({ product, onQuickView, onFindSize, onBuyNow, onOpenCart, recommendedSize }) {
  const { wishlist, toggleWishlist, recentlyViewed, recordView, addToCart } = useStore();
  const preferredSize = readPreferredSize();
  const [size, setSize] = useState(product.sizes.includes(preferredSize) ? preferredSize : product.sizes[0]);
  const [colorName, setColorName] = useState(product.colors[0].name);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const isWished = wishlist.includes(product.id);
  useEffect(() => recordView(product.id), [product.id]);
  useEffect(() => { if (recommendedSize && product.sizes.includes(recommendedSize)) setSize(recommendedSize); }, [product.id, product.sizes, recommendedSize]);
  const addProduct = () => {
    addToCart(product, size, quantity, colorName);
    onOpenCart();
  };
  const matching = shopProducts.filter((item) => ["p3", "p5", "p6"].includes(item.id) && item.id !== product.id).slice(0, 3);
  const recently = recentlyViewed.map((id) => shopProducts.find((item) => item.id === id)).filter((item) => item && item.id !== product.id).slice(0, 4);
  return (
    <main className="commerce-page product-page">
      <div className="product-detail">
        <div className="product-gallery">
          <div className="product-gallery__main"><img src={product.images[activeImage]} alt={`${product.name}, view ${activeImage + 1}`} fetchpriority="high" /></div>
          <div className="product-gallery__thumbs">{product.images.map((src, index) => <button key={src} className={activeImage === index ? "is-selected" : ""} onClick={() => setActiveImage(index)} aria-label={`Show product image ${index + 1}`}><img src={src} alt="" /></button>)}</div>
          <button className="product-gallery__look" onClick={() => onQuickView({ look: true })}>Shop this look <ArrowIcon /></button>
        </div>
        <div className="product-info">
          <p className="eyebrow eyebrow--dark">{product.category} / {product.subcategory}</p>
          <h1>{product.name}</h1>
          <div className="product-info__price-row"><p className="product-info__price">{money(product.price)} {product.compareAtPrice && <del>{money(product.compareAtPrice)}</del>}</p><a href="#reviews" className="product-rating"><span>{product.rating.toFixed(1)}</span><StarIcon /> <small>{product.reviews} reviews</small></a></div>
          <p className="product-info__description">{product.description}</p>
          <div className="product-choice"><div className="product-choice__heading"><span>Colour</span><span>{colorName}</span></div><div className="product-choice__colors">{product.colors.map((color) => <button className={colorName === color.name ? "is-selected" : ""} key={color.name} aria-label={color.name} aria-pressed={colorName === color.name} title={color.name} style={{ background: color.value }} onClick={() => setColorName(color.name)} />)}</div></div>
          <div className="product-choice"><div className="product-choice__heading"><span>Size</span><button className="text-action" onClick={onFindSize}>Find my size</button></div><div className="size-options">{product.sizes.map((item) => <button className={size === item ? "is-selected" : ""} key={item} onClick={() => setSize(item)}>{item}</button>)}</div></div>
          <div className="product-buy-row"><label className="quantity-control"><span className="sr-only">Quantity</span><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">−</button><output>{quantity}</output><button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} aria-label="Increase quantity">+</button></label><button className="btn btn--dark product-buy-row__add" onClick={addProduct} disabled={!product.stock}><span>{product.stock ? "Add to bag" : "Out of stock"}</span><span>{money(product.price * quantity)}</span></button></div>
          {product.stock > 0 ? <button className="product-buy__now" onClick={() => { addToCart(product, size, quantity, colorName); onBuyNow(); }}>Buy now <ArrowIcon /></button> : <BackInStockForm product={product} />}
          <button className={`product-save ${isWished ? "is-active" : ""}`} onClick={() => toggleWishlist(product.id)}><HeartIcon /> {isWished ? "Saved to wishlist" : "Save to wishlist"}</button>
          <div className="product-accordions"><details open><summary>Details</summary><p>{product.description}</p><p>{product.material} · {product.fit}</p></details><details><summary>Material & care</summary><p>{product.material}. {product.care}</p></details><details><summary>Shipping & returns</summary><p>Complimentary shipping on orders over $75. Returns accepted within 30 days in original condition.</p></details></div>
        </div>
      </div>
      <section className="look-complete"><div className="commerce-section-heading"><div><p className="eyebrow eyebrow--dark">Considered together</p><h2>Complete the look</h2></div><button className="btn btn--dark" onClick={() => { matching.forEach((item) => addToCart(item, item.sizes[0])); onOpenCart(); }}>Add all to bag <ArrowIcon /></button></div><ProductGrid products={matching} onQuickView={onQuickView} /></section>
      <ProductReviewPanel product={product} />
      {recently.length > 0 && <section className="look-complete"><div className="commerce-section-heading"><div><p className="eyebrow eyebrow--dark">A second look</p><h2>Recently viewed</h2></div></div><ProductGrid products={recently} onQuickView={onQuickView} /></section>}
    </main>
  );
}

export function QuickView({ product, onClose, onAdd, onNotify, recommendedSize }) {
  const { wishlist, toggleWishlist } = useStore();
  const preferredSize = readPreferredSize();
  const [size, setSize] = useState(product.sizes?.includes(preferredSize) ? preferredSize : product.sizes?.[0] || "M");
  const [imageIndex, setImageIndex] = useState(0);
  const [colorName, setColorName] = useState(product.colors?.[0]?.name || "");
  const [quantity, setQuantity] = useState(1);
  useEscape(true, onClose);
  useEffect(() => { if (recommendedSize && product.sizes.includes(recommendedSize)) setSize(recommendedSize); }, [product.id, product.sizes, recommendedSize]);
  const isWished = wishlist.includes(product.id);
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="quick-view" role="dialog" aria-modal="true" aria-label={`Quick view: ${product.name}`}>
        <button className="icon-close quick-view__close" onClick={onClose} aria-label="Close quick view"><CloseIcon /></button>
        <div className="quick-view__media"><img src={product.images[imageIndex]} alt={product.name} />{product.images.length > 1 && <div className="quick-view__image-controls">{product.images.map((src, index) => <button key={src} className={imageIndex === index ? "is-selected" : ""} onClick={() => setImageIndex(index)} aria-label={`View image ${index + 1}`} />)}</div>}</div>
        <div className="quick-view__content">
          <p className="eyebrow eyebrow--dark">{product.category} / {product.subcategory}</p>
          <h2>{product.name}</h2>
          <div className="quick-view__rating"><span>{product.rating.toFixed(1)}</span><StarIcon /><small>{product.reviews} reviews</small></div>
          <p className="product-info__price">{money(product.price)}</p>
          <p className="product-info__description">{product.description}</p>
          <div className="product-choice"><div className="product-choice__heading"><span>Colour</span><span>{colorName}</span></div><div className="product-choice__colors">{product.colors?.map((color) => <button className={colorName === color.name ? "is-selected" : ""} key={color.name} aria-label={color.name} aria-pressed={colorName === color.name} title={color.name} style={{ background: color.value }} onClick={() => setColorName(color.name)} />)}</div></div>
          <div className="product-choice"><div className="product-choice__heading"><span>Size</span><button className="text-action" onClick={onNotify}>Find my size</button></div><div className="size-options">{product.sizes.map((item) => <button className={size === item ? "is-selected" : ""} key={item} onClick={() => setSize(item)}>{item}</button>)}</div></div>
          {product.stock > 0 ? <div className="quick-view__buy-row"><label className="quantity-control"><span className="sr-only">Quantity</span><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">−</button><output>{quantity}</output><button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} aria-label="Increase quantity">+</button></label><button className="btn btn--dark quick-view__add" onClick={() => onAdd(product, size, colorName, quantity)}>Add to bag <ArrowIcon /></button></div> : <BackInStockForm product={product} />}
          <button className={`product-save quick-view__save ${isWished ? "is-active" : ""}`} onClick={() => toggleWishlist(product.id)}><HeartIcon /> {isWished ? "Saved to wishlist" : "Save to wishlist"}</button>
          <a className="text-action quick-view__full" href={`#/product/${product.slug}`} onClick={onClose}>View full details</a>
        </div>
      </section>
    </div>
  );
}

export function CartDrawer({ open, onClose, onNavigate }) {
  const { cart, updateQuantity } = useStore();
  const items = cart.map((line) => ({ ...line, product: shopProducts.find((product) => product.id === line.id) })).filter((line) => line.product);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const remaining = Math.max(0, 75 - subtotal);
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Your bag">
        <div className="cart-drawer__head"><div><p className="eyebrow eyebrow--dark">NOVA / 01</p><h2>Your bag <span>({items.reduce((sum, item) => sum + item.quantity, 0)})</span></h2></div><button className="icon-close" onClick={onClose} aria-label="Close bag"><CloseIcon /></button></div>
        {items.length ? <>
          <div className="shipping-progress"><p>{remaining ? `${money(remaining)} away from complimentary shipping` : "Complimentary shipping unlocked"}</p><span><i style={{ width: `${Math.min(100, (subtotal / 75) * 100)}%` }} /></span></div>
          <div className="cart-drawer__items">{items.map(({ product, size, color, quantity }) => <CartLine key={`${product.id}-${size}-${color}`} product={product} size={size} color={color} quantity={quantity} onQuantity={(next) => updateQuantity(product.id, size, next, color)} compact />)}</div>
          <div className="cart-drawer__bottom"><div className="cart-subtotal"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><p>Shipping and taxes calculated at checkout.</p><button className="btn btn--dark cart-checkout" onClick={() => { onClose(); onNavigate("checkout"); }}>Continue to checkout <ArrowIcon /></button><button className="text-action cart-view" onClick={() => { onClose(); onNavigate("cart"); }}>View bag</button></div>
        </> : <EmptyState title="Your bag is at rest" copy="Discover pieces made to move with you." action="Explore the collection" onClick={() => { onClose(); onNavigate("shop"); }} />}
      </aside>
    </div>
  );
}

function CartLine({ product, size, color = product.colors[0].name, quantity, onQuantity, compact = false }) {
  return <article className={`cart-line ${compact ? "cart-line--compact" : ""}`}><a href={`#/product/${product.slug}`} className="cart-line__image"><img src={product.images[0]} alt={product.name} /></a><div className="cart-line__details"><a href={`#/product/${product.slug}`} className="cart-line__name">{product.name}</a><p>Size {size} · {color}</p><div className="cart-line__bottom"><div className="quantity-control"><button onClick={() => onQuantity(quantity - 1)} aria-label={`Decrease ${product.name} quantity`}>−</button><output>{quantity}</output><button onClick={() => onQuantity(quantity + 1)} aria-label={`Increase ${product.name} quantity`}>+</button></div><strong>{money(product.price * quantity)}</strong></div></div></article>;
}

export function CartPage({ onNavigate }) {
  const { cart, updateQuantity } = useStore();
  const items = cart.map((line) => ({ ...line, product: shopProducts.find((product) => product.id === line.id) })).filter((line) => line.product);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return <main className="commerce-page cart-page"><p className="eyebrow eyebrow--dark">NOVA / 01</p><h1>Your bag</h1>{items.length ? <div className="cart-page__layout"><section>{items.map(({ product, size, color, quantity }) => <div className="cart-page__line" key={`${product.id}-${size}-${color}`}><CartLine product={product} size={size} color={color} quantity={quantity} onQuantity={(next) => updateQuantity(product.id, size, next, color)} /><button className="text-action" onClick={() => updateQuantity(product.id, size, 0, color)}>Remove</button></div>)}</section><aside className="cart-summary"><p className="eyebrow eyebrow--dark">Order summary</p><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Shipping</span><span>{subtotal >= 75 ? "Complimentary" : "Calculated at checkout"}</span></div><button className="btn btn--dark" onClick={() => onNavigate("checkout")}>Continue to checkout <ArrowIcon /></button><a href="#/shop" className="text-action">Continue shopping</a></aside></div> : <EmptyState title="Nothing in your bag yet." copy="Discover pieces worth keeping." action="Explore new arrivals" onClick={() => onNavigate("shop?sort=newest")} />}</main>;
}

export function WishlistPage({ onQuickView, onNavigate }) {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const items = wishlist.map((id) => shopProducts.find((product) => product.id === id)).filter(Boolean);
  return <main className="commerce-page wishlist-page"><p className="eyebrow eyebrow--dark">A personal edit</p><h1>Saved pieces</h1>{items.length ? <div className="wishlist-grid">{items.map((product) => <article className="wishlist-item" key={product.id}><ProductCard product={product} onQuickView={onQuickView} /><div className="wishlist-item__actions"><button className="btn btn--dark" onClick={() => { addToCart(product, product.sizes[0]); toggleWishlist(product.id); }}>Move to bag</button><button className="text-action" onClick={() => toggleWishlist(product.id)}>Remove</button></div></article>)}</div> : <EmptyState title="Nothing saved yet." copy="Discover pieces worth keeping." action="Explore new arrivals" onClick={() => onNavigate("shop?sort=newest")} />}</main>;
}

export function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nova-searches") || "[]"); } catch { return []; }
  });
  const inputRef = useRef(null);
  useEscape(open, onClose);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  if (!open) return null;
  const normalized = query.trim().toLowerCase();
  const foundProducts = normalized ? shopProducts.filter((product) => `${product.name} ${product.category} ${product.tags.join(" ")}`.toLowerCase().includes(normalized)).slice(0, 4) : [];
  const foundCollections = normalized ? collections.filter((item) => `${item.title} ${item.story}`.toLowerCase().includes(normalized)) : [];
  const foundArticles = normalized ? articles.filter((item) => `${item.title} ${item.category}`.toLowerCase().includes(normalized)) : [];
  const saveSearch = (value) => {
    const next = [value, ...recent.filter((item) => item !== value)].slice(0, 5);
    setRecent(next);
    localStorage.setItem("nova-searches", JSON.stringify(next));
  };
  return <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search NOVA"><div className="search-overlay__top"><a className="navbar__logo" href="#/">NOVA</a><button className="icon-close" onClick={onClose} aria-label="Close search"><CloseIcon /></button></div><form className="search-overlay__form" onSubmit={(event) => { event.preventDefault(); if (query.trim()) { saveSearch(query.trim()); window.location.hash = `#/shop?q=${encodeURIComponent(query.trim())}`; onClose(); } }}><label className="sr-only" htmlFor="store-search">Search products, collections, journal</label><input ref={inputRef} id="store-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, collections, journal..." autoComplete="off" /><button aria-label="Submit search"><ArrowIcon /></button></form><div className="search-overlay__results">{!normalized ? <div className="search-suggestions"><div><p className="eyebrow eyebrow--dark">Recent searches</p>{recent.length ? recent.map((item) => <button key={item} onClick={() => setQuery(item)}>{item}</button>) : <p className="muted-copy">Your recent searches will appear here.</p>}</div><div><p className="eyebrow eyebrow--dark">Popular now</p>{["Everyday layers", "Canvas jacket", "Soft structure"].map((item) => <button key={item} onClick={() => setQuery(item)}>{item}</button>)}</div></div> : <>{foundProducts.length > 0 && <SearchGroup title="Pieces">{foundProducts.map((product) => <a key={product.id} href={`#/product/${product.slug}`} onClick={() => { saveSearch(query); onClose(); }}><img src={product.images[0]} alt="" /><span>{product.name}<small>{money(product.price)}</small></span></a>)}</SearchGroup>}{foundCollections.length > 0 && <SearchGroup title="Collections">{foundCollections.map((item) => <a key={item.slug} href={`#/collections/${item.slug}`} onClick={() => { saveSearch(query); onClose(); }}>{item.title}<ArrowIcon /></a>)}</SearchGroup>}{foundArticles.length > 0 && <SearchGroup title="Journal">{foundArticles.map((item) => <a key={item.slug} href={`#/journal/${item.slug}`} onClick={() => { saveSearch(query); onClose(); }}>{item.title}<ArrowIcon /></a>)}</SearchGroup>}{!foundProducts.length && !foundCollections.length && !foundArticles.length && <EmptyState title="No matches this time." copy="Try a product name, category, or material." />}</>}</div></div>;
}

function SearchGroup({ title, children }) { return <section className="search-group"><p className="eyebrow eyebrow--dark">{title}</p>{children}</section>; }

export function SizeFinder({ open, onClose, onSelect }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ height: "", weight: "", fit: "Regular", usual: readPreferredSize(), preference: "Balanced" });
  useEscape(open, onClose);
  useEffect(() => { if (open) { setStep(0); setAnswers({ height: "", weight: "", fit: "Regular", usual: readPreferredSize(), preference: "Balanced" }); } }, [open]);
  if (!open) return null;
  const steps = [
    { title: "How tall are you?", label: "Height (cm)", field: "height", type: "number", placeholder: "e.g. 175" },
    { title: "A little about your build", label: "Weight (kg)", field: "weight", type: "number", placeholder: "e.g. 70" },
    { title: "How do you like things to fit?", field: "fit", options: ["Close", "Regular", "Relaxed"] },
    { title: "What size do you usually wear?", field: "usual", options: ["XS", "S", "M", "L", "XL"] },
    { title: "How do you want it to feel?", field: "preference", options: ["Balanced", "Room to layer", "Closer to body"] },
  ];
  const stepData = steps[step];
  const sizeIndex = ["XS", "S", "M", "L", "XL"].indexOf(answers.usual);
  const adjustment = (Number(answers.height) > 186 || Number(answers.weight) > 88 || answers.fit === "Relaxed" || answers.preference === "Room to layer") ? 1 : (answers.fit === "Close" || answers.preference === "Closer to body") ? -1 : 0;
  const recommended = ["XS", "S", "M", "L", "XL"][Math.min(4, Math.max(0, sizeIndex + adjustment))];
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="size-finder" role="dialog" aria-modal="true" aria-labelledby="size-finder-title"><button className="icon-close" onClick={onClose} aria-label="Close size finder"><CloseIcon /></button>{step < steps.length ? <><p className="eyebrow eyebrow--dark">Find your NOVA fit · {step + 1} of {steps.length}</p><div className="size-finder__progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div><h2 id="size-finder-title">{stepData.title}</h2><p className="size-finder__sub">A few quick details help us make a thoughtful recommendation.</p>{stepData.options ? <div className="size-finder__options">{stepData.options.map((option) => <button className={answers[stepData.field] === option ? "is-selected" : ""} key={option} onClick={() => setAnswers({ ...answers, [stepData.field]: option })}>{option}</button>)}</div> : <label className="size-finder__input">{stepData.label}<input type={stepData.type} min="1" max={stepData.field === "height" ? "230" : "250"} value={answers[stepData.field]} placeholder={stepData.placeholder} onChange={(event) => setAnswers({ ...answers, [stepData.field]: event.target.value })} /></label>}<div className="size-finder__actions">{step > 0 && <button className="text-action" onClick={() => setStep(step - 1)}>Back</button>}<button className="btn btn--dark" onClick={() => { if (stepData.field === "height" && !answers.height) return; if (stepData.field === "weight" && !answers.weight) return; setStep(step + 1); }}>Continue <ArrowIcon /></button></div></> : <><p className="eyebrow eyebrow--dark">Your recommendation</p><h2 id="size-finder-title">Start with {recommended}</h2><p className="size-finder__confidence">Confidence · High</p><p className="size-finder__sub">Based on the fit you prefer and the size you usually wear. If you prefer a more relaxed feel, consider {recommended === "XL" ? "XL" : ["XS", "S", "M", "L", "XL"][Math.min(4, sizeIndex + 1)]}.</p><button className="btn btn--dark" onClick={() => { onSelect(recommended); onClose(); }}>Choose {recommended} <ArrowIcon /></button><button className="text-action size-finder__restart" onClick={() => setStep(0)}>Start again</button></>}</section></div>;
}

export function ShopTheLook({ open, onClose, onOpenCart }) {
  const { addToCart } = useStore();
  useEscape(open, onClose);
  const lookItems = [shopProducts[0], shopProducts[2], shopProducts[5], shopProducts[7]];
  const [sizes, setSizes] = useState(() => Object.fromEntries(lookItems.map((item) => [item.id, item.sizes[0]])));
  if (!open) return null;
  const addAll = () => { lookItems.forEach((item) => addToCart(item, sizes[item.id])); onClose(); onOpenCart(); };
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="look-modal" role="dialog" aria-modal="true" aria-label="Shop the look"><button className="icon-close look-modal__close" onClick={onClose} aria-label="Close look"><CloseIcon /></button><div className="look-modal__image"><img src={shopProducts[0].images[1]} alt="NOVA layered winter look" /><span>Winter '26 / Look 04</span></div><div className="look-modal__content"><p className="eyebrow eyebrow--dark">The complete edit</p><h2>Shop this look</h2><p className="muted-copy">Four considered pieces, worn together or your own way.</p><div className="look-modal__items">{lookItems.map((product) => <article key={product.id}><img src={product.images[0]} alt={product.name} /><div><a href={`#/product/${product.slug}`} onClick={onClose}>{product.name}</a><span>{money(product.price)}</span><select aria-label={`Size for ${product.name}`} value={sizes[product.id]} onChange={(event) => setSizes({ ...sizes, [product.id]: event.target.value })}>{product.sizes.map((size) => <option key={size}>{size}</option>)}</select></div><button className="look-modal__add" onClick={() => addToCart(product, sizes[product.id])} aria-label={`Add ${product.name} to bag`}><PlusIcon /></button></article>)}</div><button className="btn btn--dark" onClick={addAll}>Add entire look · {money(lookItems.reduce((sum, item) => sum + item.price, 0))} <ArrowIcon /></button></div></section></div>;
}

function LegacyCheckoutPage({ onPlaceOrder }) {
  const { cart } = useStore();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", state: "", postal: "", payment: "Cash on delivery" });
  const lines = cart.map((line) => ({ ...line, product: shopProducts.find((product) => product.id === line.id) })).filter((line) => line.product);
  const subtotal = lines.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 8;
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const continueStep = () => {
    if (step === 0 && (!form.name || !form.email || !form.phone)) { setError("Please complete your contact details."); return; }
    if (step === 1 && (!form.address || !form.city || !form.state || !form.postal)) { setError("Please complete your shipping address."); return; }
    setError("");
    setStep(step + 1);
  };
  return <main className="commerce-page checkout-page"><p className="eyebrow eyebrow--dark">NOVA / CHECKOUT</p><h1>Make it yours.</h1><div className="checkout-steps">{["Information", "Shipping", "Payment", "Review"].map((label, index) => <button key={label} className={step === index ? "is-current" : step > index ? "is-done" : ""} onClick={() => index < step && setStep(index)}>{String(index + 1).padStart(2, "0")} <span>{label}</span></button>)}</div><div className="checkout-layout"><form className="checkout-form" onSubmit={(event) => event.preventDefault()}>{step === 0 && <><div className="checkout-form__title"><h2>Contact information</h2><span>Checking out as a guest</span></div><label>Full name<input name="name" autoComplete="name" value={form.name} onChange={update} required /></label><label>Email address<input name="email" type="email" autoComplete="email" value={form.email} onChange={update} required /></label><label>Phone number<input name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={update} required /></label></>}{step === 1 && <><div className="checkout-form__title"><h2>Shipping address</h2><button className="text-action" onClick={() => setStep(0)}>Edit contact details</button></div><label>Street address<input name="address" autoComplete="street-address" value={form.address} onChange={update} required /></label><div className="checkout-form__row"><label>City<input name="city" autoComplete="address-level2" value={form.city} onChange={update} required /></label><label>State / region<input name="state" autoComplete="address-level1" value={form.state} onChange={update} required /></label></div><label>Postal code<input name="postal" autoComplete="postal-code" value={form.postal} onChange={update} required /></label></>}{step === 2 && <><div className="checkout-form__title"><h2>Payment</h2><span>Secure checkout</span></div><label className="payment-choice"><input type="radio" name="payment" value="Cash on delivery" checked={form.payment === "Cash on delivery"} onChange={update} />Cash on delivery <span>Pay when your order arrives</span></label><label className="payment-choice"><input type="radio" name="payment" value="Pay on delivery" checked={form.payment === "Pay on delivery"} onChange={update} />Pay on delivery <span>Payment collection arranged by the carrier</span></label><p className="checkout-note">Online card payments will be available when a payment provider is connected.</p></>}{step === 3 && <><div className="checkout-form__title"><h2>Review your order</h2><button className="text-action" onClick={() => setStep(0)}>Edit details</button></div><p className="review-contact">{form.name}<br />{form.email} · {form.phone}<br />{form.address}, {form.city}, {form.state} {form.postal}</p><p className="checkout-note">Payment: {form.payment}. This is a local storefront demo; no payment will be charged.</p></>}{error && <p className="form-error" role="alert">{error}</p>}{step < 3 ? <button className="btn btn--dark checkout-continue" type="button" onClick={continueStep}>Continue to {step === 0 ? "shipping" : step === 1 ? "payment" : "review"} <ArrowIcon /></button> : <button className="btn btn--dark checkout-continue" type="button" disabled={!lines.length} onClick={() => onPlaceOrder({ form, lines, subtotal, shipping })}>Place demo order · {money(subtotal + shipping)} <ArrowIcon /></button>}</form><aside className="checkout-summary"><div className="checkout-summary__heading"><h2>Your edit</h2><span>{lines.reduce((sum, line) => sum + line.quantity, 0)} pieces</span></div>{lines.map(({ product, size, quantity }) => <div className="checkout-summary__item" key={`${product.id}-${size}`}><img src={product.images[0]} alt={product.name} /><div><span>{product.name}</span><small>Size {size} · Qty {quantity}</small></div><strong>{money(product.price * quantity)}</strong></div>)}{!lines.length && <p className="muted-copy">Your bag is empty.</p>}<div className="checkout-summary__totals"><p><span>Subtotal</span><span>{money(subtotal)}</span></p><p><span>Shipping</span><span>{shipping === 0 ? "Complimentary" : money(shipping)}</span></p><p className="checkout-summary__total"><strong>Total</strong><strong>{money(subtotal + shipping)}</strong></p></div></aside></div></main>;
}

export function TrackingPage({ orders }) {
  const [number, setNumber] = useState("");
  const [contact, setContact] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const findOrder = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isApiConfigured()) {
        const result = await trackOrder(number.trim(), contact.trim());
        const tracked = result.order;
        const statusLabels = { confirmed: "Confirmed", packed: "Packed", shipped: "Shipped", out_for_delivery: "Out for delivery", delivered: "Delivered", cancelled: "Cancelled" };
        setOrder({ id: tracked.orderNumber, status: statusLabels[tracked.status] || "Confirmed", progress: tracked.progress, total: tracked.total });
      } else {
        const found = orders.find((item) => item.id.toLowerCase() === number.trim().toLowerCase() && item.email.toLowerCase() === contact.trim().toLowerCase());
        if (!found) throw new Error("We couldn't find an order with those details.");
        setOrder(found);
      }
    } catch (lookupError) {
      setOrder(null);
      setError(lookupError.message || "We couldn't find an order with those details.");
    } finally {
      setLoading(false);
    }
  };
  return <main className="commerce-page tracking-page"><p className="eyebrow eyebrow--dark">NOVA / DELIVERY</p><h1>Track your order.</h1><p className="page-lede">A little more clarity while your order makes its way to you.</p><form className="tracking-form" onSubmit={findOrder}><label>Order number<input value={number} onChange={(event) => setNumber(event.target.value)} placeholder="NV-000000" required /></label><label>Email used at checkout<input type="email" value={contact} onChange={(event) => setContact(event.target.value)} placeholder="you@example.com" required /></label><button className="btn btn--dark" disabled={loading}>{loading ? "Looking up…" : "Find my order"} <ArrowIcon /></button>{error && <p className="form-error" role="alert">{error}</p>}</form>{order && <section className="tracking-result"><p className="eyebrow eyebrow--dark">Order {order.id}</p><h2>{order.status}</h2><div className="tracking-timeline">{["Order placed", "Confirmed", "Packed", "Shipped", "Out for delivery", "Delivered"].map((status, index) => <div className={index < order.progress ? "is-complete" : ""} key={status}><i /><span>{status}</span></div>)}</div></section>}</main>;
}

export function OrderSuccess({ order, onNavigate }) {
  return <main className="commerce-page order-success"><p className="eyebrow eyebrow--dark">NOVA / THANK YOU</p><h1>Good things are on their way.</h1><p>{order?.source === "server" ? "Your order has been recorded. Payment remains pending until a provider is connected." : "Your demo order has been saved on this device."}</p>{order && <p className="order-success__number">Order {order.id} · {money(order.total)}</p>}<div><button className="btn btn--dark" onClick={() => onNavigate("tracking")}>Track your order <ArrowIcon /></button><button className="text-action" onClick={() => onNavigate("shop")}>Continue exploring</button></div></main>;
}

export function CollectionsPage() {
  return <main className="commerce-page collections-page"><p className="eyebrow eyebrow--dark">A NOVA point of view</p><h1>Collections</h1><p className="page-lede">Stories told through the things we make and the ways we wear them.</p>{collections.map((item, index) => <a className={`collection-feature ${index % 2 ? "collection-feature--reverse" : ""}`} href={`#/collections/${item.slug}`} key={item.slug}><div><img src={`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=1200&q=85`} alt={`${item.title} collection`} loading="lazy" /></div><section><p className="eyebrow eyebrow--dark">NOVA / EDIT {String(index + 1).padStart(2, "0")}</p><h2>{item.title}</h2><p>{item.story}</p><span className="text-action">Explore collection <ArrowIcon /></span></section></a>)}</main>;
}

export function CollectionDetail({ collection, onQuickView }) {
  const products = collection.slug === "everyday-uniform"
    ? shopProducts.filter((product) => product.bestSeller)
    : collection.slug === "soft-structure"
      ? shopProducts.filter((product) => product.category === "Women")
      : shopProducts.filter((product) => product.featured).slice(0, 6);
  return <main className="collection-detail">
    <section className="collection-detail__hero">
      <img src={`https://images.unsplash.com/${collection.image}?auto=format&fit=crop&w=2000&q=90`} alt={`${collection.title} editorial`} />
      <div><p className="eyebrow">NOVA / COLLECTION</p><h1>{collection.title}</h1><p>{collection.story}</p><a className="btn btn--light" href="#collection-products">Shop the edit <ArrowIcon /></a></div>
    </section>
    <section className="collection-detail__story"><p className="eyebrow eyebrow--dark">A study in getting dressed</p><p>{collection.story} Made for the everyday, and the moments that make it your own.</p></section>
    <section id="collection-products" className="collection-detail__products"><div className="commerce-section-heading"><div><p className="eyebrow eyebrow--dark">The pieces</p><h2>In this collection</h2></div><span>{products.length} considered pieces</span></div><ProductGrid products={products} onQuickView={onQuickView} /></section>
  </main>;
}

export function JournalPage({ articleSlug }) {
  const article = articles.find((item) => item.slug === articleSlug);
  if (article) return <main className="article-page"><img className="article-page__hero" src={`https://images.unsplash.com/${article.image}?auto=format&fit=crop&w=1800&q=90`} alt="" /><article><p className="eyebrow eyebrow--dark">NOVA JOURNAL / {article.category}</p><h1>{article.title}</h1><p className="article-page__intro">{article.summary}</p><p>We believe the best pieces are the ones that become part of your own story. Built around thoughtful materials, quiet proportions, and the freedom to wear something in your own way.</p><p>It is less about having more and more about finding what feels right. A small, considered wardrobe leaves space for the unexpected, and for the everyday moments that give clothes their meaning.</p><a className="text-action" href="#/journal">Back to the journal <ArrowIcon /></a></article></main>;
  return <main className="commerce-page journal-page"><p className="eyebrow eyebrow--dark">Notes on getting dressed</p><h1>The NOVA journal</h1><p className="page-lede">Style, culture, materials, and the stories behind what we make.</p><a href={`#/journal/${articles[0].slug}`} className="journal-feature"><img src={`https://images.unsplash.com/${articles[0].image}?auto=format&fit=crop&w=1600&q=90`} alt="Editorial portrait" /><div><p className="eyebrow">Featured story / {articles[0].category}</p><h2>{articles[0].title}</h2><span className="text-action text-link--light">Read the story <ArrowIcon /></span></div></a><div className="journal-grid">{articles.slice(1).map((item) => <a href={`#/journal/${item.slug}`} key={item.slug}><img src={`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=900&q=85`} alt="" loading="lazy" /><p className="eyebrow eyebrow--dark">{item.category}</p><h2>{item.title}</h2><span>{item.summary}</span></a>)}</div></main>;
}

export function AccountPage({ orders, onNavigate }) {
  const [profile, setProfile] = useState(() => { try { return JSON.parse(localStorage.getItem("nova-profile") || "{}"); } catch { return {}; } });
  const [saved, setSaved] = useState(false);
  const updateProfile = (event) => setProfile({ ...profile, [event.target.name]: event.target.value });
  return <main className="commerce-page account-page"><p className="eyebrow eyebrow--dark">NOVA / YOUR ACCOUNT</p><h1>Your space.</h1><p className="page-lede">A personal place for your details, orders, and pieces on your list.</p><div className="account-layout"><nav aria-label="Account sections"><a href="#account-profile">Profile</a><a href="#account-orders">Orders</a><a href="#/wishlist">Wishlist</a><a href="#account-preferences">Size preferences</a><a href="#account-recent">Recently viewed</a></nav><div className="account-content"><section id="account-profile"><h2>Profile details</h2><label>Name<input name="name" value={profile.name || ""} onChange={updateProfile} placeholder="Your name" /></label><label>Email<input name="email" type="email" value={profile.email || ""} onChange={updateProfile} placeholder="you@example.com" /></label><button className="btn btn--dark" onClick={() => { localStorage.setItem("nova-profile", JSON.stringify(profile)); setSaved(true); }}>Save details</button>{saved && <span className="inline-confirmation" role="status">Details saved on this device.</span>}</section><section id="account-orders"><h2>Recent orders</h2>{orders.length ? orders.slice(0, 3).map((order) => <div className="account-order" key={order.id}><span>{order.id}</span><span>{order.status}</span><button className="text-action" onClick={() => onNavigate("tracking")}>Track</button></div>) : <p className="muted-copy">Your orders will appear here.</p>}</section><section id="account-preferences"><h2>Size preferences</h2><label>Usual top size<select name="size" value={profile.size || "M"} onChange={updateProfile}>{["XS", "S", "M", "L", "XL"].map((size) => <option key={size}>{size}</option>)}</select></label><p className="muted-copy">Saved preferences stay on this device.</p></section><section id="account-recent"><h2>Saved address</h2><p className="muted-copy">Add your shipping details during checkout and review them before placing an order.</p><button className="text-action" onClick={() => onNavigate("checkout")}>Go to checkout <ArrowIcon /></button></section></div></div></main>;
}

export function ContactPage() {
  const [sent, setSent] = useState(false);
  return <main className="commerce-page contact-page"><div><p className="eyebrow eyebrow--dark">We are here to help</p><h1>Get in touch.</h1><p className="page-lede">Questions about a piece, an order, or anything else? Leave us a note.</p><p>Monday to Friday · 9am–5pm<br />hello@nova.example</p></div><form onSubmit={(event) => { event.preventDefault(); setSent(true); }}><label>Your name<input required /></label><label>Email address<input type="email" required /></label><label>What can we help with?<select><option>Order enquiry</option><option>Product question</option><option>Returns</option><option>Something else</option></select></label><label>Your message<textarea rows="5" required /></label><button className="btn btn--dark">Send message <ArrowIcon /></button>{sent && <p className="inline-confirmation" role="status">Your note is ready. We will be in touch soon.</p>}</form></main>;
}

export function EditorialPage({ title, eyebrow, image, copy, onNavigate }) {
  return <main className="editorial-page"><img src={image} alt="NOVA editorial collection" /><section><p className="eyebrow eyebrow--dark">{eyebrow}</p><h1>{title}</h1><p>{copy}</p><button className="btn btn--dark" onClick={() => onNavigate("shop")}>Explore the collection <ArrowIcon /></button></section></main>;
}

const policyCopy = {
  privacy: { title: "Privacy, with care.", eyebrow: "NOVA / PRIVACY", sections: [["What stays on this device", "Your bag, saved pieces, recent views, demo orders, and profile preferences are stored in this browser so the storefront can remember your choices."], ["What you share", "Newsletter and contact forms may send information to the configured NOVA service. Do not enter payment card details in this storefront demo."], ["Your choices", "You can clear locally stored NOVA shopping data through your browser settings. A production privacy notice must identify the operating business, retention periods, and regional rights before launch."]] },
  terms: { title: "A few useful terms.", eyebrow: "NOVA / TERMS", sections: [["Storefront preview", "This storefront is an interactive preview. Checkout creates a local demo order only; no purchase contract or payment is completed."], ["Product information", "Product imagery and catalogue details are illustrative. Availability, pricing, and product specifications must be confirmed against a live store before purchase."], ["Before launch", "Production terms need review for the operating region, consumer rights, liability, and dispute process."]] },
  shipping: { title: "Shipping, simply.", eyebrow: "NOVA / SHIPPING", sections: [["Complimentary shipping", "Orders over $75 qualify for complimentary shipping in this storefront experience."], ["Delivery updates", "Order tracking currently reflects locally saved demo orders. Live carrier events and delivery estimates are not connected yet."], ["Need a hand?", "Reach the NOVA team through the contact page for help with an order."]] },
  returns: { title: "Room to reconsider.", eyebrow: "NOVA / RETURNS", sections: [["Returns", "The storefront currently displays a 30-day return window for eligible items in original condition."], ["How it works", "A live return authorization and refund workflow is not connected in this preview. Contact NOVA before sending an item back."], ["Questions", "The contact page is the best place to start with a return or exchange question."]] },
  cookies: { title: "Your browser, your choice.", eyebrow: "NOVA / COOKIE SETTINGS", sections: [["Essential storage", "Essential browser storage keeps your bag, saved pieces, and checkout preview working."], ["Optional analytics", "Optional analytics are off in this storefront preview."]] },
};

export function PolicyPage({ slug }) {
  const policy = policyCopy[slug] || policyCopy.privacy;
  const [analytics, setAnalytics] = useState(() => {
    try { return localStorage.getItem("nova-analytics") === "on"; } catch { return false; }
  });
  return <main className="commerce-page policy-page"><p className="eyebrow eyebrow--dark">{policy.eyebrow}</p><h1>{policy.title}</h1><p className="page-lede">Clear information, with no surprises.</p><div className="policy-content">{policy.sections.map(([heading, copy]) => <section key={heading}><h2>{heading}</h2><p>{slug === "cookies" && heading === "Optional analytics" ? `Optional analytics are ${analytics ? "on" : "off"} in this storefront preview.` : copy}</p></section>)}{slug === "cookies" && <section className="cookie-setting"><div><h2>Optional analytics</h2><p>Allow anonymous usage measurement.</p></div><label><span className="sr-only">Allow optional analytics</span><input type="checkbox" checked={analytics} onChange={(event) => { setAnalytics(event.target.checked); try { localStorage.setItem("nova-analytics", event.target.checked ? "on" : "off"); } catch { /* Browser storage can be unavailable. */ } }} /></label></section>}</div><a className="text-action" href="#/contact">Questions? Contact NOVA <ArrowIcon /></a></main>;
}

function EmptyState({ title, copy, action, onClick }) {
  return <div className="empty-state"><span className="empty-state__rule" /><h2>{title}</h2><p>{copy}</p>{action && <button className="text-action" onClick={onClick}>{action} <ArrowIcon /></button>}</div>;
}

export { money, collections, articles };