import { useState } from "react";
import { ChevronIcon } from "./Icons.jsx";

const announcements = [
  { message: "Free shipping on orders over $75." },
  { message: "15% off your first order. Use code:", code: "WELCOME15" },
];

export default function AnnouncementBar({ content }) {
  const announcements = content?.messages?.length ? content.messages : [
    { message: "Free shipping on orders over $75." },
    { message: "15% off your first order. Use code:", code: "WELCOME15" },
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const announcement = announcements[activeIndex % announcements.length];
  const move = (direction) => setActiveIndex((current) => (current + direction + announcements.length) % announcements.length);

  return (
    <div className="announcement-bar" role="note">
      {announcements.length > 1 && <button type="button" className="announcement-bar__arrow" aria-label="Previous announcement" onClick={() => move(-1)}>
        <ChevronIcon direction="left" width="14" height="14" />
      </button>}
      <p className="announcement-bar__text" aria-live="polite" aria-atomic="true">
        {announcement.message}{announcement.code && <> <strong>{announcement.code}</strong></>}
      </p>
      {announcements.length > 1 && <button type="button" className="announcement-bar__arrow" aria-label="Next announcement" onClick={() => move(1)}>
        <ChevronIcon direction="right" width="14" height="14" />
      </button>}
    </div>
  );
}
