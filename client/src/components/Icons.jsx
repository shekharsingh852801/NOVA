// Small, dependency-free inline icons matching the reference design.
export const SearchIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const HomeIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" />
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

export const BellIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M15 18H9" />
    <path d="M18 18H6l1.2-1.3A3 3 0 0 0 8 14.7V11a4 4 0 1 1 8 0v3.7a3 3 0 0 0 .8 2l1.2 1.3Z" />
    <path d="M10 18a2 2 0 0 0 4 0" />
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

export const MailIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export const LockIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const EyeIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);
