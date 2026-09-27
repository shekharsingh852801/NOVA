import { useState } from "react";
import { SearchIcon, UserIcon, HeartIcon, BagIcon, MenuIcon, CloseIcon } from "./Icons.jsx";

const LINKS = ["Home", "Shop", "Collections", "About", "Journal"];

export default function Navbar({ cartCount = 0 }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <a href="#top" className="navbar__logo">
          NOVA
        </a>

        <nav className={`navbar__links ${open ? "navbar__links--open" : ""}`} aria-label="Primary">
          {LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="navbar__link"
              onClick={() => setOpen(false)}
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="navbar__actions">
          <button className="navbar__icon-btn" aria-label="Search">
            <SearchIcon />
          </button>
          <button className="navbar__icon-btn" aria-label="Account">
            <UserIcon />
          </button>
          <button className="navbar__icon-btn" aria-label="Wishlist">
            <HeartIcon />
          </button>
          <button className="navbar__icon-btn navbar__icon-btn--bag" aria-label="Cart">
            <BagIcon />
            <span className="navbar__badge">{cartCount}</span>
          </button>
          <button
            className="navbar__icon-btn navbar__menu-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
