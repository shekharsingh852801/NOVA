import { useState } from "react";
import { SearchIcon, UserIcon, HeartIcon, BagIcon, MenuIcon, CloseIcon, ArrowIcon } from "./Icons.jsx";

const SHOP_LINKS = [
  ["New Arrivals", "shop?sort=newest"],
  ["Best Sellers", "shop?sort=popular"],
  ["Men", "shop?category=Men"],
  ["Women", "shop?category=Women"],
  ["Accessories", "shop?category=Accessories"],
  ["Sale", "sale"],
];

export default function Navbar({ cartCount = 0, transparent = false, onNavigate, onSearch, onCart, onWishlist, onAccount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const navigate = (path) => {
    setMenuOpen(false);
    setShopOpen(false);
    onNavigate(path);
  };

  return (
    <header className={`navbar ${transparent ? "navbar--overlay" : "navbar--solid"}`} onMouseLeave={() => setShopOpen(false)}>
      <div className="navbar__inner">
        <a href="#/" className="navbar__logo" onClick={() => navigate("")}>NOVA</a>
        <nav className={`navbar__links ${menuOpen ? "navbar__links--open" : ""}`} aria-label="Primary">
          <a href="#/" className="navbar__link" onClick={() => navigate("")}>Home</a>
          <div className="navbar__shop-wrap" onMouseEnter={() => setShopOpen(true)}>
            <a href="#/shop" className="navbar__link" aria-haspopup="true" aria-expanded={shopOpen} onFocus={() => setShopOpen(true)} onClick={(event) => { event.preventDefault(); navigate("shop"); setShopOpen(true); }}>Shop</a>
            <div className={`mega-menu ${shopOpen ? "mega-menu--open" : ""}`}>
              <div className="mega-menu__links"><p className="eyebrow eyebrow--light">Explore NOVA</p>{SHOP_LINKS.map(([label, path]) => <a href={`#/${path}`} key={label} onClick={() => navigate(path)}>{label}<ArrowIcon /></a>)}</div>
              <a href="#/collections/winter-26" className="mega-menu__feature" onClick={() => navigate("collections/winter-26")}><img src="https://images.unsplash.com/photo-1629131678696-0b56fe341b74?auto=format&fit=crop&w=800&q=85" alt="Winter '26 collection" /><span><small>THE NEW EDIT</small>Winter '26 <ArrowIcon /></span></a>
            </div>
          </div>
          <a href="#/collections" className="navbar__link" onClick={() => navigate("collections")}>Collections</a>
          <a href="#/about" className="navbar__link" onClick={() => navigate("about")}>About</a>
          <a href="#/journal" className="navbar__link" onClick={() => navigate("journal")}>Journal</a>
          <div className="navbar__mobile-links"><a href="#/shop" onClick={() => navigate("shop")}>Shop all</a><a href="#/shop?category=Men" onClick={() => navigate("shop?category=Men")}>Men</a><a href="#/shop?category=Women" onClick={() => navigate("shop?category=Women")}>Women</a><a href="#/shop?category=Accessories" onClick={() => navigate("shop?category=Accessories")}>Accessories</a><a href="#/sale" onClick={() => navigate("sale")}>Sale</a><a href="#/contact" onClick={() => navigate("contact")}>Contact</a><a href="#/tracking" onClick={() => navigate("tracking")}>Track an order</a></div>
        </nav>
        <div className="navbar__actions">
          <button className="navbar__icon-btn" aria-label="Search" onClick={onSearch}><SearchIcon /></button>
          <button className="navbar__icon-btn" aria-label="Account" onClick={onAccount}><UserIcon /></button>
          <button className="navbar__icon-btn" aria-label="Wishlist" onClick={onWishlist}><HeartIcon /></button>
          <button className="navbar__icon-btn navbar__icon-btn--bag" aria-label={`Cart, ${cartCount} items`} onClick={onCart}><BagIcon /><span className="navbar__badge">{cartCount}</span></button>
          <button className="navbar__icon-btn navbar__menu-toggle" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <CloseIcon /> : <MenuIcon />}</button>
        </div>
      </div>
    </header>
  );
}
