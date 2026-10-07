import { useEffect, useRef, useState } from "react";
import { SearchIcon, UserIcon, HeartIcon, BagIcon, MenuIcon, CloseIcon, ArrowIcon, HomeIcon } from "./Icons.jsx";
import { useDialogFocus } from "../utils/useDialogFocus.js";

const MENU_GROUPS = [
  { title: "New", links: [["New Arrivals", "shop?edit=new-arrivals"], ["Best Sellers", "shop?edit=best-sellers"], ["Trending", "shop?edit=trending"]] },
  { title: "Shop", links: [["Shop all", "shop"], ["Men", "shop?category=Men"], ["Women", "shop?category=Women"], ["Accessories", "shop?category=Accessories"], ["Sale", "sale"]] },
  { title: "Discover", links: [["Collections", "collections"], ["Lookbook", "?section=lookbook"], ["Journal", "journal"]] },
];

function isRouteActive(route, section) {
  const pathname = route.split("?")[0];
  if (section === "home") return pathname === "";
  if (section === "shop") return pathname === "shop" || pathname === "sale";
  return pathname === section || pathname.startsWith(`${section}/`);
}

export default function Navbar({ customer, onLogout, cartCount = 0, wishlistCount = 0, route = "", transparent = false, onNavigate, onSearch, onCart, onWishlist }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountMessage, setAccountMessage] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const navbarRef = useRef(null);
  const shopTriggerRef = useRef(null);
  const accountTriggerRef = useRef(null);
  const accountFirstRef = useRef(null);
  const accountReturnFocusRef = useRef(null);
  const menuTriggerRef = useRef(null);
  const mobileFirstRef = useRef(null);
  const closeTimer = useRef(null);
  const mobileDialogRef = useDialogFocus(menuOpen, () => setMenuOpen(false), mobileFirstRef);

  const navigate = (path) => {
    setMenuOpen(false);
    setShopOpen(false);
    setAccountOpen(false);
    onNavigate(path);
  };

  useEffect(() => {
    if (!transparent) {
      setScrolled(false);
      return undefined;
    }
    const updateScroll = () => setScrolled(window.scrollY > 36);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, [transparent]);

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", menuOpen);
    return () => document.body.classList.remove("mobile-menu-open");
  }, [menuOpen]);

  useEffect(() => {
    if (accountOpen) accountFirstRef.current?.focus();
  }, [accountOpen]);

  useEffect(() => {
    const dismissMenus = (event) => {
      if (event.key === "Escape") {
        if (menuOpen) return;
        if (accountOpen) {
          setAccountOpen(false);
          const returnFocus = accountReturnFocusRef.current;
          if (returnFocus?.isConnected && returnFocus.getClientRects().length) returnFocus.focus();
          else if (menuTriggerRef.current?.getClientRects().length) menuTriggerRef.current.focus();
          else accountTriggerRef.current?.focus();
        } else if (shopOpen) {
          setShopOpen(false);
          shopTriggerRef.current?.focus();
        }
      }
      if (event.type === "pointerdown" && !navbarRef.current?.contains(event.target)) {
        setShopOpen(false);
        setAccountOpen(false);
      }
    };
    document.addEventListener("keydown", dismissMenus);
    document.addEventListener("pointerdown", dismissMenus);
    return () => {
      document.removeEventListener("keydown", dismissMenus);
      document.removeEventListener("pointerdown", dismissMenus);
      window.clearTimeout(closeTimer.current);
    };
  }, [accountOpen, menuOpen, shopOpen]);

  const openShop = () => {
    window.clearTimeout(closeTimer.current);
    setAccountOpen(false);
    setShopOpen(true);
  };
  const closeShopSoon = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setShopOpen(false), 120);
  };
  const followLink = (event, path) => {
    event.preventDefault();
    navigate(path);
  };
  const goToSearch = () => {
    setMenuOpen(false);
    setShopOpen(false);
    setAccountOpen(false);
    onSearch();
  };
  const openWishlist = () => {
    setMenuOpen(false);
    setShopOpen(false);
    setAccountOpen(false);
    onWishlist();
  };
  const openCart = () => {
    setMenuOpen(false);
    setShopOpen(false);
    setAccountOpen(false);
    onCart();
  };
  const showAccount = () => {
    accountReturnFocusRef.current = document.activeElement;
    setMenuOpen(false);
    setShopOpen(false);
    setAccountMessage("");
    setAccountOpen(true);
  };

  return (
    <header ref={navbarRef} className={`navbar ${transparent ? "navbar--overlay" : "navbar--solid"} ${transparent && scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__inner">
        <a href="#/" className="navbar__logo" onClick={(event) => followLink(event, "")}>NOVA</a>
        <nav className="navbar__links" aria-label="Primary">
          <a href="#/" className={`navbar__link ${isRouteActive(route, "home") ? "is-active" : ""}`} aria-current={isRouteActive(route, "home") ? "page" : undefined} onClick={(event) => followLink(event, "")}>Home</a>
          <div className="navbar__shop-wrap" onMouseEnter={openShop} onMouseLeave={closeShopSoon} onFocus={openShop} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setShopOpen(false); }}>
            <button ref={shopTriggerRef} type="button" className={`navbar__link navbar__shop-trigger ${isRouteActive(route, "shop") ? "is-active" : ""}`} aria-haspopup="true" aria-expanded={shopOpen} aria-controls="nova-shop-menu" onClick={() => { setAccountOpen(false); setShopOpen(true); }}>Shop</button>
            <div id="nova-shop-menu" className={`mega-menu ${shopOpen ? "mega-menu--open" : ""}`} aria-hidden={!shopOpen}>
              <nav className="mega-menu__groups" aria-label="Shop categories">
                {MENU_GROUPS.map((group) => <section className="mega-menu__group" key={group.title}>
                  <p className="eyebrow eyebrow--light">{group.title}</p>
                  {group.links.map(([label, path]) => <a href={`#/${path}`} key={label} tabIndex={shopOpen ? 0 : -1} onClick={(event) => followLink(event, path)}>{label}<ArrowIcon /></a>)}
                </section>)}
              </nav>
              <a href="#/collections/winter-26" tabIndex={shopOpen ? 0 : -1} className="mega-menu__feature" onClick={(event) => followLink(event, "collections/winter-26")}><img src="https://images.unsplash.com/photo-1629131678696-0b56fe341b74?auto=format&fit=crop&w=800&q=85" alt="Winter '26 collection" loading="lazy" /><span><small>THE NEW EDIT</small>Winter '26 <ArrowIcon /></span></a>
            </div>
          </div>
          <a href="#/collections" className={`navbar__link ${isRouteActive(route, "collections") ? "is-active" : ""}`} aria-current={isRouteActive(route, "collections") ? "page" : undefined} onClick={(event) => followLink(event, "collections")}>Collections</a>
          <a href="#/about" className={`navbar__link ${isRouteActive(route, "about") ? "is-active" : ""}`} aria-current={isRouteActive(route, "about") ? "page" : undefined} onClick={(event) => followLink(event, "about")}>About</a>
          <a href="#/journal" className={`navbar__link ${isRouteActive(route, "journal") ? "is-active" : ""}`} aria-current={isRouteActive(route, "journal") ? "page" : undefined} onClick={(event) => followLink(event, "journal")}>Journal</a>
        </nav>
        <div className="navbar__actions">
          <button type="button" className="navbar__icon-btn" aria-label="Search" onClick={goToSearch}><SearchIcon /></button>
          <button ref={accountTriggerRef} type="button" className={`navbar__icon-btn ${accountOpen ? "is-active" : ""}`} aria-label="Account" aria-expanded={accountOpen} aria-controls="nova-account-menu" onClick={() => { if (accountOpen) setAccountOpen(false); else showAccount(); }}><UserIcon /></button>
          <button type="button" className={`navbar__icon-btn navbar__wishlist-btn ${isRouteActive(route, "wishlist") || wishlistCount > 0 ? "is-active" : ""}`} aria-label={`Wishlist, ${wishlistCount} saved`} onClick={openWishlist}><HeartIcon />{wishlistCount > 0 && <span className="navbar__badge">{wishlistCount}</span>}</button>
          <button type="button" className="navbar__icon-btn navbar__icon-btn--bag" aria-label={`Bag, ${cartCount} items`} onClick={openCart}><BagIcon /><span className="navbar__badge">{cartCount}</span></button>
          <button ref={menuTriggerRef} type="button" className="navbar__icon-btn navbar__menu-toggle" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="nova-mobile-menu" onClick={() => { setShopOpen(false); setAccountOpen(false); setMenuOpen((value) => !value); }}>{menuOpen ? <CloseIcon /> : <MenuIcon />}</button>
        </div>
        {accountOpen && <div id="nova-account-menu" className="account-menu" role="region" aria-label="NOVA account access">
          <p className="eyebrow eyebrow--dark">Your NOVA</p>
          {customer ? (
            <>
              <h2>Welcome, {customer.name.split(" ")[0]}.</h2>
              <p className="account-menu__copy">Access your orders, saved items, and account details.</p>
              <div className="account-menu__actions">
                <button type="button" onClick={() => navigate("account")}>Go to Account</button>
                <button type="button" onClick={() => { onLogout(); setAccountOpen(false); }}>Sign out</button>
              </div>
            </>
          ) : (
            <>
              <h2>Welcome.</h2>
              <p className="account-menu__copy">Sign in to access your orders and saved items.</p>
              <div className="account-menu__actions">
                <button ref={accountFirstRef} type="button" onClick={() => navigate("auth")}>Sign in / Register</button>
              </div>
            </>
          )}
        </div>}
      </div>
      {menuOpen && <div className="mobile-nav-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setMenuOpen(false)}>
        <nav ref={mobileDialogRef} id="nova-mobile-menu" className="mobile-nav" role="dialog" aria-modal="true" aria-label="Mobile navigation" tabIndex={-1}>
          <div className="mobile-nav__head"><a href="#/" className="navbar__logo" onClick={(event) => followLink(event, "")}>NOVA</a><button type="button" className="icon-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}><CloseIcon /></button></div>
          <a ref={mobileFirstRef} href="#/" className="mobile-nav__link" onClick={(event) => followLink(event, "")}>Home</a>
          <button type="button" className="mobile-nav__link mobile-nav__shop" aria-expanded={shopOpen} aria-controls="nova-mobile-shop" onClick={() => setShopOpen((open) => !open)}>Shop <span>{shopOpen ? "−" : "+"}</span></button>
          <div id="nova-mobile-shop" className={`mobile-nav__subnav ${shopOpen ? "is-open" : ""}`} aria-hidden={!shopOpen}>
            <div className="mobile-nav__subnav-inner">{[ ["Shop all", "shop"], ["New Arrivals", "shop?edit=new-arrivals"], ["Men", "shop?category=Men"], ["Women", "shop?category=Women"], ["Accessories", "shop?category=Accessories"], ["Sale", "sale"] ].map(([label, path]) => <a href={`#/${path}`} tabIndex={shopOpen ? 0 : -1} key={label} onClick={(event) => followLink(event, path)}>{label}</a>)}</div>
          </div>
          <a href="#/collections" className="mobile-nav__link" onClick={(event) => followLink(event, "collections")}>Collections</a>
          <a href="#/journal" className="mobile-nav__link" onClick={(event) => followLink(event, "journal")}>Journal</a>
          <a href="#/about" className="mobile-nav__link" onClick={(event) => followLink(event, "about")}>About</a>
          <div className="mobile-nav__secondary"><button type="button" onClick={showAccount}>Account</button><a href="#/wishlist" onClick={(event) => followLink(event, "wishlist")}>Wishlist{wishlistCount ? ` (${wishlistCount})` : ""}</a><a href="#/contact" onClick={(event) => followLink(event, "contact")}>Support</a></div>
          <button type="button" className="mobile-nav__search" onClick={goToSearch}><SearchIcon /> Search NOVA</button>
        </nav>
      </div>}
      <nav className="mobile-bottom-nav" aria-label="Quick navigation">
        <a href="#/" className={isRouteActive(route, "home") ? "is-active" : ""} aria-current={isRouteActive(route, "home") ? "page" : undefined} onClick={(event) => followLink(event, "")}><HomeIcon /><span>Home</span></a>
        <a href="#/shop" className={isRouteActive(route, "shop") ? "is-active" : ""} aria-current={isRouteActive(route, "shop") ? "page" : undefined} onClick={(event) => followLink(event, "shop")}><MenuIcon /><span>Shop</span></a>
        <button type="button" onClick={goToSearch} aria-label="Search"><SearchIcon /><span>Search</span></button>
        <a href="#/wishlist" className={isRouteActive(route, "wishlist") ? "is-active" : ""} aria-current={isRouteActive(route, "wishlist") ? "page" : undefined} onClick={(event) => followLink(event, "wishlist")} aria-label={`Wishlist, ${wishlistCount} saved`}><span className="mobile-bottom-nav__icon"><HeartIcon />{wishlistCount > 0 && <i>{wishlistCount}</i>}</span><span>Wishlist</span></a>
        <button type="button" onClick={openCart} aria-label={`Bag, ${cartCount} items`}><span className="mobile-bottom-nav__icon"><BagIcon />{cartCount > 0 && <i>{cartCount}</i>}</span><span>Bag</span></button>
      </nav>
    </header>
  );
}
