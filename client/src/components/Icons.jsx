// Small, dependency-free inline icons matching the reference design.
export const SearchIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const UserIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1.6-3.6 5-5.5 8-5.5s6.4 1.9 8 5.5" />
  </svg>
);

export const HeartIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path d="M12 20.5s-7.5-4.6-9.8-9.1C.6 8 2 4.5 5.4 4c2-.3 3.9.6 5 2.3C11.5 4.6 13.4 3.7 15.4 4c3.4.5 4.8 4 3.2 7.4C16.3 15.9 12 20.5 12 20.5Z" />
  </svg>
);

export const BagIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);

export const PlayIcon = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" {...props}>
    <path d="M7 5v14l12-7z" />
  </svg>
);

export const ArrowIcon = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <line x1="4" y1="12" x2="20" y2="12" />
    <polyline points="14 6 20 12 14 18" />
  </svg>
);

export const PlusIcon = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const ChevronIcon = ({ direction = "left", ...props }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <polyline points={direction === "left" ? "15 6 9 12 15 18" : "9 6 15 12 9 18"} />
  </svg>
);

export const StarIcon = ({ filled = true, ...props }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2" {...props}>
    <polygon points="12 2.5 15.1 8.9 22.2 9.9 17.1 14.8 18.3 21.9 12 18.6 5.7 21.9 6.9 14.8 1.8 9.9 8.9 8.9" />
  </svg>
);

export const CheckIcon = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const MenuIcon = (props) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const CloseIcon = (props) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="6" y1="18" x2="18" y2="6" />
  </svg>
);

export const LeafIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M5 20c8 0 14-6 14-14-8 0-14 6-14 14Z" />
    <path d="M5 20c0-5 3-9 8-11" />
  </svg>
);

export const BoxIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M3 8l9-4 9 4-9 4-9-4Z" />
    <path d="M3 8v8l9 4 9-4V8" />
    <path d="M12 12v8" />
  </svg>
);

export const TruckIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <rect x="1" y="7" width="13" height="9" rx="1" />
    <path d="M14 10h4l3 3v3h-7z" />
    <circle cx="6" cy="18" r="1.6" />
    <circle cx="17" cy="18" r="1.6" />
  </svg>
);

export const RefreshIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M4 4v5h5" />
    <path d="M20 20v-5h-5" />
    <path d="M4.5 15a8 8 0 0 0 14.4 2.5M19.5 9A8 8 0 0 0 5.1 6.5" />
  </svg>
);

export const RecycleIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M7 19H5a2 2 0 0 1-1.7-3l3-5" />
    <path d="M9 3h4l3 5" />
    <path d="M18 13l2 4-2 3" />
    <path d="M13 3l3 5-2.6 1.5M4.3 16l2.6-1.5M17 21h-3l-1.6-2.6" />
  </svg>
);

export const ShieldIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

export const PackageIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <rect x="3" y="8" width="18" height="12" rx="1" />
    <path d="M3 8l3-4h12l3 4" />
    <path d="M9 12h6" />
  </svg>
);
