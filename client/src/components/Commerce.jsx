import { useEffect, useMemo, useRef, useState } from "react";

import { useStore } from "../context/StoreContext.jsx";
import { readStoredJson, writeStoredJson } from "../utils/storage.js";
import { useDialogFocus } from "../utils/useDialogFocus.js";
import { BackInStockForm, ProductReviewPanel } from "./CommerceExtras.jsx";
import { isApiConfigured, trackOrder } from "../api/api.js";
import { ArrowIcon, BagIcon, CloseIcon, HeartIcon, PlusIcon, StarIcon, BoxIcon, SearchIcon, PlayIcon } from "./Icons.jsx";

const money = (value) => `$${Number(value || 0).toFixed(2)}`;
function readPreferredSize() {
  const size = readStoredJson("nova-profile", {}).size;
  return ["XS", "S", "M", "L", "XL"].includes(size) ? size : "M";
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

function productBadge(product) {
  if (product.compareAtPrice > product.price) {
    const discount = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
    return `${discount}% OFF`;
  }
  if (product.createdAt) {
    const daysSince = (new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24);
    if (daysSince <= 14) return "New";
  } else if (product.newArrival) {
    return "New";
  }
  if (product.bestSeller) return "Bestseller";
  if (product.trending) return "Trending";
  return "";
}

function resizedImage(source, width) {
  try {
    const url = new URL(source);
    if (url.hostname === "images.unsplash.com") url.searchParams.set("w", String(width));
    return url.toString();
  } catch {
    return source;
  }
}

function ProductCard({ product, onQuickView, variant = "default" }) {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const [selectedColor, setSelectedColor] = useState(product.colors?.length === 1 ? product.colors[0].name : "");
  const [selectedSize, setSelectedSize] = useState(product.sizes?.length === 1 ? product.sizes[0] : "");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const statusTimer = useRef(null);
  const wished = wishlist.includes(product.id);
  const badge = productBadge(product);
  const image = product.images?.[0] || product.image;
  const alternateImage = product.images?.[1] || image;
  const needsSelection = product.sizes?.length > 1 || product.colors?.length > 1;

  useEffect(() => () => window.clearTimeout(statusTimer.current), []);
  useEscape(quickAddOpen, () => setQuickAddOpen(false));

  const addProduct = () => {
    if (!product.stock || !selectedSize || !selectedColor) return;
    addToCart(product, selectedSize, 1, selectedColor);
    setQuickAddOpen(false);
    setAdded(true);
    window.clearTimeout(statusTimer.current);
    statusTimer.current = window.setTimeout(() => setAdded(false), 1600);
  };

  const handleQuickAdd = () => {
    if (!product.stock) return;
    if (!needsSelection) {
      addProduct();
      return;
    }
    setQuickAddOpen((open) => !open);
  };

  return (
    <article className={`store-product-card ${variant === "home" ? "store-product-card--home" : ""}`}>
      <div className="store-product-card__media">
        <a href={`#/product/${product.slug}`} aria-label={`View ${product.name}`}>
          <img className="store-product-card__image" src={resizedImage(image, 720)} srcSet={`${resizedImage(image, 420)} 420w, ${resizedImage(image, 720)} 720w`} sizes={variant === "home" ? "(max-width: 680px) 50vw, 20vw" : "(max-width: 680px) 50vw, (max-width: 980px) 33vw, 25vw"} alt={product.name} loading="lazy" />
          <img className="store-product-card__image store-product-card__image--alt" src={resizedImage(alternateImage, 720)} alt="" loading="lazy" />
        </a>
        {badge && <span className="store-product-card__tag">{badge}</span>}
        <button type="button" className={`store-product-card__heart ${wished ? "is-active" : ""}`} onClick={() => toggleWishlist(product.id)} aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name}`} aria-pressed={wished}>
          <HeartIcon />
        </button>
        <div className="store-product-card__actions">
          <button type="button" className="store-product-card__quick" aria-label={`Quick view ${product.name}`} onClick={() => onQuickView?.({ ...product, initialColor: selectedColor || product.colors?.[0]?.name })}>Quick view</button>
          <button type="button" className="store-product-card__quick-add" aria-label={`Quick add ${product.name}`} onClick={handleQuickAdd} disabled={!product.stock}>{added ? "Added" : product.stock ? "Quick add" : "Sold out"}</button>
        </div>
        {quickAddOpen && <div className="store-product-card__variant-panel" aria-label={`Choose options for ${product.name}`}>
          <div className="store-product-card__variant-head"><span>Choose colour & size</span><button type="button" onClick={() => setQuickAddOpen(false)} aria-label="Close quick add">×</button></div>
          <div className="store-product-card__variant-colors" role="group" aria-label={`Colours for ${product.name}`}>
            {product.colors.map((color) => <button type="button" key={color.name} className={selectedColor === color.name ? "is-selected" : ""} aria-label={color.name} aria-pressed={selectedColor === color.name} title={color.name} style={{ backgroundColor: color.value }} onClick={() => setSelectedColor(color.name)} />)}
          </div>
          <div className="store-product-card__variant-sizes" role="group" aria-label={`Sizes for ${product.name}`}>
            {product.sizes.map((size) => <button type="button" key={size} className={selectedSize === size ? "is-selected" : ""} aria-pressed={selectedSize === size} onClick={() => setSelectedSize(size)}>{size}</button>)}
          </div>
          <button type="button" className="store-product-card__variant-add" onClick={addProduct} disabled={!selectedColor || !selectedSize}>Add to bag</button>
        </div>}
      </div>
      <div className="store-product-card__details">
        <div className="store-product-card__line">
          <a className="store-product-card__name" href={`#/product/${product.slug}`}>{product.name}</a>
          <span className="store-product-card__price">{money(product.price)}{product.compareAtPrice > product.price && <del>{money(product.compareAtPrice)}</del>}</span>
        </div>
        <div className="store-product-card__meta">
          <span>{product.stock > 0 ? `${product.colors.length} ${product.colors.length === 1 ? "colour" : "colours"}` : "Out of stock"}</span>
          {added && <span className="store-product-card__confirmation" role="status">Added to bag</span>}
        </div>
        <div className="store-product-card__swatches" role="group" aria-label={`Available colours for ${product.name}`}>
          {product.colors.map((color) => <button type="button" key={color.name} className={selectedColor === color.name ? "is-selected" : ""} aria-label={color.name} aria-pressed={selectedColor === color.name} title={color.name} style={{ backgroundColor: color.value }} onClick={() => setSelectedColor(color.name)} />)}
        </div>
      </div>
    </article>
  );
}

function ProductSkeleton({ variant }) {
  return (
    <article className={`store-product-card store-product-skeleton ${variant === "home" ? "store-product-card--home" : ""}`}>
      <div className="store-product-card__media skeleton-box" />
      <div className="store-product-card__details">
        <div className="store-product-card__line">
          <div className="skeleton-line" style={{ width: "70%" }} />
          <div className="skeleton-line" style={{ width: "20%" }} />
        </div>
        <div className="store-product-card__meta">
          <div className="skeleton-line" style={{ width: "40%" }} />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, loading, skeletonCount = 5, onQuickView, variant = "default" }) {
  if (loading) {
    return <div className={`store-product-grid ${variant === "home" ? "product-grid--home" : ""}`}>{Array.from({ length: skeletonCount }).map((_, i) => <ProductSkeleton key={i} variant={variant} />)}</div>;
  }
  return <div className={`store-product-grid ${variant === "home" ? "product-grid--home" : ""}`}>{products.map((product) => <ProductCard key={product.id} product={product} onQuickView={onQuickView} variant={variant} />)}</div>;
}

function ShopFilters({ filters, setFilters, productList }) {
  const categoriesList = ["All", ...new Set(productList.map((product) => product.category))];
  if (productList.some((product) => product.compareAtPrice > product.price)) categoriesList.push("Sale");
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
      <label>Rating<select value={filters.rating} onChange={(event) => setFilters({ ...filters, rating: event.target.value })}><option value="All">Any rating</option><option value="4">4+ stars</option><option value="4.5">4.5+ stars</option></select></label>
      <label className="shop-filters__check"><input type="checkbox" checked={filters.available} onChange={(event) => setFilters({ ...filters, available: event.target.checked })} /> In stock</label>
    </div>
  );
}

function slugifyFilter(value) {
  return String(value).trim().toLowerCase().replace(/\s+/g, "-");
}

function readListingFilters(queryString, category, productList) {
  const params = new URLSearchParams(queryString);
  const matchOption = (key, options, fallback = "All") => {
    const value = params.get(key);
    return options.find((option) => slugifyFilter(option) === value) || fallback;
  };
  const categoriesList = ["All", ...new Set(productList.map((product) => product.category))];
  if (productList.some((product) => product.compareAtPrice > product.price)) categoriesList.push("Sale");
  const rating = params.get("rating");
  return {
    category: category === "Sale" ? "Sale" : matchOption("category", categoriesList, "All"),
    size: matchOption("size", [...new Set(productList.flatMap((product) => product.sizes))]),
    color: matchOption("color", [...new Set(productList.flatMap((product) => product.colors.map((color) => color.name)))]),
    price: ["under60", "60to100", "over100"].includes(params.get("price")) ? params.get("price") : "All",
    fit: matchOption("fit", [...new Set(productList.map((product) => product.fit))]),
    material: matchOption("material", [...new Set(productList.map((product) => product.material))]),
    available: params.get("available") === "true",
    rating: ["4", "4.5"].includes(rating) ? rating : "All",
  };
}

function writeListingUrl(routePath, queryString, filters, sortBy) {
  const params = new URLSearchParams(queryString);
  let nextPath = routePath;
  if (routePath === "sale" && filters.category !== "Sale") nextPath = "shop";
  if (routePath === "shop" && filters.category === "Sale") nextPath = "sale";

  const categoryIsImplicit = (nextPath === "sale" && filters.category === "Sale") || filters.category === "All";
  if (categoryIsImplicit) params.delete("category");
  else params.set("category", slugifyFilter(filters.category));

  for (const key of ["size", "color", "price", "fit", "material"]) {
    const value = filters[key];
    if (!value || value === "All") params.delete(key);
    else params.set(key, slugifyFilter(value));
  }
  if (filters.available) params.set("available", "true");
  else params.delete("available");
  if (filters.rating && filters.rating !== "All") params.set("rating", filters.rating);
  else params.delete("rating");
  if (sortBy && sortBy !== "featured") params.set("sort", sortBy);
  else params.delete("sort");

  const query = params.toString();
  const nextHash = `#/${nextPath}${query ? `?${query}` : ""}`;
  if (window.location.hash !== nextHash) window.location.hash = nextHash.slice(1);
}

function filterAndSortProducts(productList, filters, sort, query = "", edit = "") {
  const normalizedQuery = query.trim().toLowerCase();
  let result = productList.filter((product) => {
    const searchable = [product.name, product.category, product.subcategory, product.tags?.join(" "), product.material, product.fit, product.description, product.colors?.map((color) => color.name).join(" ")].join(" ").toLowerCase();
    if (normalizedQuery && !searchable.includes(normalizedQuery)) return false;
    if (edit === "new-arrivals" && !product.newArrival) return false;
    if (edit === "best-sellers" && !product.bestSeller) return false;
    if (edit === "trending" && !product.trending) return false;
    if (filters.category !== "All" && filters.category !== "Sale" && product.category !== filters.category) return false;
    if (filters.category === "Sale" && !(product.compareAtPrice > product.price)) return false;
    if (filters.size !== "All" && !product.sizes.includes(filters.size)) return false;
    if (filters.color !== "All" && !product.colors.some((color) => color.name === filters.color)) return false;
    if (filters.fit !== "All" && product.fit !== filters.fit) return false;
    if (filters.material !== "All" && product.material !== filters.material) return false;
    if (filters.available && product.stock < 1) return false;
    if (filters.rating !== "All" && Number(product.rating) < Number(filters.rating)) return false;
    if (filters.price === "under60" && product.price >= 60) return false;
    if (filters.price === "60to100" && (product.price < 60 || product.price > 100)) return false;
    if (filters.price === "over100" && product.price <= 100) return false;
    return true;
  });

  if (sort === "price-low") result = [...result].sort((a, b) => a.price - b.price);
  if (sort === "price-high") result = [...result].sort((a, b) => b.price - a.price);
  if (sort === "newest") result = [...result].sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
  if (sort === "popular") result = [...result].sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller));
  if (sort === "trending") result = [...result].sort((a, b) => Number(b.trending) - Number(a.trending));
  if (sort === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
  return result;
}

function filterLabel(key, value) {
  if (key === "category") return value === "Sale" ? "Sale" : value;
  if (key === "size") return `Size ${value}`;
  if (key === "color") return value;
  if (key === "price") return ({ under60: "Under $60", "60to100": "$60–$100", over100: "Over $100" })[value] || value;
  if (key === "fit") return value;
  if (key === "material") return value;
  if (key === "available") return "In stock";
  if (key === "rating") return `${value}+ stars`;
  return value;
}

function ActiveFilterChips({ filters, onRemove, onClear }) {
  const active = Object.entries(filters).filter(([key, value]) => key === "available" ? value : value !== "All");
  if (!active.length) return null;
  return <div className="shop-active-filters" aria-label="Active filters">{active.map(([key, value]) => <button type="button" key={key} onClick={() => onRemove(key)} aria-label={`Remove ${filterLabel(key, value)} filter`}>{filterLabel(key, value)} <span aria-hidden="true">×</span></button>)}<button type="button" className="shop-active-filters__clear" onClick={onClear}>Clear all</button></div>;
}

function ListingFilterSheet({ open, onClose, filters, setFilters, productList, sort, setSort, resultCount, onClear }) {
  const dialogRef = useDialogFocus(open, onClose);
  useEffect(() => {
    document.body.classList.toggle("shop-filter-open", open);
    return () => document.body.classList.remove("shop-filter-open");
  }, [open]);
  if (!open) return null;
  return <div className="sheet-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section ref={dialogRef} className="filter-sheet" role="dialog" aria-modal="true" aria-label="Filter and sort products" tabIndex={-1}>
    <div className="overlay-heading"><div><p className="eyebrow eyebrow--dark">Refine</p><h2>Filter & sort</h2></div><button type="button" className="icon-close" onClick={onClose} aria-label="Close filters"><CloseIcon /></button></div>
    <label className="filter-sheet__sort">Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}>{sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <ShopFilters filters={filters} setFilters={setFilters} productList={productList} />
    <div className="filter-sheet__actions"><button type="button" className="text-action" onClick={onClear}>Clear all</button><button type="button" className="btn btn--dark filter-sheet__apply" onClick={onClose}>Show {resultCount} {resultCount === 1 ? "piece" : "pieces"}</button></div>
  </section></div>;
}

const sortOptions = [["featured", "Featured"], ["newest", "New arrivals"], ["popular", "Best sellers"], ["trending", "Trending"], ["rating", "Best rated"], ["price-low", "Price: low to high"], ["price-high", "Price: high to low"]];

export function ShopPage({ category = "All", query = "", sortBy = "featured", routePath = "shop", queryString = "", onQuickView }) {
  const { products: storeProducts = [], productsLoading } = useStore();
  const filters = useMemo(() => readListingFilters(queryString, category, storeProducts), [queryString, category, storeProducts]);
  const currentParams = new URLSearchParams(queryString);
  const edit = ["new-arrivals", "best-sellers", "trending"].includes(currentParams.get("edit")) ? currentParams.get("edit") : "";
  const requestedSort = currentParams.get("sort") || sortBy;
  const sort = sortOptions.some(([value]) => value === requestedSort) ? requestedSort : "featured";
  const [filterSheet, setFilterSheet] = useState(false);
  useEscape(filterSheet, () => setFilterSheet(false));
  const updateFilters = (nextFilters) => writeListingUrl(routePath, queryString, nextFilters, sort);
  const updateSort = (nextSort) => writeListingUrl(routePath, queryString, filters, nextSort);
  const products = useMemo(() => filterAndSortProducts(storeProducts, filters, sort, query, edit), [filters, query, sort, edit]);
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => key === "available" ? value : value !== "All").length;
  const clearCategory = routePath === "sale" ? "Sale" : "All";
  const clearFilters = () => updateFilters({ category: clearCategory, size: "All", color: "All", price: "All", fit: "All", material: "All", available: false, rating: "All" });
  const removeFilter = (key) => updateFilters({ ...filters, [key]: key === "category" ? clearCategory : key === "available" ? false : "All" });
  const title = query ? `Search results for “${query}”` : filters.category === "Sale" ? "The Sale Edit" : filters.category !== "All" ? `${filters.category}, in NOVA` : edit === "new-arrivals" ? "New Arrivals" : edit === "best-sellers" ? "Best Sellers" : edit === "trending" ? "Trending Now" : "All Products";
  const description = query ? "A considered selection from the NOVA collection." : filters.category === "Sale" ? "Lasting pieces, considered at a new price." : edit === "new-arrivals" ? "The latest pieces from NOVA, designed for everyday movement." : edit === "best-sellers" ? "The pieces our community returns to, selected from the NOVA edit." : edit === "trending" ? "Pieces carrying the NOVA point of view right now." : filters.category === "All" ? "Thoughtful layers, useful details, and pieces that earn their place in your everyday." : `Discover considered ${filters.category.toLowerCase()} pieces, designed to stay in rotation.`;
  return (
    <main className="commerce-page shop-page">
      <div className="shop-page__intro">
        <p className="eyebrow eyebrow--dark">{query ? "NOVA / SEARCH" : filters.category === "All" ? "Designed to stay in rotation" : `NOVA / ${filters.category.toUpperCase()}`}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="shop-toolbar">
        <span>{products.length} {products.length === 1 ? "product" : "products"}</span>
        <div className="shop-toolbar__actions">
          <button type="button" className="text-action shop-mobile-filter" onClick={() => setFilterSheet(true)}>Filter{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ""}</button>
          <label className="shop-sort">Sort by<select value={sort} onChange={(event) => updateSort(event.target.value)}>{sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        </div>
      </div>
      <ActiveFilterChips filters={filters} onRemove={removeFilter} onClear={clearFilters} />
      <div className="shop-filters shop-desktop-filter"><ShopFilters filters={filters} setFilters={updateFilters} productList={storeProducts} /></div>
      {productsLoading || products.length ? <ProductGrid products={products} loading={productsLoading} skeletonCount={8} onQuickView={onQuickView} /> : <div className="shop-empty-state"><EmptyState icon={SearchIcon} title="No products found" copy="Try adjusting your filters or exploring another collection." action="Clear filters" onClick={clearFilters} /><a className="text-action" href="#/shop?edit=new-arrivals">Explore New Arrivals <ArrowIcon /></a></div>}
      <ListingFilterSheet open={filterSheet} onClose={() => setFilterSheet(false)} filters={filters} setFilters={updateFilters} productList={storeProducts} sort={sort} setSort={updateSort} resultCount={products.length} onClear={clearFilters} />
    </main>
  );
}

export function ProductPage({ product, onQuickView, onFindSize, onBuyNow, onOpenCart, recommendedSize }) {
  const { wishlist, toggleWishlist, recentlyViewed, recordView, addToCart, products: storeProducts = [], productsLoading } = useStore();
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
  const matching = storeProducts.filter((item) => ["p3", "p5", "p6"].includes(item.id) && item.id !== product.id).slice(0, 3);
  const recently = recentlyViewed.map((id) => storeProducts.find((item) => item.id === id)).filter((item) => item && item.id !== product.id).slice(0, 4);
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
      <section className="look-complete"><div className="commerce-section-heading"><div><p className="eyebrow eyebrow--dark">Considered together</p><h2>Complete the look</h2></div><button className="btn btn--dark" onClick={() => { matching.forEach((item) => addToCart(item, item.sizes[0])); onOpenCart(); }}>Add all to bag <ArrowIcon /></button></div><ProductGrid products={matching} loading={productsLoading} skeletonCount={3} onQuickView={onQuickView} /></section>
      <ProductReviewPanel product={product} />
      {productsLoading || recently.length > 0 ? <section className="look-complete"><div className="commerce-section-heading"><div><p className="eyebrow eyebrow--dark">A second look</p><h2>Recently viewed</h2></div></div><ProductGrid products={recently} loading={productsLoading} skeletonCount={4} onQuickView={onQuickView} /></section> : null}
    </main>
  );
}

export function QuickView({ product, onClose, onAdd, onNotify, recommendedSize }) {
  const { wishlist, toggleWishlist } = useStore();
  const dialogRef = useDialogFocus(true, onClose);
  const preferredSize = readPreferredSize();
  const [size, setSize] = useState(product.sizes?.includes(preferredSize) ? preferredSize : product.sizes?.[0] || "M");
  const [imageIndex, setImageIndex] = useState(0);
  const [colorName, setColorName] = useState(product.colors?.some((color) => color.name === product.initialColor) ? product.initialColor : product.colors?.[0]?.name || "");
  const [quantity, setQuantity] = useState(1);
  useEffect(() => { if (recommendedSize && product.sizes.includes(recommendedSize)) setSize(recommendedSize); }, [product.id, product.sizes, recommendedSize]);
  const isWished = wishlist.includes(product.id);
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section ref={dialogRef} className="quick-view" role="dialog" aria-modal="true" aria-label={`Quick view: ${product.name}`} tabIndex={-1}>
        <button className="icon-close quick-view__close" onClick={onClose} aria-label="Close quick view"><CloseIcon /></button>
        <div className="quick-view__media"><img src={product.images[imageIndex]} alt={product.name} />{product.images.length > 1 && <div className="quick-view__image-controls">{product.images.map((src, index) => <button key={src} className={imageIndex === index ? "is-selected" : ""} onClick={() => setImageIndex(index)} aria-label={`View image ${index + 1}`} />)}</div>}</div>
        <div className="quick-view__content">
          <p className="eyebrow eyebrow--dark">{product.category} / {product.subcategory}</p>
          <h2>{product.name}</h2>
          <div className="quick-view__rating"><span>{product.rating.toFixed(1)}</span><StarIcon /><small>{product.reviews} reviews</small></div>
          <p className="product-info__price">{money(product.price)}</p>
          <p className="quick-view__stock">{product.stock > 0 ? "In stock and ready to ship" : "Currently unavailable"}</p>
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
  const { cart, updateQuantity, products: storeProducts = [] } = useStore();
  const dialogRef = useDialogFocus(open, onClose);
  const items = cart.map((line) => ({ ...line, product: storeProducts.find((product) => product.id === line.id) })).filter((line) => line.product);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const remaining = Math.max(0, 75 - subtotal);
  if (!open) return null;
  return (
    <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside ref={dialogRef} className="cart-drawer" role="dialog" aria-modal="true" aria-label="Your bag" tabIndex={-1}>
        <div className="cart-drawer__head"><div><p className="eyebrow eyebrow--dark">NOVA / 01</p><h2>Your bag <span>({items.reduce((sum, item) => sum + item.quantity, 0)})</span></h2></div><button className="icon-close" onClick={onClose} aria-label="Close bag"><CloseIcon /></button></div>
        {items.length ? <>
          <div className="shipping-progress"><p>{remaining ? `${money(remaining)} away from complimentary shipping` : "Complimentary shipping unlocked"}</p><span><i style={{ width: `${Math.min(100, (subtotal / 75) * 100)}%` }} /></span></div>
          <div className="cart-drawer__items">{items.map(({ product, size, color, quantity }) => <CartLine key={`${product.id}-${size}-${color}`} product={product} size={size} color={color} quantity={quantity} onQuantity={(next) => updateQuantity(product.id, size, next, color)} compact />)}</div>
          <div className="cart-drawer__bottom"><div className="cart-subtotal"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><p>Shipping and taxes calculated at checkout.</p><button className="btn btn--dark cart-checkout" onClick={() => { onClose(); onNavigate("checkout"); }}>Continue to checkout <ArrowIcon /></button><button className="text-action cart-view" onClick={() => { onClose(); onNavigate("cart"); }}>View bag</button></div>
        </> : <EmptyState icon={BagIcon} title="Your bag is at rest" copy="Discover pieces made to move with you." action="Explore the collection" onClick={() => { onClose(); onNavigate("shop"); }} />}
      </aside>
    </div>
  );
}

function CartLine({ product, size, color = product.colors[0].name, quantity, onQuantity, compact = false }) {
  return <article className={`cart-line ${compact ? "cart-line--compact" : ""}`}><a href={`#/product/${product.slug}`} className="cart-line__image"><img src={product.images[0]} alt={product.name} /></a><div className="cart-line__details"><a href={`#/product/${product.slug}`} className="cart-line__name">{product.name}</a><p>Size {size} · {color}</p><div className="cart-line__bottom"><div className="quantity-control"><button onClick={() => onQuantity(quantity - 1)} aria-label={`Decrease ${product.name} quantity`}>−</button><output>{quantity}</output><button onClick={() => onQuantity(quantity + 1)} aria-label={`Increase ${product.name} quantity`}>+</button></div><strong>{money(product.price * quantity)}</strong></div></div></article>;
}

export function CartPage({ onNavigate }) {
  const { cart, updateQuantity, products: storeProducts = [] } = useStore();
  const items = cart.map((line) => ({ ...line, product: storeProducts.find((product) => product.id === line.id) })).filter((line) => line.product);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return <main className="commerce-page cart-page"><p className="eyebrow eyebrow--dark">NOVA / 01</p><h1>Your bag</h1>{items.length ? <div className="cart-page__layout"><section>{items.map(({ product, size, color, quantity }) => <div className="cart-page__line" key={`${product.id}-${size}-${color}`}><CartLine product={product} size={size} color={color} quantity={quantity} onQuantity={(next) => updateQuantity(product.id, size, next, color)} /><button className="text-action" onClick={() => updateQuantity(product.id, size, 0, color)}>Remove</button></div>)}</section><aside className="cart-summary"><p className="eyebrow eyebrow--dark">Order summary</p><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Shipping</span><span>{subtotal >= 75 ? "Complimentary" : "Calculated at checkout"}</span></div><button className="btn btn--dark" onClick={() => onNavigate("checkout")}>Continue to checkout <ArrowIcon /></button><a href="#/shop" className="text-action">Continue shopping</a></aside></div> : <EmptyState icon={BagIcon} title="Nothing in your bag yet." copy="Discover pieces worth keeping." action="Explore new arrivals" onClick={() => onNavigate("shop?edit=new-arrivals")} />}</main>;
}

export function WishlistPage({ onQuickView, onNavigate }) {
  const { wishlist, toggleWishlist, addToCart, products: storeProducts = [] } = useStore();
  const items = wishlist.map((id) => storeProducts.find((product) => product.id === id)).filter(Boolean);
  return <main className="commerce-page wishlist-page"><p className="eyebrow eyebrow--dark">A personal edit</p><h1>Saved pieces</h1>{items.length ? <div className="wishlist-grid">{items.map((product) => <article className="wishlist-item" key={product.id}><ProductCard product={product} onQuickView={onQuickView} /><div className="wishlist-item__actions"><button className="btn btn--dark" onClick={() => { addToCart(product, product.sizes[0]); toggleWishlist(product.id); }}>Move to bag</button><button className="text-action" onClick={() => toggleWishlist(product.id)}>Remove</button></div></article>)}</div> : <EmptyState icon={HeartIcon} title="Nothing saved yet." copy="Discover pieces worth keeping." action="Explore new arrivals" onClick={() => onNavigate("shop?edit=new-arrivals")} />}</main>;
}

export function SearchOverlay({ open, initialQuery = "", onClose, onSubmit }) {
  const { products: storeProducts = [] } = useStore();
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery.trim());
  const [recent, setRecent] = useState(() => readStoredJson("nova-searches", []));
  const [isDebouncing, setIsDebouncing] = useState(false);
  const inputRef = useRef(null);
  const dialogRef = useDialogFocus(open, onClose, inputRef);

  useEffect(() => {
    if (open) setQuery(initialQuery);
  }, [open, initialQuery]);
  useEffect(() => {
    const nextQuery = query.trim();
    if (nextQuery === debouncedQuery) {
      setIsDebouncing(false);
      return undefined;
    }
    setIsDebouncing(true);
    const timer = window.setTimeout(() => {
      setDebouncedQuery(nextQuery);
      setIsDebouncing(false);
    }, 140);
    return () => window.clearTimeout(timer);
  }, [query, debouncedQuery]);

  if (!open) return null;
  const normalized = debouncedQuery.toLowerCase();
  const foundProducts = normalized ? storeProducts.filter((product) => `${product.name} ${product.category} ${product.subcategory} ${product.tags.join(" ")} ${product.material}`.toLowerCase().includes(normalized)).slice(0, 5) : [];
  const foundCollections = normalized ? collections.filter((item) => `${item.title} ${item.story}`.toLowerCase().includes(normalized)) : [];
  const foundArticles = normalized ? articles.filter((item) => `${item.title} ${item.category} ${item.summary}`.toLowerCase().includes(normalized)) : [];
  const hasResults = foundProducts.length + foundCollections.length + foundArticles.length > 0;
  const saveSearch = (value) => {
    const next = [value, ...recent.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, 5);
    setRecent(next);
    writeStoredJson("nova-searches", next);
  };
  const submitSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    saveSearch(value);
    onSubmit?.(value);
  };
  const searchFor = (value) => {
    setQuery(value);
    setDebouncedQuery(value.trim());
  };

  return (
    <div className="search-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section ref={dialogRef} className="search-overlay__dialog" role="dialog" aria-modal="true" aria-label="Search NOVA" tabIndex={-1}>
        <div className="search-overlay__top">
          <a className="navbar__logo" href="#/" onClick={onClose}>NOVA</a>
          <button type="button" className="icon-close" onClick={onClose} aria-label="Close search"><CloseIcon /></button>
        </div>
        <form className="search-overlay__form" onSubmit={submitSearch} role="search">
          <label className="sr-only" htmlFor="store-search">Search products, collections and stories</label>
          <input ref={inputRef} id="store-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, collections & stories..." autoComplete="off" />
          {query && <button type="button" className="search-overlay__clear" aria-label="Clear search" onClick={() => { searchFor(""); inputRef.current?.focus(); }}>Clear</button>}
          <button type="submit" aria-label="Submit search" disabled={!query.trim()}><ArrowIcon /></button>
        </form>
        <div className="search-overlay__results" aria-live="polite" aria-busy={isDebouncing}>
          {isDebouncing ? <p className="search-overlay__loading">Searching the NOVA edit...</p> : !normalized ? (
            <div className="search-suggestions">
              <section>
                <p className="eyebrow eyebrow--dark">Recent searches</p>
                {recent.length ? recent.map((item) => <button type="button" key={item} onClick={() => searchFor(item)}>{item}</button>) : <p className="muted-copy">Your recent searches will appear here.</p>}
              </section>
              <section>
                <p className="eyebrow eyebrow--dark">Popular searches</p>
                {["Sweatshirts", "Outerwear", "Accessories"].map((item) => <button type="button" key={item} onClick={() => searchFor(item)}>{item}</button>)}
              </section>
            </div>
          ) : hasResults ? (
            <>
              {foundProducts.length > 0 && <SearchGroup title="Products">{foundProducts.map((product) => <a key={product.id} href={`#/product/${product.slug}`} onClick={() => { saveSearch(query.trim()); onClose(); }}><img src={product.images[0]} alt="" loading="lazy" /><span>{product.name}<small>{money(product.price)}</small></span></a>)}</SearchGroup>}
              {foundCollections.length > 0 && <SearchGroup title="Collections">{foundCollections.map((item) => <a key={item.slug} href={`#/collections/${item.slug}`} onClick={() => { saveSearch(query.trim()); onClose(); }}>{item.title}<ArrowIcon /></a>)}</SearchGroup>}
              {foundArticles.length > 0 && <SearchGroup title="Journal">{foundArticles.map((item) => <a key={item.slug} href={`#/journal/${item.slug}`} onClick={() => { saveSearch(query.trim()); onClose(); }}>{item.title}<ArrowIcon /></a>)}</SearchGroup>}
            </>
          ) : (
            <div className="search-no-results">
              <p className="eyebrow eyebrow--dark">No results</p>
              <h2>We couldn't find what you're looking for.</h2>
              <p className="muted-copy">Try another term, or explore a category.</p>
              <div>{[["New arrivals", "shop?sort=newest"], ["Women", "shop?category=Women"], ["Men", "shop?category=Men"], ["Accessories", "shop?category=Accessories"]].map(([label, path]) => <a key={label} href={`#/${path}`} onClick={onClose}>{label}<ArrowIcon /></a>)}</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
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
  const { addToCart, products } = useStore();
  useEscape(open, onClose);
  
  const [sizes, setSizes] = useState({});
  
  useEffect(() => {
    if (products && products.length >= 8) {
      const lookItems = [products[0], products[2], products[5], products[7]];
      setSizes(Object.fromEntries(lookItems.map((item) => [item.id, item.sizes[0]])));
    }
  }, [products]);

  if (!products || products.length < 8) return null;
  if (!open) return null;

  const lookItems = [products[0], products[2], products[5], products[7]];
  const addAll = () => { lookItems.forEach((item) => addToCart(item, sizes[item.id] || item.sizes[0])); onClose(); onOpenCart(); };
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="look-modal" role="dialog" aria-modal="true" aria-label="Shop the look"><button className="icon-close look-modal__close" onClick={onClose} aria-label="Close look"><CloseIcon /></button><div className="look-modal__image"><img src={products[0].images[1]} alt="NOVA layered winter look" /><span>Winter '26 / Look 04</span></div><div className="look-modal__content"><p className="eyebrow eyebrow--dark">The complete edit</p><h2>Shop this look</h2><p className="muted-copy">Four considered pieces, worn together or your own way.</p><div className="look-modal__items">{lookItems.map((product) => <article key={product.id}><img src={product.images[0]} alt={product.name} /><div><a href={`#/product/${product.slug}`} onClick={onClose}>{product.name}</a><span>{money(product.price)}</span><select aria-label={`Size for ${product.name}`} value={sizes[product.id] || product.sizes[0]} onChange={(event) => setSizes({ ...sizes, [product.id]: event.target.value })}>{product.sizes.map((size) => <option key={size}>{size}</option>)}</select></div><button className="look-modal__add" onClick={() => addToCart(product, sizes[product.id] || product.sizes[0])} aria-label={`Add ${product.name} to bag`}><PlusIcon /></button></article>)}</div><button className="btn btn--dark" onClick={addAll}>Add entire look · {money(lookItems.reduce((sum, item) => sum + item.price, 0))} <ArrowIcon /></button></div></section></div>;
}

function LegacyCheckoutPage({ onPlaceOrder }) {
  const { cart, products: storeProducts = [] } = useStore();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", state: "", postal: "", payment: "Cash on delivery" });
  const lines = cart.map((line) => ({ ...line, product: storeProducts.find((product) => product.id === line.id) })).filter((line) => line.product);
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

export function CollectionDetail({ collection, routePath, queryString = "", onQuickView }) {
  const { products: storeProducts = [], productsLoading } = useStore();
  const products = collection.slug === "everyday-uniform"
    ? storeProducts.filter((product) => product.bestSeller)
    : collection.slug === "soft-structure"
      ? storeProducts.filter((product) => product.category === "Women")
      : storeProducts.filter((product) => product.featured).slice(0, 6);
  const filters = useMemo(() => readListingFilters(queryString, "All", products), [queryString, products]);
  const currentParams = new URLSearchParams(queryString);
  const requestedSort = currentParams.get("sort") || "featured";
  const sort = sortOptions.some(([value]) => value === requestedSort) ? requestedSort : "featured";
  const [filterSheet, setFilterSheet] = useState(false);
  useEscape(filterSheet, () => setFilterSheet(false));
  const updateFilters = (nextFilters) => writeListingUrl(routePath, queryString, nextFilters, sort);
  const updateSort = (nextSort) => writeListingUrl(routePath, queryString, filters, nextSort);
  const filteredProducts = useMemo(() => filterAndSortProducts(products, filters, sort), [products, filters, sort]);
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => key === "available" ? value : value !== "All").length;
  const clearFilters = () => updateFilters({ category: "All", size: "All", color: "All", price: "All", fit: "All", material: "All", available: false, rating: "All" });
  const removeFilter = (key) => updateFilters({ ...filters, [key]: key === "available" ? false : "All" });
  return <main className="collection-detail">
    <section className="collection-detail__hero">
      <img src={`https://images.unsplash.com/${collection.image}?auto=format&fit=crop&w=2000&q=90`} alt={`${collection.title} editorial`} />
      <div><p className="eyebrow">NOVA / COLLECTION</p><h1>{collection.title}</h1><p>{collection.story}</p><a className="btn btn--light" href="#collection-products">Shop the edit <ArrowIcon /></a></div>
    </section>
    <section className="collection-detail__story"><p className="eyebrow eyebrow--dark">A study in getting dressed</p><p>{collection.story} Made for the everyday, and the moments that make it your own.</p></section>
    <section id="collection-products" className="collection-detail__products"><div className="commerce-section-heading"><div><p className="eyebrow eyebrow--dark">The pieces</p><h2>In this collection</h2></div><span>{filteredProducts.length} {filteredProducts.length === 1 ? "piece" : "pieces"}</span></div>
      <div className="shop-toolbar"><span>{filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}</span><div className="shop-toolbar__actions"><button type="button" className="text-action shop-mobile-filter" onClick={() => setFilterSheet(true)}>Filter{activeFilterCount ? ` · ${activeFilterCount}` : ""}</button><label className="shop-sort">Sort by<select value={sort} onChange={(event) => updateSort(event.target.value)}>{sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div></div>
      <ActiveFilterChips filters={filters} onRemove={removeFilter} onClear={clearFilters} />
      <div className="shop-filters shop-desktop-filter"><ShopFilters filters={filters} setFilters={updateFilters} productList={products} /></div>
      {productsLoading || filteredProducts.length ? <ProductGrid products={filteredProducts} loading={productsLoading} skeletonCount={4} onQuickView={onQuickView} /> : <div className="shop-empty-state"><EmptyState icon={SearchIcon} title="No products found" copy="Try adjusting the filters or exploring another edit." action="Clear filters" onClick={clearFilters} /></div>}
      <ListingFilterSheet open={filterSheet} onClose={() => setFilterSheet(false)} filters={filters} setFilters={updateFilters} productList={products} sort={sort} setSort={updateSort} resultCount={filteredProducts.length} onClear={clearFilters} />
    </section>
  </main>;
}

export function JournalPage({ articleSlug }) {
  const article = articles.find((item) => item.slug === articleSlug);
  if (article) return <main className="article-page"><img className="article-page__hero" src={`https://images.unsplash.com/${article.image}?auto=format&fit=crop&w=1800&q=90`} alt="" /><article><p className="eyebrow eyebrow--dark">NOVA JOURNAL / {article.category}</p><h1>{article.title}</h1><p className="article-page__intro">{article.summary}</p><p>We believe the best pieces are the ones that become part of your own story. Built around thoughtful materials, quiet proportions, and the freedom to wear something in your own way.</p><p>It is less about having more and more about finding what feels right. A small, considered wardrobe leaves space for the unexpected, and for the everyday moments that give clothes their meaning.</p><a className="text-action" href="#/journal">Back to the journal <ArrowIcon /></a></article></main>;

  const categories = [
    { label: "All Articles", count: 24 },
    { label: "Style & Trends", count: 6 },
    { label: "Sustainability", count: 5 },
    { label: "Lifestyle", count: 4 },
    { label: "Culture", count: 3 },
    { label: "Behind the Brand", count: 3 },
    { label: "Collaborations", count: 2 },
    { label: "Guides", count: 1 },
  ];

  const latestArticles = [
    { title: "The Future of Sustainable Fashion", date: "APR 22, 2025", image: "photo-1524504388940-b1c1722653e1" },
    { title: "Why Quality Always Wins", date: "APR 18, 2025", image: "photo-1507679799987-c73779587ccf" },
    { title: "5 Essentials for Every Wardrobe", date: "APR 12, 2025", image: "photo-1515886657613-9f3515b0c78f" },
    { title: "Travel, Explore, Be Inspired", date: "APR 08, 2025", image: "photo-1529139574466-a303027c1d8b" },
  ];

  const articleCards = [
    { category: "Style & Trends", title: "The Rise of Minimal Streetwear", summary: "How simplicity, function, and culture are shaping the next wave of fashion.", image: "photo-1524504388940-b1c1722653e1", date: "APR 18, 2025" },
    { category: "Culture", title: "Inside NOVA: The People, Process & Purpose", summary: "A closer look at the minds, materials, and methods behind the brand.", image: "photo-1548126032-079a0fb0099d", date: "APR 15, 2025" },
    { category: "Lifestyle", title: "Slow Living, Better Living", summary: "Small changes, less noise, and more intention in the way we dress.", image: "photo-1521572163474-6864f9cf17ab", date: "APR 10, 2025" },
  ];

  return (
    <main className="journal-page">
      <section className="journal-hero" aria-label="NOVA Journal hero section">
        <div className="journal-hero__inner">
          <div className="journal-hero__copy">
            <p className="eyebrow eyebrow--light">THE NOVA JOURNAL</p>
            <h1 className="journal-hero__title">Ideas. Style.<br />A Better Tomorrow.</h1>
            <p className="journal-hero__lede">Thoughts, stories, and inspiration from the world of modern fashion, sustainability, culture and beyond. Welcome to the NOVA Journal.</p>
            <div className="journal-hero__actions">
              <a href="#/journal" className="journal-hero__cta">EXPLORE ALL ARTICLES <ArrowIcon /></a>
            </div>
          </div>

          <div className="journal-hero__image-wrap">
            <img
              src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1500&q=90"
              alt="Editorial portrait of a NOVA model"
              loading="eager"
            />
          </div>

          <ul className="journal-hero__meta" aria-label="Journal topics">
            <li>Style</li>
            <li>Sustainability</li>
            <li>Culture</li>
            <li>Trends</li>
          </ul>
        </div>
      </section>

      <section className="journal-content" aria-label="Journal editorial content">
        <div className="journal-content__layout">
          <aside className="journal-categories">
            <p className="journal-section-label">CATEGORIES</p>
            <ul>
              {categories.map((item, index) => (
                <li key={item.label} className={index === 0 ? "is-active" : ""}>
                  <button type="button" className="journal-category-link">
                    <span>{item.label}</span>
                    <span>{item.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="journal-main-column">
            <article className="journal-featured-story">
              <div className="journal-featured-story__media">
                <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=90" alt="A traveler in a mountain landscape" loading="lazy" />
              </div>
              <div className="journal-featured-story__body">
                <p className="journal-featured-story__meta"><span>SUSTAINABILITY</span><span>•</span><span>6 MIN READ</span><span>APR 22, 2025</span></p>
                <h2>How Modern Fashion Can Build a Greener Future</h2>
                <p>From better materials to conscious consumption, explore how fashion can be a force for good.</p>
                <a href="#/journal/the-long-life-of-good-cotton" className="journal-more-link">READ MORE <ArrowIcon /></a>
              </div>
            </article>

            <article className="journal-story-card">
              <div className="journal-story-card__media">
                <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=90" alt="Close-up portrait in a dark studio" loading="lazy" />
              </div>
              <div className="journal-story-card__content">
                <p className="eyebrow eyebrow--light">THE NOVA STORY</p>
                <h3>Crafted for<br />What&apos;s Next.</h3>
                <a href="#/journal" className="journal-story-card__link">WATCH OUR JOURNEY <span className="journal-story-card__play"><PlayIcon /></span></a>
              </div>
            </article>

            <div className="journal-grid">
              {articleCards.map((item) => (
                <article key={item.title} className="journal-grid-card">
                  <a href="#/journal" className="journal-grid-card__link">
                    <img src={`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=900&q=85`} alt={item.title} loading="lazy" />
                    <div className="journal-grid-card__meta">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    <span className="journal-more-link journal-more-link--dark">READ MORE <ArrowIcon /></span>
                  </a>
                </article>
              ))}
            </div>
          </div>

          <aside className="journal-latest">
            <p className="journal-section-label">LATEST</p>
            <ul className="journal-latest__list">
              {latestArticles.map((item) => (
                <li key={item.title} className="journal-latest__item">
                  <img src={`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=300&q=80`} alt={item.title} loading="lazy" />
                  <div>
                    <h4>{item.title}</h4>
                    <span>{item.date}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="journal-newsletter">
              <p className="journal-section-label">NEWSLETTER</p>
              <p className="journal-newsletter__text">Get the latest stories, style drops and exclusive updates.</p>
              <div className="journal-newsletter__form">
                <input type="email" aria-label="Email address" placeholder="Your email address" />
                <button type="button" aria-label="Subscribe to newsletter">→</button>
              </div>
              <p className="journal-newsletter__note">No spam. Just good reads.</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
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

function EmptyState({ title, copy, action, onClick, icon: Icon = BoxIcon }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon"><Icon /></div>
      <h2>{title}</h2>
      <p>{copy}</p>
      {action && <button className="btn btn--dark" onClick={onClick}>{action} <ArrowIcon /></button>}
    </div>
  );
}

export { money, collections, articles };