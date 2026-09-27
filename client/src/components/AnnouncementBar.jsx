import { ChevronIcon } from "./Icons.jsx";

export default function AnnouncementBar() {
  return (
    <div className="announcement-bar" role="note">
      <button className="announcement-bar__arrow" aria-label="Previous announcement">
        <ChevronIcon direction="left" width="14" height="14" />
      </button>
      <p className="announcement-bar__text">
        Free shipping on orders over $75&ensp;|&ensp;15% off your first order. Use code:{" "}
        <strong>WELCOME15</strong>
      </p>
      <button className="announcement-bar__arrow" aria-label="Next announcement">
        <ChevronIcon direction="right" width="14" height="14" />
      </button>
    </div>
  );
}
